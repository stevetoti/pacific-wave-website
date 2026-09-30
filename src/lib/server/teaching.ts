import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_ROLES, ADMIN_SITE_ID } from "./auth";
import { checked, student } from "./lms";
import { HttpError } from "./http";
// Admins manage every course; instructors only the courses they are assigned to.
export async function isAdmin(db: SupabaseClient, email: string) {
  const row = checked(
    await db
      .from("admin_users")
      .select("role,is_active")
      .eq("email", email)
      .eq("site_id", ADMIN_SITE_ID)
      .maybeSingle(),
  );
  return Boolean(row?.is_active && ADMIN_ROLES.includes(row.role));
}
export async function instructorCourseIds(db: SupabaseClient, userId: string) {
  const rows = checked(
    await db
      .from("pwd_lms_course_instructors")
      .select("course_id")
      .eq("user_id", userId),
  );
  return (rows || []).map((r) => r.course_id as string);
}
export async function teachingAccess(request: Request) {
  const { db, user } = await student(request);
  const admin = await isAdmin(db, user.email!);
  const courseIds = admin ? null : await instructorCourseIds(db, user.id);
  if (!admin && !courseIds!.length)
    throw new HttpError(403, "You are not an instructor on any course yet.");
  return {
    db,
    user,
    admin,
    courseIds,
    teaches: (courseId: string) => admin || courseIds!.includes(courseId),
    assertCourse(courseId: string) {
      if (!admin && !courseIds!.includes(courseId))
        throw new HttpError(403, "You are not an instructor on this course.");
    },
  };
}
export type TeachingAccess = Awaited<ReturnType<typeof teachingAccess>>;
