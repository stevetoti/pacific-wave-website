import { NextResponse, after } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { authorize } from "@/lib/server/auth";
import { checked, student } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getSupabaseAdmin } from "@/lib/server/clients";
import { instructorCourseIds, isAdmin } from "@/lib/server/teaching";
import { sendInstructorInvite } from "@/lib/server/instructors";
export const dynamic = "force-dynamic";
const json = (d: unknown, cache = "no-store") =>
  NextResponse.json(d, { headers: { "Cache-Control": cache } });
type InstructorRow = {
  user_id: string;
  email: string;
  full_name: string;
  instructor_title: string;
  expertise: string;
  bio: string;
  avatar_path: string;
  course_ids: string[];
  last_sign_in_at: string | null;
};
async function avatarUrl(path: string, seconds: number) {
  if (!path) return "";
  const { data } = await getSupabaseAdmin()
    .storage.from("pwd-student-avatars")
    .createSignedUrl(path, seconds);
  return data?.signedUrl || "";
}
const adminAction = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("invite"),
    email: z.email().max(254).transform((v) => v.trim().toLowerCase()),
    full_name: z.string().trim().min(2).max(120),
    instructor_title: z.string().trim().max(120).default(""),
    course_ids: z.array(z.uuid()).min(1).max(50),
  }),
  z.object({
    action: z.literal("assign"),
    user_id: z.uuid(),
    course_ids: z.array(z.uuid()).max(50),
  }),
  z.object({ action: z.literal("resend"), user_id: z.uuid() }),
]);
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope");
    const db = getSupabaseAdmin();
    if (scope === "public") {
      // Public instructor cards for a course page. No email or private details.
      const slug = z
        .string()
        .regex(/^[a-z0-9-]{1,100}$/)
        .parse(url.searchParams.get("course"));
      const course = checked(
        await db
          .from("pwd_lms_courses")
          .select("id")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle(),
      );
      if (!course) return json({ instructors: [] }, "public, max-age=300");
      const rows = (checked(await db.rpc("pwd_lms_instructor_list")) ||
        []) as InstructorRow[];
      const instructors = await Promise.all(
        rows
          .filter((r) => r.course_ids.includes(course.id) && r.full_name)
          .map(async (r) => ({
            name: r.full_name,
            title: r.instructor_title,
            expertise: r.expertise,
            bio: r.bio,
            avatar_url: await avatarUrl(r.avatar_path, 86400),
          })),
      );
      return json({ instructors }, "public, max-age=300");
    }
    if (scope === "me") {
      // Lets the navigation know whether to show the Teaching workspace.
      const { db: sdb, user } = await student(request);
      const [admin, ids] = await Promise.all([
        isAdmin(sdb, user.email!),
        instructorCourseIds(sdb, user.id),
      ]);
      return json({ admin, instructor: ids.length > 0, course_ids: ids });
    }
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const rows = (checked(await auth.db.rpc("pwd_lms_instructor_list")) ||
      []) as InstructorRow[];
    return json({
      instructors: await Promise.all(
        rows.map(async (r) => ({
          ...r,
          avatar_path: undefined,
          avatar_url: await avatarUrl(r.avatar_path, 3600),
        })),
      ),
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-instructors/get");
  }
}
export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db, user } = auth;
    await rateLimit(request, `lms-instructors-${user.id}`, 60);
    const input = await readJson(request, adminAction);
    if (input.action === "invite") {
      const courses = checked(
        await db.from("pwd_lms_courses").select("id").in("id", input.course_ids),
      );
      if ((courses || []).length !== new Set(input.course_ids).size)
        throw new HttpError(400, "Choose existing courses.");
      const found = (checked(
        await db.rpc("pwd_lms_user_by_email", { p_email: input.email }),
      ) || []) as { id: string }[];
      let userId = found[0]?.id;
      const isNew = !userId;
      if (isNew) {
        // New instructors get a confirmed account and set their own password from the invite link.
        const created = await db.auth.admin.createUser({
          email: input.email,
          password: randomBytes(24).toString("base64url"),
          email_confirm: true,
          user_metadata: { full_name: input.full_name, training_signup: true, instructor_invited: true },
        });
        if (created.error || !created.data.user)
          throw created.error || Error("Instructor account unavailable");
        userId = created.data.user.id;
      }
      const existing = checked(
        await db
          .from("pwd_lms_profiles")
          .select("full_name,instructor_title")
          .eq("user_id", userId)
          .maybeSingle(),
      );
      if (!existing)
        checked(
          await db.from("pwd_lms_profiles").insert({
            user_id: userId,
            full_name: input.full_name,
            instructor_title: input.instructor_title,
          }),
        );
      else if (input.instructor_title && !existing.instructor_title)
        checked(
          await db
            .from("pwd_lms_profiles")
            .update({ instructor_title: input.instructor_title })
            .eq("user_id", userId),
        );
      checked(
        await db.from("pwd_lms_course_instructors").upsert(
          input.course_ids.map((course_id) => ({
            course_id,
            user_id: userId,
            added_by: user.id,
          })),
          { onConflict: "course_id,user_id", ignoreDuplicates: true },
        ),
      );
      checked(
        await db.from("pwd_lms_audit").insert({
          actor_id: user.id,
          action: "instructor_invite",
          target_id: userId,
        }),
      );
      after(() =>
        sendInstructorInvite({
          userId: userId!,
          email: input.email,
          name: existing?.full_name || input.full_name,
          newAccount: isNew,
        }),
      );
      return json({ success: true, user_id: userId, new_account: isNew });
    }
    if (input.action === "resend") {
      const found = checked(
        await db
          .from("pwd_lms_course_instructors")
          .select("user_id")
          .eq("user_id", input.user_id)
          .limit(1),
      );
      if (!found?.length) throw new HttpError(404, "Instructor not found.");
      const { data } = await db.auth.admin.getUserById(input.user_id);
      if (!data.user?.email) throw new HttpError(404, "Instructor not found.");
      const profile = checked(
        await db
          .from("pwd_lms_profiles")
          .select("full_name")
          .eq("user_id", input.user_id)
          .maybeSingle(),
      );
      after(() =>
        sendInstructorInvite({
          userId: input.user_id,
          email: data.user!.email!,
          name: profile?.full_name || "",
          newAccount: !data.user!.last_sign_in_at,
        }),
      );
      return json({ success: true });
    }
    // Replace the instructor's course list; an empty list removes them as an instructor.
    const current = (
      checked(
        await db
          .from("pwd_lms_course_instructors")
          .select("course_id")
          .eq("user_id", input.user_id),
      ) || []
    ).map((r) => r.course_id as string);
    const remove = current.filter((id) => !input.course_ids.includes(id));
    const add = input.course_ids.filter((id) => !current.includes(id));
    if (remove.length)
      checked(
        await db
          .from("pwd_lms_course_instructors")
          .delete()
          .eq("user_id", input.user_id)
          .in("course_id", remove),
      );
    if (add.length)
      checked(
        await db.from("pwd_lms_course_instructors").insert(
          add.map((course_id) => ({
            course_id,
            user_id: input.user_id,
            added_by: user.id,
          })),
        ),
      );
    checked(
      await db.from("pwd_lms_audit").insert({
        actor_id: user.id,
        action: input.course_ids.length ? "instructor_assign" : "instructor_remove",
        target_id: input.user_id,
      }),
    );
    return json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-instructors/post");
  }
}
