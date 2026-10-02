import { NextResponse } from "next/server";
import { authorize } from "@/lib/server/auth";
import { checked } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { reportServerError } from "@/lib/server/report-error";
import { z } from "zod";
export const dynamic = "force-dynamic";
// Admin: Training Centre accounts that exist but have no course registration yet,
// so a new sign-up is never invisible in the Students tab.
export async function GET(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db } = auth;
    const users = [];
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < 200) break;
    }
    const training = users.filter((u) => u.user_metadata?.training_signup);
    const withOrders = new Set(
      (checked(await db.from("pwd_lms_orders").select("user_id").limit(10000)) || []).map((o) => o.user_id as string),
    );
    const without = training.filter((u) => !withOrders.has(u.id));
    const ids = without.map((u) => u.id);
    const [profiles, affiliates, instructors] = ids.length
      ? await Promise.all([
          db.from("pwd_lms_profiles").select("user_id,full_name,phone,city").in("user_id", ids),
          db.from("pwd_lms_affiliates").select("user_id,status").in("user_id", ids),
          db.from("pwd_lms_course_instructors").select("user_id").in("user_id", ids),
        ])
      : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];
    const p = checked(profiles) || [], a = checked(affiliates) || [], t = checked(instructors) || [];
    return NextResponse.json(
      {
        accounts: without
          .map((u) => {
            const profile = p.find((x) => x.user_id === u.id);
            return {
              user_id: u.id,
              email: u.email || "",
              name: profile?.full_name || String(u.user_metadata?.full_name || ""),
              phone: profile?.phone || "",
              city: profile?.city || "",
              created_at: u.created_at,
              last_sign_in_at: u.last_sign_in_at || null,
              role: t.some((x) => x.user_id === u.id)
                ? "Instructor"
                : a.some((x) => x.user_id === u.id)
                  ? "Affiliate"
                  : "No course yet",
            };
          })
          .sort((x, y) => y.created_at.localeCompare(x.created_at)),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e, "lms-students/get");
  }
}

const deleteAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("delete_registration"), order_id: z.uuid() }),
  z.object({ action: z.literal("delete_student"), user_id: z.uuid() }),
]);
type Removed = { proofs?: string[]; recordings?: string[]; avatars?: string[]; chat_files?: string[] };
// Admin: permanently delete one registration, or a whole student account (database work is one transaction).
export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db, user } = auth;
    const input = await readJson(request, deleteAction);
    const { data, error } =
      input.action === "delete_registration"
        ? await db.rpc("pwd_lms_delete_registration", { p_order: input.order_id })
        : await db.rpc("pwd_lms_delete_student", { p_user: input.user_id });
    if (error) {
      // Safeguard messages from the database are shown to the admin as-is.
      if (/cannot be deleted|not found|admin account|instructor/i.test(error.message)) throw new HttpError(409, error.message);
      throw error;
    }
    const removed = (data || {}) as Removed;
    // Files live outside the database; remove them after the records are gone. Best effort.
    const buckets: [string, string[] | undefined][] = [
      ["pwd-training-proofs", removed.proofs],
      ["pwd-mentorship-recordings", removed.recordings],
      ["pwd-student-avatars", removed.avatars],
      ["pwd-community-files", removed.chat_files],
    ];
    for (const [bucket, paths] of buckets)
      if (paths?.length) {
        const { error: storageError } = await db.storage.from(bucket).remove(paths);
        if (storageError) await reportServerError("lms-students/delete-files", storageError);
      }
    await db.from("pwd_lms_audit").insert({
      actor_id: user.id,
      action: input.action,
      target_id: input.action === "delete_registration" ? input.order_id : input.user_id,
    });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-students/delete");
  }
}
