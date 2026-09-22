import { NextResponse } from "next/server";
import { z } from "zod";
import { student, checked } from "@/lib/server/lms";
import { ADMIN_SITE_ID } from "@/lib/server/auth";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
async function access(request: Request, courseId: string) {
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
  if (!course || course.private_sessions)
    throw new HttpError(404, "Community is available in group courses only.");
  if (!instructor && !["paid", "granted"].includes(order?.status || ""))
    throw new HttpError(
      403,
      "Community opens after your course payment is confirmed.",
    );
  return {
    db,
    user,
    instructor,
    name: instructor ? admin?.name || "Instructor" : order?.name || "Student",
  };
}
async function channelAccess(
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
  if (!channel) throw new HttpError(404, "Group not found.");
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
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams,
      courseId = z.uuid().parse(q.get("course"));
    const ctx = await access(request, courseId),
      { db, user, instructor } = ctx;
    const channelId = q.get("channel");
    if (channelId) {
      const channel = await channelAccess(
        ctx,
        courseId,
        z.uuid().parse(channelId),
      );
      const before = q.get("before");
      let query = db
        .from("pwd_lms_messages")
        .select("id,user_id,author_name,instructor,body,deleted,created_at")
        .eq("channel_id", channel.id)
        .order("id", { ascending: false })
        .limit(50);
      if (before)
        query = query.lt("id", z.string().regex(/^\d+$/).parse(before));
      const messages = checked(await query)!.map((m) => ({
        ...m,
        body: m.deleted ? "Message removed" : m.body,
      }));
      const members = instructor
        ? checked(
            await db
              .from("pwd_lms_channel_members")
              .select("user_id")
              .eq("channel_id", channel.id),
          )!.map((m) => m.user_id)
        : [];
      return json({
        messages: messages.reverse(),
        has_more: messages.length === 50,
        members,
      });
    }
    const [channels, members, people] = await Promise.all([
      db
        .from("pwd_lms_channels")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at"),
      db
        .from("pwd_lms_channel_members")
        .select("channel_id")
        .eq("user_id", user.id),
      instructor
        ? db
            .from("pwd_lms_orders")
            .select("user_id,name")
            .eq("course_id", courseId)
            .in("status", ["paid", "granted"])
        : Promise.resolve({ data: [], error: null }),
    ]);
    const memberIds = new Set(checked(members)!.map((m) => m.channel_id));
    return json({
      channels: checked(channels)!.filter(
        (c) => !c.private || instructor || memberIds.has(c.id),
      ),
      instructor,
      user_id: user.id,
      people: checked(people),
    });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("Invalid community request.");
    return apiError(e, "community/read");
  }
}
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("send"),
    course: z.uuid(),
    channel: z.uuid(),
    body: z.string().trim().min(1).max(2000),
    client_id: z.uuid(),
  }),
  z.object({
    action: z.literal("create"),
    course: z.uuid(),
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(500),
    private: z.boolean(),
    members: z.array(z.uuid()).max(200),
  }),
  z.object({
    action: z.literal("members"),
    course: z.uuid(),
    channel: z.uuid(),
    members: z.array(z.uuid()).max(200),
  }),
  z.object({
    action: z.literal("delete"),
    course: z.uuid(),
    channel: z.uuid(),
    id: z.number().int().positive(),
  }),
]);
export async function POST(request: Request) {
  try {
    const input = await readJson(request, schema),
      ctx = await access(request, input.course),
      { db, user, instructor, name } = ctx;
    await rateLimit(request, `community-${user.id}`, 100);
    if (input.action === "create" || input.action === "members") {
      if (!instructor)
        throw new HttpError(403, "Only instructors can manage course groups.");
      const paid = checked(
        await db
          .from("pwd_lms_orders")
          .select("user_id")
          .eq("course_id", input.course)
          .in("status", ["paid", "granted"]),
      );
      if (input.members.some((id) => !paid!.some((o) => o.user_id === id)))
        throw new HttpError(400, "Choose enrolled students from this course.");
      let channel;
      if (input.action === "create") {
        const result = await db
          .from("pwd_lms_channels")
          .insert({
            course_id: input.course,
            name: input.name,
            description: input.description,
            private: input.private,
            created_by: user.id,
          })
          .select()
          .single();
        if (result.error?.code === "23505")
          throw new HttpError(409, "A group with this name already exists.");
        channel = checked(result);
      } else channel = await channelAccess(ctx, input.course, input.channel);
      if (!channel) throw new HttpError(404, "Group unavailable.");
      // Replace membership atomically so private groups are never partially reconfigured.
      checked(
        await db.rpc("pwd_lms_set_group_members", {
          group_id: channel.id,
          member_ids: Array.from(new Set(input.members)),
        }),
      );
      return json({ id: channel.id });
    }
    const channel = await channelAccess(ctx, input.course, input.channel);
    if (input.action === "send") {
      if (channel.announcements && !instructor)
        throw new HttpError(403, "Only instructors can post announcements.");
      checked(
        await db.from("pwd_lms_messages").upsert(
          {
            channel_id: channel.id,
            user_id: user.id,
            author_name: name,
            instructor,
            body: input.body,
            client_id: input.client_id,
          },
          { onConflict: "user_id,client_id", ignoreDuplicates: true },
        ),
      );
    } else {
      let deletion = db
        .from("pwd_lms_messages")
        .update({ deleted: true, body: "Message removed" })
        .eq("id", input.id)
        .eq("channel_id", channel.id);
      if (!instructor) deletion = deletion.eq("user_id", user.id);
      if (!checked(await deletion.select("id"))!.length)
        throw new HttpError(403, "You can only remove your own messages.");
    }
    return json({ success: true });
  } catch (e) {
    return apiError(e, "community/write");
  }
}
function jsonError(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
