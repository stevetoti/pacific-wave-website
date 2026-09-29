import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { reportServerError } from "./report-error";
import { trainingTemplate } from "../email/training-template";
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
// Tells an affiliate their application outcome. Best effort; follows the training email mode rules.
export async function sendAffiliateEmail(
  email: string,
  status: "approved" | "rejected" | "suspended",
) {
  if (process.env.TRAINING_EMAIL_MODE === "disabled") return;
  const live =
    process.env.TRAINING_EMAIL_MODE === "live" &&
    process.env.VERCEL_ENV === "production";
  const origin = live
    ? "https://pacificwavedigital.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3100";
  const copy = {
    approved: {
      subject: "You're approved — your Pacific Wave Digital affiliate link is ready",
      title: "Welcome to the affiliate programme",
      intro:
        "Your affiliate application is approved. Your personal course links are ready in your dashboard. Share them, and you earn a commission on every paid enrolment they bring in.",
      details: [
        `Referrals are remembered for ${REFERRAL_DAYS} days after someone opens your link.`,
        "Commissions show as pending once a referred student pays, and are paid to your saved payout details after review.",
      ],
    },
    rejected: {
      subject: "Your Pacific Wave Digital affiliate application",
      title: "About your affiliate application",
      intro:
        "Thank you for applying to promote our courses. We are not able to approve your application at this time. You can update your details and apply again from your dashboard.",
      details: [],
    },
    suspended: {
      subject: "Your Pacific Wave Digital affiliate links are paused",
      title: "Your affiliate links are paused",
      intro:
        "Your affiliate links are paused, and new referrals are not being tracked. Commissions you already earned are unaffected. Contact us if you have questions.",
      details: [],
    },
  }[status];
  const content = trainingTemplate({
    title: copy.title,
    intro: copy.intro,
    action: "Open my affiliate dashboard",
    url: `${origin}/training-center/dashboard?tab=affiliate`,
    details: copy.details,
  });
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(12000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Pacific Wave Digital <noreply@pacificwavedigital.com>",
        to: live ? email : "delivered@resend.dev",
        reply_to: "steve@pacificwavedigital.com",
        subject: copy.subject,
        ...content,
      }),
    });
    if (!response.ok) throw Error("Provider rejected affiliate email");
  } catch (error) {
    await reportServerError("lms/affiliate-email", error);
  }
}
