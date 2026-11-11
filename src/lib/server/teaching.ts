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
async function instructorAssignments(db: SupabaseClient, userId: string) {
  return checked(
    await db
      .from("pwd_lms_course_instructors")
      .select("course_id,can_follow_up_unpaid")
      .eq("user_id", userId),
  ) || [];
}

export async function instructorCourseIds(db: SupabaseClient, userId: string) {
  return (await instructorAssignments(db, userId)).map((row) => row.course_id);
}

export const enrolledStatuses = ["paid", "granted"];
const unpaidStatuses = ["pending", "rejected"];

export async function teachingAccess(request: Request) {
  const { db, user } = await student(request);
  const admin = await isAdmin(db, user.email!);
  const assignments = admin ? [] : await instructorAssignments(db, user.id);
  const courseIds = admin ? null : assignments.map((row) => row.course_id);
  const unpaidCourseIds = assignments
    .filter((row) => row.can_follow_up_unpaid)
    .map((row) => row.course_id);
  if (!admin && !courseIds!.length)
    throw new HttpError(403, "You are not an instructor on any course yet.");
  return {
    db,
    user,
    admin,
    courseIds,
    registrationFilter: [
      `and(course_id.in.(${courseIds?.join(",")}),status.in.(${enrolledStatuses.join(",")}))`,
      ...(unpaidCourseIds.length
        ? [`and(course_id.in.(${unpaidCourseIds.join(",")}),status.in.(${unpaidStatuses.join(",")}))`]
        : []),
    ].join(","),
    canFollowUpRegistration(order: { course_id: string; status: string }, channel: string) {
      if (admin) return true;
      if (enrolledStatuses.includes(order.status)) return courseIds!.includes(order.course_id);
      return (channel === "email" || channel === "sms") &&
        unpaidStatuses.includes(order.status) && unpaidCourseIds.includes(order.course_id);
    },
    teaches: (courseId: string) => admin || courseIds!.includes(courseId),
    assertCourse(courseId: string) {
      if (!admin && !courseIds!.includes(courseId))
        throw new HttpError(403, "You are not an instructor on this course.");
    },
  };
}
export type TeachingAccess = Awaited<ReturnType<typeof teachingAccess>>;
