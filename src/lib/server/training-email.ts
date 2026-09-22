import "server-only";
import { getSupabaseAdmin } from "./clients";
import { reportServerError } from "./report-error";
import { trainingEmails } from "../training/email-templates";
import type { Registration } from "../training/schema";

export async function notifyTraining(id: string) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("pwd_claim_training_email", {
    registration_id: id,
  });
  if (error) throw error;
  const record = data?.[0] as Registration | undefined;
  if (!record) return;
  // Preview and local runs cannot contact students or the company mailbox.
  const live =
    process.env.TRAINING_EMAIL_MODE === "live" &&
    process.env.VERCEL_ENV === "production";
  const templates = trainingEmails(record);
  try {
    for (const kind of ["student", "internal"] as const) {
      if (["accepted", "test_accepted"].includes(record[`${kind}_email_state`]))
        continue;
      try {
        if (!process.env.RESEND_API_KEY)
          throw new Error("Email not configured");
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          signal: AbortSignal.timeout(10000),
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `training-${id}-${kind}-${live ? "live" : "test"}`,
          },
          body: JSON.stringify({
            from:
              process.env.RESEND_FROM_EMAIL ||
              "Pacific Wave Digital <noreply@pacificwavedigital.com>",
            to: live
              ? kind === "student"
                ? record.email
                : "steve@pacificwavedigital.com"
              : "delivered@resend.dev",
            reply_to: "steve@pacificwavedigital.com",
            ...templates[kind],
          }),
        });
        if (!response.ok)
          throw new Error("Training email provider rejected notification");
        const { error: saveError } = await db
          .from("pwd_training_registrations")
          .update({
            [`${kind}_email_state`]: live ? "accepted" : "test_accepted",
          })
          .eq("id", id);
        if (saveError) throw saveError;
      } catch (error) {
        await reportServerError(`/api/training/email/${kind}`, error);
      }
    }
  } finally {
    const { error: unlockError } = await db
      .from("pwd_training_registrations")
      .update({ email_lock_until: null })
      .eq("id", id);
    if (unlockError)
      await reportServerError("/api/training/email/unlock", unlockError);
  }
}
