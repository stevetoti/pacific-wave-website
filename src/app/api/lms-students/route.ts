import { NextResponse } from "next/server";
import { authorize } from "@/lib/server/auth";
import { checked } from "@/lib/server/lms";
import { apiError } from "@/lib/server/http";
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
