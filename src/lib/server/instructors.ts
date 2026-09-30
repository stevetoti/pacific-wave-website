import "server-only";
import { getSupabaseAdmin } from "./clients";
import { reportServerError } from "./report-error";
import { trainingTemplate } from "../email/training-template";
// Invites an instructor to the Teaching workspace. New accounts get a secure set-password link.
export async function sendInstructorInvite({
  userId,
  email,
  name,
  newAccount,
}: {
  userId: string;
  email: string;
  name: string;
  newAccount: boolean;
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
  try {
    let url = `${origin}/training-center/account?mode=signin&next=teach`;
    if (newAccount) {
      const link = await db.auth.admin.generateLink({ type: "recovery", email });
      if (link.error) throw link.error;
      url = `${origin}/training-center/account?verify=${encodeURIComponent(link.data.properties.hashed_token)}&type=recovery&next=teach`;
    }
    const { data: rows } = await db
      .from("pwd_lms_course_instructors")
      .select("pwd_lms_courses(title)")
      .eq("user_id", userId);
    const titles = ((rows || []) as unknown as { pwd_lms_courses: { title: string } | null }[])
      .map((r) => r.pwd_lms_courses?.title)
      .filter(Boolean) as string[];
    const first = name.trim().split(/\s+/)[0];
    const content = trainingTemplate({
      title: first ? `Welcome to the teaching team, ${first}` : "Welcome to the teaching team",
      intro: `You've been added as an instructor at Pacific Wave Digital Training Centre${titles.length ? ` for ${titles.join(", ")}` : ""}. Your Teaching workspace is where you manage lessons, recordings, quizzes, grading, announcements and conversations with your students.`,
      details: newAccount
        ? [
            "Use the secure button below to confirm your email and choose your password. Then sign in and you'll go straight to your Teaching workspace.",
            "Please add a photo, your title and a short bio in your instructor profile. Students see it on the course page.",
          ]
        : [
            "Sign in with your existing Pacific Wave Digital account. You'll go straight to your Teaching workspace.",
            "Please check your instructor profile (photo, title and bio). Students see it on the course page.",
          ],
      action: newAccount ? "Set my password" : "Open my Teaching workspace",
      url,
    });
    const { data: log } = await db
      .from("pwd_lms_account_emails")
      .insert({ email, purpose: "instructor_invite", state: "pending" })
      .select("id")
      .single();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(12000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(log ? { "Idempotency-Key": `pwd-instructor-${log.id}` } : {}),
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Pacific Wave Digital <noreply@pacificwavedigital.com>",
        to: live ? email : "delivered@resend.dev",
        reply_to: "steve@pacificwavedigital.com",
        subject: "You're invited to teach at Pacific Wave Digital Training Centre",
        ...content,
      }),
    });
    const result = response.ok ? await response.json() : null;
    if (log)
      await db
        .from("pwd_lms_account_emails")
        .update(
          result?.id
            ? { provider_id: result.id, state: live ? "accepted" : "test_accepted" }
            : { state: "failed" },
        )
        .eq("id", log.id);
    if (!result?.id) throw Error("Provider rejected instructor invite");
  } catch (error) {
    await reportServerError("lms/instructor-invite", error);
  }
}
