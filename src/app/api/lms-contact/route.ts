import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/server/auth";
import { checked } from "@/lib/server/lms";
import { apiError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { outreachLive, sendOutreachEmail, sendOutreachSms, smsConfigured } from "@/lib/server/contact";
import { contactTemplates, fillTemplate } from "@/lib/lms/contact-templates";
import { money, paymentReference } from "@/lib/lms/types";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const json = (d: unknown) => NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
// Admin: whether SMS is ready, plus each student's most recent contact.
export async function GET(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const rows = checked(
      await auth.db
        .from("pwd_lms_contact_log")
        .select("user_id,channel,template,status,created_at")
        .order("created_at", { ascending: false })
        .limit(2000),
    ) || [];
    const latest: Record<string, (typeof rows)[number]> = {};
    for (const r of rows) if (!latest[r.user_id] && r.status !== "failed") latest[r.user_id] = r;
    return json({ sms_enabled: smsConfigured(), live: outreachLive(), latest });
  } catch (e) {
    return apiError(e, "lms-contact/get");
  }
}
const sendSchema = z.object({
  channel: z.enum(["email", "sms", "whatsapp"]),
  template: z.string().max(40),
  subject: z.string().trim().max(200).default(""),
  message: z.string().trim().min(2).max(3000),
  targets: z.array(z.object({ user_id: z.uuid(), order_id: z.uuid().nullable().optional() })).min(1).max(200),
});
// Admin: send an email or SMS to one or many students (or log that WhatsApp was opened).
export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db, user } = auth;
    await rateLimit(request, `lms-contact-${user.id}`, 30);
    const input = await readJson(request, sendSchema);
    if (input.channel === "email" && !input.subject) return NextResponse.json({ error: "Add an email subject." }, { status: 400 });
    const template = contactTemplates.find((t) => t.id === input.template) || contactTemplates.at(-1)!;
    const live = outreachLive();
    const origin = live ? "https://pacificwavedigital.com" : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3100";
    const orderIds = input.targets.map((t) => t.order_id).filter(Boolean) as string[];
    const orders = orderIds.length
      ? checked(await db.from("pwd_lms_orders").select("id,user_id,name,email,phone,amount,currency,pwd_lms_courses(title,slug)").in("id", orderIds)) || []
      : [];
    const userIds = Array.from(new Set(input.targets.map((t) => t.user_id)));
    const profiles = checked(await db.from("pwd_lms_profiles").select("user_id,full_name,phone").in("user_id", userIds)) || [];
    const results: { user_id: string; name: string; status: string; error: string }[] = [];
    for (const t of input.targets) {
      const o = orders.find((x) => x.id === t.order_id && x.user_id === t.user_id) as
        | { id: string; name: string; email: string; phone: string; amount: number; currency: string; pwd_lms_courses: { title: string; slug: string } | null }
        | undefined;
      const p = profiles.find((x) => x.user_id === t.user_id);
      let email = o?.email || "";
      if (!email) email = (await db.auth.admin.getUserById(t.user_id)).data.user?.email || "";
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
        user_id: t.user_id,
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
      results.push({ user_id: t.user_id, name, status: result.status, error: result.error });
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
