import "server-only";
import { student, checked } from "./lms";
import { ADMIN_SITE_ID } from "./auth";
import { HttpError } from "./http";
export async function access(request: Request, courseId: string) {
  const { db, user } = await student(request);
  const [c, a, o] = await Promise.all([
    db
      .from("pwd_lms_courses")
      .select("id,private_sessions")
      .eq("id", courseId)
      .maybeSingle(),
    db
      .from("admin_users")
      .select("name,role,is_active")
      .eq("email", user.email!)
      .eq("site_id", ADMIN_SITE_ID)
      .maybeSingle(),
    db
      .from("pwd_lms_orders")
      .select("name,status")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const course = checked(c),
    admin = checked(a),
    order = checked(o);
  const instructor = Boolean(
    admin?.is_active && ["admin", "super_admin"].includes(admin.role),
  );
  if (!course) throw new HttpError(404, "Course not found.");
  if (!instructor && !["paid", "granted"].includes(order?.status || ""))
    throw new HttpError(
      403,
      "Community opens after your course payment is confirmed.",
    );
  return {
    db,
    user,
    instructor,
    privateCourse: Boolean(course.private_sessions),
    name: instructor ? admin?.name || "Instructor" : order?.name || "Student",
  };
}
export async function channelAccess(
  ctx: Awaited<ReturnType<typeof access>>,
  courseId: string,
  id: string,
) {
  const channel = checked(
    await ctx.db
      .from("pwd_lms_channels")
      .select("*")
      .eq("id", id)
      .eq("course_id", courseId)
      .maybeSingle(),
  );
  if (!channel || (ctx.privateCourse && !channel.private)) throw new HttpError(404, "Group not found.");
  if (channel.private && !ctx.instructor) {
    const member = checked(
      await ctx.db
        .from("pwd_lms_channel_members")
        .select("user_id")
        .eq("channel_id", id)
        .eq("user_id", ctx.user.id)
        .maybeSingle(),
    );
    if (!member)
      throw new HttpError(403, "This group is private to its members.");
  }
  return channel;
}
