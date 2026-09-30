import { NextResponse, after } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { authorize } from "@/lib/server/auth";
import { checked, student } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { bucket, readChatFile } from "@/lib/server/community-files";
import { notifyByEmail, people } from "@/lib/server/messages";
import { instructorCourseIds, isAdmin } from "@/lib/server/teaching";
import type { SupabaseClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
const json = (d: unknown) =>
  NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
type Thread = { id: string; user_a: string; user_b: string; last_message_at: string | null };
type Message = { id: number; thread_id: string; sender: string; body: string; file_id: string | null; deleted: boolean; created_at: string };
const other = (t: Thread, me: string) => (t.user_a === me ? t.user_b : t.user_a);
async function canMessage(db: SupabaseClient, a: string, b: string) {
  return Boolean(checked(await db.rpc("pwd_lms_can_message", { p_a: a, p_b: b })));
}
// Messaging is for enrolled students, course instructors and admins.
async function member(request: Request) {
  const ctx = await student(request);
  const [studentRow, teaches, admin] = await Promise.all([
    ctx.db.rpc("pwd_lms_is_student", { p_user: ctx.user.id }),
    instructorCourseIds(ctx.db, ctx.user.id),
    isAdmin(ctx.db, ctx.user.email!),
  ]);
  const isStudent = Boolean(checked(studentRow));
  if (!isStudent && !teaches.length && !admin)
    throw new HttpError(403, "Messages open once you're enrolled in a course.");
  return { ...ctx, isStudent, teaches, admin };
}
async function thread(db: SupabaseClient, id: string, me: string) {
  const t = checked(
    await db.from("pwd_lms_dm_threads").select("*").eq("id", id).maybeSingle(),
  ) as Thread | null;
  if (!t || (t.user_a !== me && t.user_b !== me))
    throw new HttpError(404, "Conversation not found.");
  return t;
}
const action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("request"), user_id: z.uuid(), note: z.string().trim().max(300).default("") }),
  z.object({ action: z.literal("respond"), id: z.uuid(), accept: z.boolean() }),
  z.object({ action: z.literal("remove_connection"), user_id: z.uuid() }),
  z.object({ action: z.literal("open"), user_id: z.uuid() }),
  z.object({ action: z.literal("send"), thread_id: z.uuid(), body: z.string().trim().max(2000), file_id: z.uuid().nullable().optional(), client_id: z.uuid() }),
  z.object({ action: z.literal("delete"), message_id: z.number().int().positive() }),
  z.object({ action: z.literal("read"), thread_id: z.uuid(), last_id: z.number().int().nonnegative() }),
  z.object({ action: z.literal("block"), user_id: z.uuid() }),
  z.object({ action: z.literal("unblock"), user_id: z.uuid() }),
  z.object({ action: z.literal("report"), thread_id: z.uuid(), message_id: z.number().int().positive().nullable().optional(), reason: z.string().trim().min(3).max(500) }),
  z.object({ action: z.literal("settings"), directory_visible: z.boolean(), message_emails: z.boolean() }),
]);
const adminAction = z.discriminatedUnion("action", [
  z.object({ action: z.literal("resolve"), id: z.uuid() }),
  z.object({ action: z.literal("remove_message"), message_id: z.number().int().positive(), report_id: z.uuid() }),
]);
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("scope") === "admin") {
      // Admins only ever see conversations someone reported.
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { db } = auth;
      const reports = checked(
        await db
          .from("pwd_lms_dm_reports")
          .select("*")
          .is("resolved_at", null)
          .order("created_at", { ascending: false })
          .limit(50),
      ) || [];
      const threadIds = Array.from(new Set(reports.map((r) => r.thread_id)));
      const [threads, messages] = threadIds.length
        ? await Promise.all([
            db.from("pwd_lms_dm_threads").select("*").in("id", threadIds),
            db.from("pwd_lms_dm_messages").select("*").in("thread_id", threadIds).order("id", { ascending: false }).limit(500),
          ])
        : [{ data: [], error: null }, { data: [], error: null }];
      const ts = (checked(threads) || []) as Thread[];
      const ms = (checked(messages) || []) as Message[];
      const who = await people(db, [...ts.flatMap((t) => [t.user_a, t.user_b]), ...reports.map((r) => r.reporter)]);
      return json({
        reports: reports.map((r) => {
          const t = ts.find((x) => x.id === r.thread_id);
          return {
            ...r,
            reporter_name: who.get(r.reporter)?.full_name,
            participants: t ? [who.get(t.user_a), who.get(t.user_b)] : [],
            messages: ms
              .filter((m) => m.thread_id === r.thread_id)
              .slice(0, 60)
              .reverse()
              .map((m) => ({ ...m, sender_name: who.get(m.sender)?.full_name })),
          };
        }),
      });
    }
    const ctx = await member(request);
    const { db, user } = ctx;
    const me = user.id;
    if (url.searchParams.get("summary") === "1") {
      const row = (checked(await db.rpc("pwd_lms_message_counts", { p_user: me })) || [])[0];
      return json({ unread: Number(row?.unread || 0), requests: Number(row?.requests || 0) });
    }
    const fileId = url.searchParams.get("file");
    if (fileId) {
      const file = checked(
        await db.from("pwd_lms_dm_files").select("*").eq("id", z.uuid().parse(fileId)).maybeSingle(),
      );
      if (!file) throw new HttpError(404, "File not found.");
      await thread(db, file.thread_id, me);
      const blob = checked(await db.storage.from(bucket).download(file.path));
      return new Response(blob, {
        headers: {
          "Content-Type": file.mime,
          "Content-Disposition": `${file.mime.startsWith("image/") ? "inline" : "attachment"}; filename="${encodeURIComponent(file.name)}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (url.searchParams.get("directory") === "1") {
      const q = (url.searchParams.get("q") || "").replace(/[%_\\]/g, "").trim().slice(0, 80);
      const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
      const rows = (checked(
        await db.rpc("pwd_lms_directory", { p_me: me, p_search: q, p_limit: 30, p_offset: offset }),
      ) || []) as { user_id: string; courses: string[]; connection: string; bio: string }[];
      const cards = await people(db, rows.map((r) => r.user_id));
      return json({
        people: rows.map((r) => ({ ...cards.get(r.user_id), courses: r.courses, connection: r.connection, bio: r.bio })),
        more: rows.length === 30,
      });
    }
    const threadId = url.searchParams.get("thread");
    if (threadId) {
      const t = await thread(db, z.uuid().parse(threadId), me);
      const before = Number(url.searchParams.get("before")) || 0;
      let q = db.from("pwd_lms_dm_messages").select("*").eq("thread_id", t.id).order("id", { ascending: false }).limit(50);
      if (before) q = q.lt("id", before);
      const rows = ((checked(await q) || []) as Message[]).reverse();
      const fileIds = rows.map((m) => m.file_id).filter(Boolean) as string[];
      const files = fileIds.length
        ? checked(await db.from("pwd_lms_dm_files").select("id,name,mime,size").in("id", fileIds)) || []
        : [];
      const otherId = other(t, me);
      const [who, allowed, blocked] = await Promise.all([
        people(db, [otherId]),
        canMessage(db, me, otherId),
        db.from("pwd_lms_blocks").select("blocker").eq("blocker", me).eq("blocked", otherId).maybeSingle(),
      ]);
      return json({
        thread: { id: t.id, person: who.get(otherId), can_message: allowed, blocked_by_me: Boolean(checked(blocked)) },
        messages: rows.map((m) => ({
          ...m,
          body: m.deleted ? "" : m.body,
          file: m.deleted ? null : files.find((f) => f.id === m.file_id) || null,
          mine: m.sender === me,
        })),
        more: rows.length === 50,
      });
    }
    // Overview: conversations, requests and people I can message without a request.
    const [threadRows, incoming, sent, settings, blocks] = await Promise.all([
      db.from("pwd_lms_dm_threads").select("*").or(`user_a.eq.${me},user_b.eq.${me}`).not("last_message_at", "is", null).order("last_message_at", { ascending: false }).limit(100),
      db.from("pwd_lms_connections").select("id,requester,note,created_at").eq("addressee", me).eq("status", "pending").order("created_at", { ascending: false }),
      db.from("pwd_lms_connections").select("id,addressee,created_at").eq("requester", me).in("status", ["pending", "ignored"]).order("created_at", { ascending: false }),
      db.from("pwd_lms_profiles").select("directory_visible,message_emails").eq("user_id", me).maybeSingle(),
      db.from("pwd_lms_blocks").select("blocked").eq("blocker", me),
    ]);
    const threads = (checked(threadRows) || []) as Thread[];
    const blockedIds = (checked(blocks) || []).map((b) => b.blocked as string);
    const visibleThreads = threads.filter((t) => !blockedIds.includes(other(t, me)));
    const ids = visibleThreads.map((t) => t.id);
    const [lastRows, readRows] = ids.length
      ? await Promise.all([
          db.from("pwd_lms_dm_messages").select("id,thread_id,sender,body,file_id,deleted,created_at").in("thread_id", ids).order("id", { ascending: false }).limit(1000),
          db.from("pwd_lms_dm_reads").select("thread_id,last_read_id").eq("user_id", me).in("thread_id", ids),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];
    const last = (checked(lastRows) || []) as Message[];
    const reads = checked(readRows) || [];
    // Staff contacts: my instructors (as a student) and my students (as an instructor or admin).
    const contactsRaw: { user_id: string; role: "instructor" | "student" }[] = [];
    if (ctx.isStudent) {
      const courseIds = (checked(await db.from("pwd_lms_orders").select("course_id").eq("user_id", me).in("status", ["paid", "granted"])) || []).map((o) => o.course_id);
      if (courseIds.length) {
        const staff = checked(await db.from("pwd_lms_course_instructors").select("user_id").in("course_id", courseIds)) || [];
        for (const s of staff) if (s.user_id !== me) contactsRaw.push({ user_id: s.user_id, role: "instructor" });
      }
    }
    if (ctx.teaches.length) {
      const enrolled = checked(await db.from("pwd_lms_orders").select("user_id").in("course_id", ctx.teaches).in("status", ["paid", "granted"]).limit(500)) || [];
      for (const s of enrolled) if (s.user_id !== me) contactsRaw.push({ user_id: s.user_id, role: "student" });
    }
    const contactIds = Array.from(new Map(contactsRaw.filter((c) => !blockedIds.includes(c.user_id)).map((c) => [c.user_id, c])).values());
    const incomingRows = checked(incoming) || [];
    const sentRows = checked(sent) || [];
    const who = await people(db, [
      ...visibleThreads.map((t) => other(t, me)),
      ...incomingRows.map((r) => r.requester),
      ...sentRows.map((r) => r.addressee),
      ...contactIds.map((c) => c.user_id),
      ...blockedIds,
    ]);
    const s = checked(settings);
    return json({
      me,
      settings: { directory_visible: s?.directory_visible ?? true, message_emails: s?.message_emails ?? true },
      can_browse: ctx.isStudent || ctx.teaches.length > 0 || ctx.admin,
      threads: visibleThreads.map((t) => {
        const lastMsg = last.find((m) => m.thread_id === t.id);
        const readId = reads.find((r) => r.thread_id === t.id)?.last_read_id || 0;
        return {
          id: t.id,
          person: who.get(other(t, me)),
          last_message_at: t.last_message_at,
          preview: lastMsg ? (lastMsg.deleted ? "Message removed" : lastMsg.body || (lastMsg.file_id ? "Attachment" : "")) : "",
          last_mine: lastMsg?.sender === me,
          unread: last.filter((m) => m.thread_id === t.id && m.sender !== me && !m.deleted && m.id > readId).length,
        };
      }),
      requests: incomingRows.map((r) => ({ id: r.id, note: r.note, created_at: r.created_at, person: who.get(r.requester) })),
      sent: sentRows.map((r) => ({ id: r.id, created_at: r.created_at, person: who.get(r.addressee) })),
      contacts: contactIds.map((c) => ({ role: c.role, person: who.get(c.user_id) })),
      blocked: blockedIds.map((id) => who.get(id)),
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-messages/get");
  }
}
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("scope") === "admin") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { db, user } = auth;
      const input = await readJson(request, adminAction);
      if (input.action === "remove_message") {
        const report = checked(await db.from("pwd_lms_dm_reports").select("thread_id").eq("id", input.report_id).single());
        // Only messages inside the reported conversation can be removed.
        checked(await db.from("pwd_lms_dm_messages").update({ deleted: true }).eq("id", input.message_id).eq("thread_id", report!.thread_id));
      }
      checked(
        await db.from("pwd_lms_dm_reports").update({ resolved_at: new Date().toISOString(), resolved_by: user.id }).eq("id", input.action === "resolve" ? input.id : input.report_id),
      );
      checked(await db.from("pwd_lms_audit").insert({ actor_id: user.id, action: `dm_${input.action}`, target_id: input.action === "resolve" ? input.id : input.report_id }));
      return json({ success: true });
    }
    const ctx = await member(request);
    const { db, user } = ctx;
    const me = user.id;
    await rateLimit(request, `lms-messages-${me}`, 120);
    if (url.searchParams.get("action") === "upload") {
      const t = await thread(db, z.uuid().parse(url.searchParams.get("thread")), me);
      if (!(await canMessage(db, me, other(t, me)))) throw new HttpError(403, "You can't message this person.");
      await rateLimit(request, `dm-upload-${me}`, 12);
      const { bytes, mime, extension, original } = await readChatFile(request);
      const id = randomUUID(),
        path = `dm/${t.id}/${me}/${id}.${extension}`,
        name = original.replace(/\.[^.]+$/, "") + "." + extension;
      checked(await db.storage.from(bucket).upload(path, bytes, { contentType: mime }));
      const saved = await db.from("pwd_lms_dm_files").insert({ id, thread_id: t.id, user_id: me, path, name, mime, size: bytes.length });
      if (saved.error) {
        await db.storage.from(bucket).remove([path]);
        throw saved.error;
      }
      return json({ id, name, mime, size: bytes.length });
    }
    const input = await readJson(request, action);
    if (input.action === "request") {
      if (!ctx.isStudent) throw new HttpError(403, "Connection requests are for enrolled students.");
      let state: string;
      try {
        state = String(checked(await db.rpc("pwd_lms_request_connection", { p_from: me, p_to: input.user_id, p_note: input.note })));
      } catch (e) {
        const message = e instanceof Error ? e.message : String((e as { message?: string })?.message || "");
        if (/limit|not available|yourself/i.test(message)) throw new HttpError(400, message);
        throw e;
      }
      if (state === "sent") {
        const name = (await people(db, [me])).get(me)?.full_name || "A classmate";
        after(() => notifyByEmail(input.user_id, "connection_request", [name]));
      }
      return json({ state });
    }
    if (input.action === "respond") {
      const updated = checked(
        await db.from("pwd_lms_connections").update({ status: input.accept ? "accepted" : "ignored", responded_at: new Date().toISOString() }).eq("id", input.id).eq("addressee", me).eq("status", "pending").select("requester"),
      );
      if (!updated?.length) throw new HttpError(409, "This request is no longer pending.");
      return json({ success: true });
    }
    if (input.action === "remove_connection") {
      checked(
        await db.from("pwd_lms_connections").delete().or(`and(requester.eq.${me},addressee.eq.${input.user_id}),and(requester.eq.${input.user_id},addressee.eq.${me})`),
      );
      return json({ success: true });
    }
    if (input.action === "open") {
      if (!(await canMessage(db, me, input.user_id))) throw new HttpError(403, "Connect with this person before messaging them.");
      const [a, b] = [me, input.user_id].sort();
      checked(await db.from("pwd_lms_dm_threads").upsert({ user_a: a, user_b: b }, { onConflict: "user_a,user_b", ignoreDuplicates: true }));
      const t = checked(await db.from("pwd_lms_dm_threads").select("id").eq("user_a", a).eq("user_b", b).single());
      return json({ thread_id: t!.id });
    }
    if (input.action === "send") {
      const t = await thread(db, input.thread_id, me);
      if (!(await canMessage(db, me, other(t, me)))) throw new HttpError(403, "You can't message this person.");
      if (!input.body && !input.file_id) throw new HttpError(400, "Write a message or attach a file.");
      if (input.file_id) {
        const f = checked(await db.from("pwd_lms_dm_files").select("id").eq("id", input.file_id).eq("thread_id", t.id).eq("user_id", me).maybeSingle());
        if (!f) throw new HttpError(400, "Attachment not found.");
      }
      const existing = checked(await db.from("pwd_lms_dm_messages").select("*").eq("sender", me).eq("client_id", input.client_id).maybeSingle());
      if (existing) return json({ message: { ...existing, mine: true } });
      const message = checked(
        await db.from("pwd_lms_dm_messages").insert({ thread_id: t.id, sender: me, body: input.body, file_id: input.file_id || null, client_id: input.client_id }).select("*").single(),
      ) as Message;
      await Promise.all([
        db.from("pwd_lms_dm_threads").update({ last_message_at: message.created_at }).eq("id", t.id),
        db.from("pwd_lms_dm_reads").upsert({ thread_id: t.id, user_id: me, last_read_id: message.id }, { onConflict: "thread_id,user_id" }),
      ]);
      return json({ message: { ...message, mine: true } });
    }
    if (input.action === "delete") {
      const updated = checked(await db.from("pwd_lms_dm_messages").update({ deleted: true }).eq("id", input.message_id).eq("sender", me).select("id"));
      if (!updated?.length) throw new HttpError(404, "Message not found.");
      return json({ success: true });
    }
    if (input.action === "read") {
      await thread(db, input.thread_id, me);
      const current = checked(await db.from("pwd_lms_dm_reads").select("last_read_id").eq("thread_id", input.thread_id).eq("user_id", me).maybeSingle());
      if (!current || current.last_read_id < input.last_id)
        checked(await db.from("pwd_lms_dm_reads").upsert({ thread_id: input.thread_id, user_id: me, last_read_id: input.last_id }, { onConflict: "thread_id,user_id" }));
      return json({ success: true });
    }
    if (input.action === "block" || input.action === "unblock") {
      if (input.user_id === me) throw new HttpError(400, "You can't block yourself.");
      if (input.action === "block") {
        checked(await db.from("pwd_lms_blocks").upsert({ blocker: me, blocked: input.user_id }, { onConflict: "blocker,blocked", ignoreDuplicates: true }));
        checked(await db.from("pwd_lms_connections").delete().or(`and(requester.eq.${me},addressee.eq.${input.user_id}),and(requester.eq.${input.user_id},addressee.eq.${me})`));
      } else checked(await db.from("pwd_lms_blocks").delete().eq("blocker", me).eq("blocked", input.user_id));
      return json({ success: true });
    }
    if (input.action === "report") {
      await thread(db, input.thread_id, me);
      await rateLimit(request, `dm-report-${me}`, 10);
      checked(await db.from("pwd_lms_dm_reports").insert({ thread_id: input.thread_id, message_id: input.message_id || null, reporter: me, reason: input.reason }));
      return json({ success: true });
    }
    checked(
      await db.from("pwd_lms_profiles").upsert({ user_id: me, directory_visible: input.directory_visible, message_emails: input.message_emails, updated_at: new Date().toISOString() }, { onConflict: "user_id" }),
    );
    return json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-messages/post");
  }
}
