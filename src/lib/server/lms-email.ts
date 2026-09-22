import "server-only";
import { trainingTemplate } from "../email/training-template";
import { getSupabaseAdmin } from "./clients";
import { reportServerError } from "./report-error";
import { money } from "../lms/types";
export async function sendLmsEmails() {
  // Isolated local QA must not claim messages from the shared production queue.
  if (
    process.env.VERCEL_ENV !== "production" &&
    process.env.TRAINING_EMAIL_MODE === "disabled"
  )
    return;
  const db = getSupabaseAdmin();
  const { data: jobs, error } = await db.rpc("pwd_lms_claim_emails");
  if (error) {
    await reportServerError("lms/email-claim", error);
    return;
  }
  const live =
    process.env.TRAINING_EMAIL_MODE === "live" &&
    process.env.VERCEL_ENV === "production";
  for (const job of jobs || []) {
    try {
      const { data: order, error } = await db
        .from("pwd_lms_orders")
        .select("*,pwd_lms_courses(title)")
        .eq("id", job.order_id)
        .single();
      if (error || !order) throw new Error("Email order unavailable");
      const status: Record<string, string> = {
        pending:
          "Your course registration is saved. Use the payment button below to complete enrolment by card or bank transfer. For bank transfer, upload your proof and allow our team to verify the deposit.",
        review:
          "Your bank payment proof has been received and is awaiting verification. You can view your introduction and class timetable now.",
        granted:
          "Your course access has been granted by our team. Open your dashboard to begin learning. No additional course payment is required for this grant.",
        revoked:
          "Your manual course access has been removed. Reply to this email if you need assistance.",
        paid: "Your payment is confirmed. Published lessons are now available in your course dashboard.",
        rejected:
          "Your payment proof needs attention. Please open your dashboard to read the review note and upload corrected proof.",
        refunded:
          "Your course payment has been refunded. Paid lesson access is no longer active.",
      };
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `pwd-lms-${job.id}-${live ? "live" : "test"}`,
        },
        body: JSON.stringify({
          from:
            process.env.RESEND_FROM_EMAIL ||
            "Pacific Wave Digital <noreply@pacificwavedigital.com>",
          to: live ? order.email : "delivered@resend.dev",
          ...(live ? { bcc: "steve@pacificwavedigital.com" } : {}),
          reply_to: "steve@pacificwavedigital.com",
          subject: `Training update: ${order.pwd_lms_courses.title}`,
          ...trainingTemplate({
            title:
              order.method === "coupon"
                ? "Your course access is ready"
                : `Your training ${job.status === "paid" ? "payment is confirmed" : "registration update"}`,
            intro: `Hello ${order.name}. ${order.method === "coupon" && job.status === "paid" ? "Your full discount is applied. Published lessons are now available in your dashboard." : status[job.status] || "Your registration has been updated."}`,
            action: ["pending", "rejected"].includes(job.status)
              ? "Complete or review my payment"
              : "Open my course",
            url: ["pending", "rejected"].includes(job.status)
              ? `https://pacificwavedigital.com/training-center/checkout?course=${encodeURIComponent(order.course_id)}`
              : `https://pacificwavedigital.com/training-center/course/${encodeURIComponent(order.course_id)}`,
            secondary: {
              action: "Open my learning dashboard",
              url: "https://pacificwavedigital.com/training-center/dashboard",
            },
            details: [
              `Course: ${order.pwd_lms_courses.title}`,
              `Fee: ${money(order.amount, order.currency)} · Reference: ${order.id}`,
              "Your course space brings together lessons, recordings, practical activities and instructor support. Reply to this email if you need help with your enrolment.",
            ],
          }),
        }),
      });
      if (!response.ok)
        throw new Error("Email provider rejected training update");
      const saved = await db
        .from("pwd_lms_emails")
        .update({
          state: live ? "accepted" : "test_accepted",
          locked_until: null,
        })
        .eq("id", job.id);
      if (saved.error) throw saved.error;
    } catch (error) {
      await reportServerError("lms/email", error);
      await db
        .from("pwd_lms_emails")
        .update({ locked_until: null })
        .eq("id", job.id);
    }
  }
}
