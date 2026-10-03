import { NextResponse } from "next/server";
import { z } from "zod";
import { checked } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { teachingAccess, type TeachingAccess } from "@/lib/server/teaching";
import { outreachLive, sendOutreachEmail, sendOutreachSms, smsConfigured, smsCredits } from "@/lib/server/contact";
import { contactTemplates, fillTemplate } from "@/lib/lms/contact-templates";
import { money, paymentReference } from "@/lib/lms/types";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const json = (d: unknown) => NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
// Admins see everyone; instructors only students enrolled in the courses they teach.
async function studentScope(t: TeachingAccess) {
  if (t.admin) return null;
  const rows = checked(
    await t.db.from("pwd_lms_orders").select("user_id").in("course_id", t.courseIds!).in("status", ["paid", "granted"]),
  ) || [];
  return new Set(rows.map((r) => r.user_id as string));
}
function assertInScope(scope: Set<string> | null, userId: string) {
  if (scope && !scope.has(userId)) throw new HttpError(403, "You can only contact students in your courses.");
}
async function names(t: TeachingAccess, ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return new Map<string, string>();
  const [profiles, orders] = await Promise.all([
    t.db.from("pwd_lms_profiles").select("user_id,full_name").in("user_id", unique),
    t.db.from("pwd_lms_orders").select("user_id,name").in("user_id", unique),
  ]);
  const map = new Map<string, string>();
  for (const o of checked(orders) || []) if (o.name) map.set(o.user_id, o.name);
  for (const p of checked(profiles) || []) if (p.full_name) map.set(p.user_id, p.full_name);
  return map;
}
const autoLabels: Record<string, string> = {
  welcome: "Welcome email",
  signup: "Account verification email",
  recovery: "Password reset email",
  existing_account: "Account access email",
  instructor_invite: "Instructor invitation",
  affiliate_approved: "Affiliate welcome email",
  affiliate_rejected: "Affiliate application update",
  affiliate_suspended: "Affiliate links paused",
  notify_message: "New message notification",
  notify_mention: "Mention notification",
  notify_announcement: "Announcement notification",
  notify_connection_request: "Connection request notification",
  notify_connection_accepted: "Connection accepted notification",
};
const statusLabels: Record<string, string> = {
  pending: "Registration received",
  review: "Payment proof received",
  paid: "Payment confirmed",
  rejected: "Payment needs attention",
  refunded: "Refund confirmed",
  granted: "Course access given",
  revoked: "Course access removed",
};
export async function GET(request: Request) {
  try {
    const t = await teachingAccess(request);
    const scope = await studentScope(t);
    const url = new URL(request.url);
    const history = url.searchParams.get("history");
    // One student's full timeline: staff messages, notes and automatic system emails.
    if (history) {
      const userId = z.uuid().parse(history);
      assertInScope(scope, userId);
      const [log, ordersRes, authUser] = await Promise.all([
        t.db.from("pwd_lms_contact_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(300),
        t.db.from("pwd_lms_orders").select("id,course_id,email,name,phone,status,amount,currency,created_at,pwd_lms_courses(title)").eq("user_id", userId).order("created_at", { ascending: false }),
        t.db.auth.admin.getUserById(userId),
      ]);
      const orders = (checked(ordersRes) || []) as unknown as { id: string; course_id: string; email: string; name: string; phone: string; status: string; amount: number; currency: string; created_at: string; pwd_lms_courses: { title: string } | null }[];
      const visibleOrders = t.admin ? orders : orders.filter((o) => t.courseIds!.includes(o.course_id));
      const emails = Array.from(new Set([authUser.data.user?.email, ...orders.map((o) => o.email)].filter(Boolean) as string[])).map((e) => e.toLowerCase());
      const [accountEmails, statusEmails, profileRes] = await Promise.all([
        emails.length ? t.db.from("pwd_lms_account_emails").select("purpose,state,created_at,email").in("email", emails).order("created_at", { ascending: false }).limit(200) : Promise.resolve({ data: [], error: null }),
        orders.length ? t.db.from("pwd_lms_emails").select("order_id,status,state,created_at").in("order_id", orders.map((o) => o.id)).order("created_at", { ascending: false }).limit(200) : Promise.resolve({ data: [], error: null }),
        t.db.from("pwd_lms_profiles").select("full_name,phone,city,occupation,organization").eq("user_id", userId).maybeSingle(),
      ]);
      const logRows = checked(log) || [];
      const senders = await names(t, logRows.map((r) => r.sent_by).filter(Boolean));
      const profile = checked(profileRes);
      const title = (id: string) => orders.find((o) => o.id === id)?.pwd_lms_courses?.title || "course";
      const timeline = [
        ...logRows.map((r) => ({
          id: r.id,
          kind: r.channel,
          title: r.channel === "note" ? "Note" : r.subject || (r.channel === "sms" ? "SMS" : r.channel === "whatsapp" ? "WhatsApp message" : "Email"),
          body: r.body,
          status: r.status,
          error: r.error,
          recipient: r.recipient,
          by: senders.get(r.sent_by) || "Staff",
          automatic: false,
          created_at: r.created_at,
        })),
        ...(checked(accountEmails) || []).map((r, i) => ({
          id: `acct-${i}-${r.created_at}`,
          kind: "email",
          title: autoLabels[r.purpose] || r.purpose.replaceAll("_", " "),
          body: "",
          status: r.state,
          error: "",
          recipient: r.email,
          by: "Automatic",
          automatic: true,
          created_at: r.created_at,
        })),
        ...(checked(statusEmails) || []).map((r, i) => ({
          id: `order-${i}-${r.created_at}`,
          kind: "email",
          title: `${statusLabels[r.status] || r.status} · ${title(r.order_id)}`,
          body: "",
          status: r.state,
          error: "",
          recipient: orders.find((o) => o.id === r.order_id)?.email || "",
          by: "Automatic",
          automatic: true,
          created_at: r.created_at,
        })),
      ].sort((a, b) => b.created_at.localeCompare(a.created_at));
      return json({
        student: {
          user_id: userId,
          name: profile?.full_name || orders[0]?.name || authUser.data.user?.user_metadata?.full_name || "Student",
          email: authUser.data.user?.email || orders[0]?.email || "",
          phone: profile?.phone || orders[0]?.phone || "",
          city: profile?.city || "",
          work: [profile?.occupation, profile?.organization].filter(Boolean).join(" · "),
          joined: authUser.data.user?.created_at || null,
          last_sign_in: authUser.data.user?.last_sign_in_at || null,
          registrations: visibleOrders.map((o) => ({
            id: o.id,
            course: o.pwd_lms_courses?.title || "Course",
            status: o.status,
            amount: t.admin ? money(o.amount, o.currency) : null,
            reference: paymentReference(o.id),
            created_at: o.created_at,
          })),
        },
        timeline,
      });
    }
    // Everyone's outreach in one list (instructors: their students only).
    if (url.searchParams.get("log") === "1") {
      let q = t.db.from("pwd_lms_contact_log").select("*").order("created_at", { ascending: false }).limit(500);
      const channel = url.searchParams.get("channel");
      if (channel && ["email", "sms", "whatsapp", "note"].includes(channel)) q = q.eq("channel", channel);
      if (scope) q = q.in("user_id", scope.size ? Array.from(scope) : ["00000000-0000-0000-0000-000000000000"]);
      const rows = checked(await q) || [];
      const who = await names(t, [...rows.map((r) => r.user_id), ...rows.map((r) => r.sent_by)]);
      return json({
        entries: rows.map((r) => ({
          id: r.id,
          user_id: r.user_id,
          student: who.get(r.user_id) || r.recipient || "Student",
          kind: r.channel,
          title: r.channel === "note" ? "Note" : r.subject || (r.channel === "sms" ? "SMS" : r.channel === "whatsapp" ? "WhatsApp message" : "Email"),
          body: r.body,
          status: r.status,
          error: r.error,
          recipient: r.recipient,
          template: r.template,
          by: who.get(r.sent_by) || "Staff",
          created_at: r.created_at,
        })),
      });
    }
    // Summary: SMS readiness and each student's most recent contact.
    let q = t.db.from("pwd_lms_contact_log").select("user_id,channel,template,status,created_at").neq("channel", "note").order("created_at", { ascending: false }).limit(2000);
    if (scope) q = q.in("user_id", scope.size ? Array.from(scope) : ["00000000-0000-0000-0000-000000000000"]);
    const rows = checked(await q) || [];
    const latest: Record<string, (typeof rows)[number]> = {};
    for (const r of rows) if (!latest[r.user_id] && r.status !== "failed") latest[r.user_id] = r;
    return json({ sms_enabled: smsConfigured(), sms_credits: await smsCredits(), live: outreachLive(), latest, admin: t.admin });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-contact/get");
  }
}
const sendSchema = z.object({
  action: z.literal("send").default("send"),
  channel: z.enum(["email", "sms", "whatsapp"]),
  template: z.string().max(40),
  subject: z.string().trim().max(200).default(""),
  message: z.string().trim().min(2).max(3000),
  targets: z.array(z.object({ user_id: z.uuid(), order_id: z.uuid().nullable().optional() })).min(1).max(200),
});
const noteSchema = z.object({
  action: z.literal("note"),
  user_id: z.uuid(),
  order_id: z.uuid().nullable().optional(),
  body: z.string().trim().min(1).max(2000),
});
// Send an email/SMS (or log WhatsApp opened) to one or many students, or save a private note.
export async function POST(request: Request) {
  try {
    const t = await teachingAccess(request);
    const { db, user } = t;
    await rateLimit(request, `lms-contact-${user.id}`, 40);
    const input = await readJson(request, z.union([noteSchema, sendSchema]));
    const scope = await studentScope(t);
    if (input.action === "note") {
      assertInScope(scope, input.user_id);
      const row = checked(
        await db.from("pwd_lms_contact_log").insert({
          user_id: input.user_id,
          order_id: input.order_id || null,
          channel: "note",
          template: "note",
          body: input.body,
          status: "saved",
          sent_by: user.id,
        }).select("id").single(),
      );
      return json({ success: true, id: row!.id });
    }
    for (const target of input.targets) assertInScope(scope, target.user_id);
    if (input.channel === "email" && !input.subject) return NextResponse.json({ error: "Add an email subject." }, { status: 400 });
    const template = contactTemplates.find((x) => x.id === input.template) || contactTemplates.at(-1)!;
    const live = outreachLive();
    const origin = live ? "https://pacificwavedigital.com" : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3100";
    const orderIds = input.targets.map((x) => x.order_id).filter(Boolean) as string[];
    const orders = orderIds.length
      ? checked(await db.from("pwd_lms_orders").select("id,user_id,course_id,name,email,phone,amount,currency,pwd_lms_courses(title,slug)").in("id", orderIds)) || []
      : [];
    const userIds = Array.from(new Set(input.targets.map((x) => x.user_id)));
    const profiles = checked(await db.from("pwd_lms_profiles").select("user_id,full_name,phone").in("user_id", userIds)) || [];
    const results: { user_id: string; name: string; status: string; error: string }[] = [];
    for (const target of input.targets) {
      const o = orders.find((x) => x.id === target.order_id && x.user_id === target.user_id) as
        | { id: string; course_id: string; name: string; email: string; phone: string; amount: number; currency: string; pwd_lms_courses: { title: string; slug: string } | null }
        | undefined;
      // Instructors may only reference registrations in their own courses.
      if (o && !t.admin && !t.courseIds!.includes(o.course_id)) throw new HttpError(403, "You can only contact students in your courses.");
      const p = profiles.find((x) => x.user_id === target.user_id);
      let email = o?.email || "";
      if (!email) email = (await db.auth.admin.getUserById(target.user_id)).data.user?.email || "";
      const name = o?.name || p?.full_name || "there";
      const course = o?.pwd_lms_courses?.title || "our training";
      const slug = o?.pwd_lms_courses?.slug;
      const link =
        template.id === "payment_reminder" && slug
          ? `${origin}/training-center/checkout?course=${slug}`
          : template.id === "choose_course"
            ? `${origin}/training-center`
            : `${origin}/training-center/dashboard`;
      const vars = {
        first_name: name.trim().split(/\s+/)[0] || "there",
        course,
        amount: o ? money(o.amount, o.currency) : "",
        reference: o ? paymentReference(o.id) : "",
        link: link.replace(/^https?:\/\//, ""),
      };
      const body = fillTemplate(input.message, vars);
      let result: { status: string; provider_id: string; error: string };
      let recipient = "";
      if (input.channel === "whatsapp") {
        recipient = o?.phone || p?.phone || "";
        result = { status: "opened", provider_id: "", error: "" };
      } else if (input.channel === "email") {
        recipient = email;
        result = email
          ? await sendOutreachEmail(email, fillTemplate(input.subject, vars), body, template.action, link)
          : { status: "failed", provider_id: "", error: "No email address" };
      } else {
        recipient = o?.phone || p?.phone || "";
        result = await sendOutreachSms(recipient, body);
      }
      await db.from("pwd_lms_contact_log").insert({
        user_id: target.user_id,
        order_id: o?.id || null,
        channel: input.channel,
        template: template.id,
        recipient,
        subject: input.channel === "email" ? fillTemplate(input.subject, vars) : "",
        body,
        status: result.status,
        provider_id: result.provider_id,
        error: result.error,
        sent_by: user.id,
      });
      results.push({ user_id: target.user_id, name, status: result.status, error: result.error });
      if (input.channel !== "whatsapp") await new Promise((r) => setTimeout(r, 250));
    }
    return json({
      results,
      sent: results.filter((r) => ["sent", "test_sent", "opened"].includes(r.status)).length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: results.filter((r) => r.status === "skipped").length,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-contact/post");
  }
}
