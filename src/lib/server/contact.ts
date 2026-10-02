import "server-only";
import { trainingTemplate } from "../email/training-template";
import { normalizePhone } from "../lms/contact-templates";
export const outreachLive = () =>
  process.env.TRAINING_EMAIL_MODE === "live" && process.env.VERCEL_ENV === "production";
export const smsConfigured = () => Boolean(process.env.VANUCONNECT_API_KEY);
type Result = { status: "sent" | "test_sent" | "failed" | "skipped"; provider_id: string; error: string };
// Branded email from the Training Centre; replies go to Stephen.
export async function sendOutreachEmail(to: string, subject: string, body: string, action: string, url: string): Promise<Result> {
  const live = outreachLive();
  const [intro, ...details] = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const content = trainingTemplate({ title: subject, intro: intro || "", details, action, url });
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Pacific Wave Digital <noreply@pacificwavedigital.com>",
        to: live ? to : "delivered@resend.dev",
        reply_to: "steve@pacificwavedigital.com",
        subject,
        ...content,
      }),
    });
    const result = response.ok ? await response.json() : null;
    if (!result?.id) return { status: "failed", provider_id: "", error: `Email provider error (${response.status})` };
    return { status: live ? "sent" : "test_sent", provider_id: result.id, error: "" };
  } catch (e) {
    return { status: "failed", provider_id: "", error: e instanceof Error ? e.message.slice(0, 200) : "Email failed" };
  }
}
// SMS through the VanuConnect API. Only sends on the live site, so tests never text real students.
export async function sendOutreachSms(phone: string, text: string): Promise<Result> {
  const to = normalizePhone(phone);
  if (!to) return { status: "failed", provider_id: "", error: "No valid phone number" };
  if (!smsConfigured()) return { status: "skipped", provider_id: "", error: "SMS is not set up yet (VanuConnect API key missing)" };
  if (!outreachLive()) return { status: "skipped", provider_id: "", error: "Test mode: SMS not sent" };
  try {
    const response = await fetch(
      process.env.VANUCONNECT_SMS_URL || "https://zqxcrvjsnunjuelmrydm.supabase.co/functions/v1/send-sms-api",
      {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${process.env.VANUCONNECT_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: to,
          message: text,
          channel: "sms",
          ...(process.env.VANUCONNECT_SENDER_ID ? { sender_id: process.env.VANUCONNECT_SENDER_ID } : {}),
        }),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) return { status: "failed", provider_id: "", error: String(data?.error || `SMS provider error (${response.status})`).slice(0, 200) };
    return { status: "sent", provider_id: String(data?.message_id || data?.provider_message_id || ""), error: "" };
  } catch (e) {
    return { status: "failed", provider_id: "", error: e instanceof Error ? e.message.slice(0, 200) : "SMS failed" };
  }
}
