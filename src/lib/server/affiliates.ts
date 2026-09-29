import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { reportServerError } from "./report-error";
import { trainingTemplate } from "../email/training-template";
import { affiliateWelcomeTemplate } from "../email/affiliate-template";
import { affiliateDestination, affiliateLink } from "../lms/affiliate-guide";
import { programs } from "../lms/programs";
import { money } from "../lms/types";
import { getSupabaseAdmin } from "./clients";
export const REFERRAL_COOKIE = "pwd_aff";
export const REFERRAL_DAYS = 30;
export const affiliateCode = /^[A-Z0-9]{4,20}$/;
// Only training pages may be link destinations, so /go links can never become open redirects.
export function safeDestination(to: string | null) {
  return to && /^\/(training-center|vanuatu-training)(\/[a-z0-9/-]*)?$/.test(to)
    ? to
    : "/training-center";
}
export function referralCode(request: Request) {
  const value = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${REFERRAL_COOKIE}=`))
    ?.slice(REFERRAL_COOKIE.length + 1)
    .toUpperCase();
  return value && affiliateCode.test(value) ? value : null;
}
// Best effort: a referral must never block registration or payment.
export async function attachReferral(
  db: SupabaseClient,
  request: Request,
  orderId: string,
) {
  const code = referralCode(request);
  if (!code) return;
  const { error } = await db.rpc("pwd_lms_attach_affiliate", {
    p_order: orderId,
    p_code: code,
  });
  if (error) await reportServerError("lms/affiliate-attach", error);
}
export const AFFILIATE_SETTINGS = "affiliate_program";
// Auto-approval is on unless an admin has switched it off.
export async function affiliateSettings(db: SupabaseClient) {
  const { data } = await db
    .from("pwd_lms_settings")
    .select("value")
    .eq("id", AFFILIATE_SETTINGS)
    .maybeSingle();
  return { auto_approve: data?.value?.auto_approve !== false };
}
function emailOrigin() {
  const live =
    process.env.TRAINING_EMAIL_MODE === "live" &&
    process.env.VERCEL_ENV === "production";
  return {
    live,
    origin: live
      ? "https://pacificwavedigital.com"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3100",
  };
}
// Sends the affiliate's status email and records it in the admin email log. Best effort.
export async function sendAffiliateEmail(
  affiliateId: string,
  status: "approved" | "rejected" | "suspended",
) {
  if (process.env.TRAINING_EMAIL_MODE === "disabled") return;
  const db = getSupabaseAdmin();
  const { live, origin } = emailOrigin();
  const dashboardUrl = `${origin}/training-center/account?mode=signin&next=affiliate`;
  try {
    const { data: a, error } = await db
      .from("pwd_lms_affiliates")
      .select("email,full_name,code,commission_rate")
      .eq("id", affiliateId)
      .single();
    if (error || !a) throw error || Error("Affiliate not found");
    let subject: string, content: { html: string; text: string };
    if (status === "approved") {
      const { data: courses } = await db
        .from("pwd_lms_courses")
        .select("slug,title,amount,currency,cohort_id")
        .eq("published", true)
        .eq("enrollment_open", true)
        .order("created_at");
      const rate = Number(a.commission_rate);
      subject = "You're approved! Your Pacific Wave Digital affiliate links are ready";
      content = affiliateWelcomeTemplate({
        name: a.full_name,
        code: a.code,
        rate,
        dashboardUrl,
        links: [
          { title: "All courses", url: affiliateLink(origin, a.code, "/training-center") },
          ...(courses || []).map((c) => ({
            title: c.title,
            url: affiliateLink(origin, a.code, affiliateDestination(c, Boolean(programs[c.slug]))),
            earn: money(Math.floor((c.amount * rate) / 100), c.currency),
          })),
        ],
      });
    } else {
      const copy = {
        rejected: {
          subject: "Your Pacific Wave Digital affiliate application",
          title: "About your affiliate application",
          intro:
            "Thank you for applying to promote our courses. We are not able to approve your application at this time. You can update your details and apply again from your dashboard.",
        },
        suspended: {
          subject: "Your Pacific Wave Digital affiliate links are paused",
          title: "Your affiliate links are paused",
          intro:
            "Your affiliate links are paused, and new referrals are not being tracked. Commissions you already earned are unaffected. Contact us if you have questions.",
        },
      }[status];
      subject = copy.subject;
      content = trainingTemplate({
        title: copy.title,
        intro: copy.intro,
        action: "Open my affiliate dashboard",
        url: dashboardUrl,
      });
    }
    const { data: log } = await db
      .from("pwd_lms_account_emails")
      .insert({ email: a.email, purpose: `affiliate_${status}`, state: "pending" })
      .select("id")
      .single();
    let response: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          signal: AbortSignal.timeout(12000),
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            ...(log ? { "Idempotency-Key": `pwd-affiliate-${log.id}` } : {}),
          },
          body: JSON.stringify({
            from:
              process.env.RESEND_FROM_EMAIL ||
              "Pacific Wave Digital <noreply@pacificwavedigital.com>",
            to: live ? a.email : "delivered@resend.dev",
            reply_to: "steve@pacificwavedigital.com",
            subject,
            ...content,
          }),
        });
        if (response.ok || response.status < 500) break;
      } catch (e) {
        if (attempt === 1) throw e;
      }
    }
    const result = response?.ok ? await response.json() : null;
    if (log)
      await db
        .from("pwd_lms_account_emails")
        .update(
          result?.id
            ? { provider_id: result.id, state: live ? "accepted" : "test_accepted" }
            : { state: "failed" },
        )
        .eq("id", log.id);
    if (!result?.id) throw Error("Provider rejected affiliate email");
  } catch (error) {
    await reportServerError("lms/affiliate-email", error);
  }
}
