import "server-only";
import { queueOwnerNotification, sendOwnerNotifications } from "./owner-notifications";
import { after } from "next/server";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "./clients";
import { checked } from "./lms";
import { HttpError } from "./http";
import { trainingTemplate } from "../email/training-template";
import type { Course } from "../lms/types";
export async function sendAccountEmail(input: {
  email: string;
  password?: string;
  mode: "signup" | "recovery" | "welcome";
  course?: string;
}) {
  if (process.env.TRAINING_EMAIL_MODE === "disabled") return;
  const db = getSupabaseAdmin();
  const live =
    process.env.TRAINING_EMAIL_MODE === "live" &&
    process.env.VERCEL_ENV === "production";
  const origin = live
    ? "https://pacificwavedigital.com"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3100";
  const result = input.mode === "welcome" ? { error: null, data: null } : await db.auth.admin.generateLink(
    input.mode === "signup"
      ? { type: "signup", email: input.email, password: input.password! }
      : { type: "recovery", email: input.email },
  );
  let existing = false;
  if (result.error) {
    if (input.mode === "signup" && result.error.code === "email_exists")
      existing = true;
    else if (
      input.mode === "recovery" &&
      result.error.code === "user_not_found"
    )
      return;
    else throw result.error;
  }
  const purpose = existing ? "existing_account" : input.mode;
  const query = input.course
    ? `course=${encodeURIComponent(input.course)}`
    : "";
  const link = input.mode === "welcome"
    ? `${origin}/training-center/account?mode=signin${query ? "&" + query : ""}`
    : existing
    ? `${origin}/training-center/account${query ? "?" + query : ""}`
    : `${origin}/training-center/account?verify=${encodeURIComponent(result.data!.properties!.hashed_token)}&type=${input.mode}${query ? "&" + query : ""}`;
  const courses = checked(
    await db
      .from("pwd_lms_courses")
      .select("*")
      .eq("published", true)
      .order("created_at")
      .limit(10),
  ) as Course[];
  const content = trainingTemplate({
    title: input.mode === "welcome" ? "Welcome to Pacific Wave Digital Training" : existing
      ? "Your training account is ready"
      : input.mode === "signup"
        ? "Welcome to your next chapter"
        : "Reset your student password",
    intro: input.mode === "welcome" ? "Your student account is ready. You can sign in immediately, complete your course payment and find your learning space. No email confirmation is needed." : existing
      ? "You already have a verified account with this email address. Use your existing password to sign in to the Pacific Wave Digital Training Centre. There is no need to create another account."
      : input.mode === "signup"
        ? "Welcome to Pacific Wave Digital. Confirm your email address to activate your student account and start your learning journey."
        : "We received a request to reset your training account password. Use the secure button below, then confirm the reset on our website and choose a new password.",
    action: input.mode === "welcome" ? (input.course ? "Complete my course enrollment" : "Open my dashboard") : existing
      ? "Sign in to your account"
      : input.mode === "signup"
        ? "Verify my email address"
        : "Reset my password",
    url: link,
    details: input.mode === "welcome" ? ["Learn practical AI, business, website and software skills with instructor support.", "Your dashboard brings together your courses, lesson recordings, community and progress. Course access follows your payment or administrator approval.", "Pay securely by card or use our ANZ/BRED VUV bank accounts and upload your payment proof at checkout."] : existing
      ? [
          "Forgot your password? Choose “Forgot password?” on the sign-in page to receive a secure reset link.",
          "Your account brings together your enrolled courses, class recordings, learning progress and instructor support.",
        ]
      : input.mode === "signup"
        ? [
            "After verification, choose a course and complete its enrolment and payment. Creating an account does not charge you or enrol you automatically.",
            "Your dashboard will hold your lessons, recordings and progress. Group courses include a community for discussions with classmates and instructors.",
            "If this link expires, return to the account page and request a new access email.",
          ]
        : [
            "If you did not request this reset, you can ignore this email. Your password stays unchanged.",
          ],
    courses: ["signup", "welcome"].includes(input.mode) ? courses : [],
  });
  const log = checked(
    await db
      .from("pwd_lms_account_emails")
      .insert({ email: input.email, purpose, state: "pending" })
      .select("id")
      .single(),
  );
  if (!log) throw Error("Email delivery record unavailable");
  await queueOwnerNotification(`account-${log.id}`, `Training account activity: ${existing ? "existing account access" : ["signup", "welcome"].includes(input.mode) ? "new student account" : "password reset request"}`, `Student email: ${input.email}\nActivity: ${purpose}\nCourse selected: ${input.course || "Not selected"}\n${input.mode === "welcome" ? "Student can sign in immediately; welcome and enrollment details sent privately." : "Account verification/reset links are sent privately to the student."}`);
  after(sendOwnerNotifications);
  let response: Response | undefined;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          signal: AbortSignal.timeout(12000),
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `pwd-account-${log.id}`,
          },
          body: JSON.stringify({
            from:
              process.env.RESEND_FROM_EMAIL ||
              "Pacific Wave Digital <noreply@pacificwavedigital.com>",
            to: live ? input.email : "delivered@resend.dev",
            reply_to: "steve@pacificwavedigital.com",
            subject: input.mode === "welcome" ? "Welcome — your Pacific Wave Digital student account is ready" : existing
              ? "Your Pacific Wave Digital training account and course guide"
              : input.mode === "signup"
                ? "Welcome to Pacific Wave Digital — verify your student account"
                : "Reset your Pacific Wave Digital student password",
            ...content,
          }),
        });
        if (response.ok || response.status < 500) break;
      } catch (e) {
        if (attempt === 1) throw e;
      }
    }
    if (!response?.ok) throw Error("Provider rejected account email");
    const result = await response.json();
    if (!result.id) throw Error("Missing email receipt");
    checked(
      await db
        .from("pwd_lms_account_emails")
        .update({
          provider_id: result.id,
          state: live ? "accepted" : "test_accepted",
        })
        .eq("id", log.id),
    );
  } catch {
    await db
      .from("pwd_lms_account_emails")
      .update({ state: "failed" })
      .eq("id", log.id);
    throw new HttpError(
      503,
      "We could not send your account email. Please try again using “Resend access email”.",
    );
  }
}
export const accountEmailBucket = (email: string) =>
  "lms-address-" +
  createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
