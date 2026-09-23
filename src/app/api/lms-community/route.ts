import { NextResponse } from "next/server";
import { z } from "zod";
import { checked } from "@/lib/server/lms";
import { access, channelAccess } from "@/lib/server/community";
import {
  uploadCommunityFile,
  downloadCommunityFile,
} from "@/lib/server/community-files";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  communitySchema,
  normalizeMentions,
  type Person,
  type ChatMessage,
} from "@/lib/lms/community";
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
type Context = Awaited<ReturnType<typeof access>>;
async function people(ctx: Context, course: string, channel: string | null) {
  return checked(
    await ctx.db.rpc("pwd_lms_chat_people", {
      p_course: course,
      p_channel: channel,
    }),
  ) as Person[];
}
async function message(ctx: Context, channel: string, id: number) {
  const m = checked(
    await ctx.db
      .from("pwd_lms_messages")
      .select("*")
      .eq("id", id)
      .eq("channel_id", channel)
      .maybeSingle(),
  );
  if (!m) throw new HttpError(404, "Message not found.");
  return m;
}
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams,
      course = z.uuid().parse(q.get("course")),
      channelId = q.get("channel");
    if (q.has("file"))
      return await downloadCommunityFile(
        request,
        course,
        z.uuid().parse(channelId),
        z.uuid().parse(q.get("file")),
      );
    const ctx = await access(request, course),
      { db, user, instructor } = ctx;
    if (channelId) {
      const channel = await channelAccess(
        ctx,
        course,
        z.uuid().parse(channelId),
      );
      const before = q.get("before"),
        search = q.get("search")?.trim().slice(0, 120),
        thread = q.get("thread");
      let query = db
        .from("pwd_lms_messages")
        .select(
          "id,user_id,author_name,instructor,body,deleted,created_at,edited_at,pinned,reply_to",
        )
        .eq("channel_id", channel.id)
        .order("id", { ascending: false })
        .limit(50);
      if (before)
        query = query.lt(
          "id",
          z.coerce.number().int().positive().parse(before),
        );
      if (search)
        query = query
          .eq("deleted", false)
          .textSearch("search_document", search, {
            type: "websearch",
            config: "simple",
          });
      if (thread) {
        const root = await message(
          ctx,
          channel.id,
          z.coerce.number().int().positive().parse(thread),
        );
        query = query.or(`id.eq.${root.id},reply_to.eq.${root.id}`);
      }
      const rows = checked(await query)!;
      const ids = rows.map((m) => m.id),
        parentIds = Array.from(
          new Set(rows.map((m) => m.reply_to).filter(Boolean)),
        );
      const [reactions, files, parents, pinned, roster, reports, members] =
        await Promise.all([
          ids.length
            ? db
                .from("pwd_lms_chat_reactions")
                .select("message_id,user_id,emoji")
                .in("message_id", ids)
            : { data: [], error: null },
          ids.length
            ? db
                .from("pwd_lms_chat_files")
                .select("id,message_id,name,mime,size")
                .in("message_id", ids)
            : { data: [], error: null },
          parentIds.length
            ? db
                .from("pwd_lms_messages")
                .select("id,author_name,body,deleted")
                .eq("channel_id", channel.id)
                .in("id", parentIds)
            : { data: [], error: null },
          db
            .from("pwd_lms_messages")
            .select("id,author_name,body")
            .eq("channel_id", channel.id)
            .eq("pinned", true)
            .eq("deleted", false)
            .order("id", { ascending: false })
            .limit(20),
          people(ctx, course, channel.id),
          instructor
            ? db
                .from("pwd_lms_chat_reports")
                .select(
                  "id,message_id,reason,created_at,pwd_lms_messages!inner(channel_id)",
                )
                .eq("pwd_lms_messages.channel_id", channel.id)
                .is("resolved_at", null)
                .order("created_at", { ascending: false })
                .limit(50)
            : { data: [], error: null },
          instructor
            ? db
                .from("pwd_lms_channel_members")
                .select("user_id")
                .eq("channel_id", channel.id)
            : { data: [], error: null },
        ]);
      const reactRows = checked(reactions)!,
        fileRows = checked(files)!,
        parentRows = checked(parents)!;
      const messages = rows
        .map((m) => {
          const grouped = new Map<
            string,
            { emoji: string; count: number; mine: boolean }
          >();
          for (const r of reactRows.filter((r) => r.message_id === m.id)) {
            const value = grouped.get(r.emoji) || {
              emoji: r.emoji,
              count: 0,
              mine: false,
            };
            value.count++;
            value.mine ||= r.user_id === user.id;
            grouped.set(r.emoji, value);
          }
          const reply = parentRows.find((p) => p.id === m.reply_to);
          return {
            ...m,
            body: m.deleted ? "Message removed" : m.body,
            reply: reply
              ? {
                  id: reply.id,
                  author_name: reply.author_name,
                  body: reply.deleted ? "Message removed" : reply.body,
                }
              : undefined,
            reactions: m.deleted ? [] : Array.from(grouped.values()),
            files: m.deleted
              ? []
              : fileRows
                  .filter((f) => f.message_id === m.id)
                  .map(({ message_id: _, ...f }) => f),
          } as ChatMessage;
        })
        .reverse();
      return json({
        messages,
        has_more: rows.length === 50,
        channel,
        people: roster,
        pinned: checked(pinned),
        reports: checked(reports),
        members: checked(members)!.map((m) => m.user_id),
      });
    }
    const [channels, members, roster] = await Promise.all([
      db
        .from("pwd_lms_channels")
        .select("*")
        .eq("course_id", course)
        .order("created_at"),
      db
        .from("pwd_lms_channel_members")
        .select("channel_id")
        .eq("user_id", user.id),
      instructor ? people(ctx, course, null) : Promise.resolve([]),
    ]);
    const memberIds = new Set(checked(members)!.map((m) => m.channel_id));
    const visible = checked(channels)!.filter(
      (c) => (!ctx.privateCourse || c.private) && (!c.private || instructor || memberIds.has(c.id)),
    );
    const counts = checked(
      await db.rpc("pwd_lms_chat_counts", {
        p_user: user.id,
        p_channels: visible.map((c) => c.id),
      }),
    ) as { channel_id: string; unread: number; mentions: number }[];
    return json({
      channels: visible.map((c) => ({
        ...c,
        ...counts.find((n) => n.channel_id === c.id),
      })),
      instructor,
      private_course: ctx.privateCourse,
      user_id: user.id,
      people: roster,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("Invalid community request.");
    return apiError(e, "community/read");
  }
}
export async function POST(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    if (q.get("action") === "upload")
      return json({
        file: await uploadCommunityFile(
          request,
          z.uuid().parse(q.get("course")),
          z.uuid().parse(q.get("channel")),
        ),
      });
    const input = await readJson(request, communitySchema),
      ctx = await access(request, input.course),
      { db, user, instructor, name } = ctx;
    await rateLimit(request, `community-${user.id}`, 120);
    if (input.action === "create" || input.action === "members") {
      if (!instructor)
        throw new HttpError(403, "Only instructors can manage course groups.");
      if (ctx.privateCourse) throw new HttpError(403, "Mentorship conversations are assigned automatically to each paid student. Membership is fixed to protect their privacy.");
      const paid = checked(
        await db
          .from("pwd_lms_orders")
          .select("user_id")
          .eq("course_id", input.course)
          .in("status", ["paid", "granted"]),
      )!;
      if (input.members.some((id) => !paid.some((o) => o.user_id === id)))
        throw new HttpError(400, "Choose enrolled students from this course.");
      const channel =
        input.action === "create"
          ? checked(
              await db
                .from("pwd_lms_channels")
                .insert({
                  course_id: input.course,
                  name: input.name,
                  description: input.description,
                  private: input.private,
                  announcements: input.announcements,
                  created_by: user.id,
                })
                .select()
                .single(),
            )
          : await channelAccess(ctx, input.course, input.channel);
      if (!channel) throw new HttpError(404, "Group unavailable.");
      if (channel.order_id) throw new HttpError(403, "This private mentorship conversation has fixed membership.");
      checked(
        await db.rpc("pwd_lms_set_group_members", {
          group_id: channel.id,
          member_ids: Array.from(new Set(input.members)),
        }),
      );
      return json({ id: channel.id });
    }
    const channel = await channelAccess(ctx, input.course, input.channel);
    if (input.action === "settings") {
      if (!instructor)
        throw new HttpError(403, "Only instructors can manage course groups.");
      checked(
        await db
          .from("pwd_lms_channels")
          .update({
            name: input.name,
            description: input.description,
            announcements: input.announcements,
            locked: input.locked,
            archived: input.archived,
          })
          .eq("id", channel.id),
      );
      return json({ success: true });
    }
    if (input.action === "discard_file") {
      const f = checked(
        await db
          .from("pwd_lms_chat_files")
          .delete()
          .eq("id", input.file_id)
          .eq("channel_id", channel.id)
          .eq("user_id", user.id)
          .is("message_id", null)
          .select("path")
          .maybeSingle(),
      );
      if (f) {
        checked(await db.storage.from("pwd-community-files").remove([f.path]));
      }
      return json({ success: true });
    }
    if (input.action === "resolve") {
      if (!instructor)
        throw new HttpError(403, "Only instructors can review reports.");
      const r = checked(
        await db
          .from("pwd_lms_chat_reports")
          .select("message_id")
          .eq("id", input.report_id)
          .maybeSingle(),
      );
      if (!r) throw new HttpError(404, "Report not found.");
      await message(ctx, channel.id, r.message_id);
      checked(
        await db
          .from("pwd_lms_chat_reports")
          .update({ resolved_at: new Date().toISOString() })
          .eq("id", input.report_id),
      );
      return json({ success: true });
    }
    if (input.action === "send" || input.action === "edit") {
      if (
        channel.archived ||
        (!instructor && (channel.locked || channel.announcements))
      )
        throw new HttpError(403, "Posting is closed in this conversation.");
      let mention;
      try {
        mention = normalizeMentions(
          input.body,
          await people(ctx, input.course, channel.id),
        );
      } catch (e) {
        throw new HttpError(400, (e as Error).message);
      }
      if (input.action === "edit") {
        const target = await message(ctx, channel.id, input.id);
        if (target.user_id !== user.id || target.deleted)
          throw new HttpError(403, "Only the author can edit this message.");
        checked(
          await db.rpc("pwd_lms_chat_edit", {
            p_message: input.id,
            p_channel: channel.id,
            p_user: user.id,
            p_body: mention.body,
            p_mentions: mention.ids,
          }),
        );
      } else {
        const chosen = input.reply_to
          ? await message(ctx, channel.id, input.reply_to)
          : null;
        const reply = chosen?.reply_to
          ? await message(ctx, channel.id, chosen.reply_to)
          : chosen;
        if (chosen?.deleted || reply?.deleted)
          throw new HttpError(400, "Choose a reply that has not been removed.");
        if (input.files.length) {
          const existing = checked(await db.from("pwd_lms_messages").select("id,channel_id").eq("user_id", user.id).eq("client_id", input.client_id).maybeSingle());
          if (existing?.channel_id === channel.id) return json({ success: true });
          const files = checked(await db.from("pwd_lms_chat_files").select("id").in("id", input.files).eq("channel_id", channel.id).eq("user_id", user.id).is("message_id", null))!;
          if (files.length !== new Set(input.files).size) throw new HttpError(400, "Choose your own unused attachments from this conversation.");
        }
        checked(
          await db.rpc("pwd_lms_chat_send", {
            p_channel: channel.id,
            p_user: user.id,
            p_name: name,
            p_instructor: instructor,
            p_body: mention.body,
            p_client: input.client_id,
            p_reply: reply?.reply_to || reply?.id || null,
            p_mentions: mention.ids,
            p_files: Array.from(new Set(input.files)),
          }),
        );
      }
      return json({ success: true });
    }
    const target = await message(ctx, channel.id, input.id);
    if (input.action === "read") {
      checked(
        await db.rpc("pwd_lms_chat_read", {
          p_user: user.id,
          p_channel: channel.id,
          p_message: input.id,
        }),
      );
      return json({ success: true });
    }
    if (input.action === "delete") {
      if (!instructor && target.user_id !== user.id)
        throw new HttpError(403, "You can only remove your own messages.");
      checked(
        await db
          .from("pwd_lms_messages")
          .update({ deleted: true, body: "Message removed", pinned: false })
          .eq("id", input.id)
          .eq("channel_id", channel.id),
      );
    } else if (input.action === "pin") {
      if (!instructor)
        throw new HttpError(403, "Only instructors can pin messages.");
      if (target.deleted)
        throw new HttpError(400, "This message has been removed.");
      checked(
        await db
          .from("pwd_lms_messages")
          .update({ pinned: input.pinned })
          .eq("id", input.id),
      );
    } else if (input.action === "react") {
      if (target.deleted)
        throw new HttpError(400, "This message has been removed.");
      checked(
        await (input.active
          ? db
              .from("pwd_lms_chat_reactions")
              .upsert(
                { message_id: input.id, user_id: user.id, emoji: input.emoji },
                {
                  onConflict: "message_id,user_id,emoji",
                  ignoreDuplicates: true,
                },
              )
          : db
              .from("pwd_lms_chat_reactions")
              .delete()
              .eq("message_id", input.id)
              .eq("user_id", user.id)
              .eq("emoji", input.emoji)),
      );
    } else if (input.action === "report") {
      checked(
        await db
          .from("pwd_lms_chat_reports")
          .upsert(
            { message_id: input.id, user_id: user.id, reason: input.reason },
            { onConflict: "message_id,user_id", ignoreDuplicates: true },
          ),
      );
    }
    return json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("Invalid community request.");
    return apiError(e, "community/write");
  }
}
function jsonError(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
