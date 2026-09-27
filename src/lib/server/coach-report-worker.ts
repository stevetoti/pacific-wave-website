import "server-only";
import { getSupabaseAdmin } from "./clients";
import { checked } from "./lms";
import { reportServerError } from "./report-error";
import { researchTopic, composeReport } from "./coach-research";
import { reportEmail, reportPdf } from "./coach-report-format";
import { consentVersion, type CoachReport } from "@/lib/lms/coach/report";
import { coaches, type CoachRole } from "@/lib/lms/coach/catalog";
export async function processCoachReports(id?: string) {
  const disabled =
    process.env.TRAINING_EMAIL_MODE === "disabled" &&
    process.env.VERCEL_ENV !== "production";
  if (disabled && !id) return;
  const db = getSupabaseAdmin();
  if (!id) {
    checked(
      await db
        .from("pwd_lms_coach_sessions")
        .update({ state: "ended", ended_at: new Date().toISOString() })
        .in("state", ["starting", "active"])
        .lt("expires_at", new Date().toISOString()),
    );
  }
  const jobs = checked(
    await db.rpc("pwd_coach_claim_report", { p_id: id || null }),
  );
  for (const job of jobs || []) {
    try {
      const session = checked(
        await db
          .from("pwd_lms_coach_sessions")
          .select("*")
          .eq("id", job.session_id)
          .single(),
      );
      const consent = checked(
        await db
          .from("pwd_lms_coach_preferences")
          .select("consent_version")
          .eq("user_id", session.user_id)
          .maybeSingle(),
      );
      if (consent?.consent_version !== consentVersion) {
        checked(
          await db
            .from("pwd_lms_coach_reports")
            .update({
              state: "failed",
              email_state: "skipped",
              error: "AI report consent is required",
              locked_until: null,
            })
            .eq("session_id", session.id),
        );
        continue;
      }
      const course = checked(
        await db
          .from("pwd_lms_courses")
          .select("title")
          .eq("id", session.course_id)
          .single(),
      );
      if (!course) throw Error("Course unavailable");
      const profile = checked(
        await db
          .from("pwd_lms_profiles")
          .select("full_name")
          .eq("user_id", session.user_id)
          .maybeSingle(),
      );
      let report = job.report as CoachReport | null;
      if (!report) {
        const dialogue = Array.isArray(session.transcript)
          ? session.transcript
          : [];
        const liveResearch =
          checked(
            await db
              .from("pwd_lms_coach_research")
              .select("topic,result")
              .eq("session_id", session.id)
              .eq("status", "ready"),
          ) || [];
        const substantive = dialogue.some(
          (x: { role: string; content: string }) =>
            x.role === "user" && x.content?.trim(),
        );
        const research = substantive
          ? await researchTopic(
              JSON.stringify({
                course: course.title,
                conversation: dialogue,
                live_research_topics: liveResearch.map((r) => r.topic),
              }),
              true,
            )
          : {
              text: "No substantive conversation was captured.",
              sources: [],
              unverified_count: 0,
              searched_at: new Date().toISOString(),
            };
        const body = substantive
          ? await composeReport(
              {
                course: course.title,
                conversation: dialogue,
                live_research: liveResearch,
              },
              research,
            )
          : {
              title: "Session connection",
              summary:
                "No substantive student conversation was captured in this session.",
              discussion: [],
              learning_gaps: [],
              research: [],
              actions: ["Start a new voice session when you are ready."],
              limitations: [
                "No transcript was available to produce a researched learning guide.",
              ],
            };
        report = {
          ...body,
          sources: research.sources,
          course_title: course.title,
          coach_title: coaches[session.role as CoachRole].title,
          student_name: profile?.full_name || "Student",
          session_date: session.created_at,
          created_at: new Date().toISOString(),
        };
        checked(
          await db
            .from("pwd_lms_coach_reports")
            .update({
              report,
              state: "ready",
              error: null,
              updated_at: new Date().toISOString(),
            })
            .eq("session_id", session.id)
            .eq("locked_until", job.locked_until),
        );
        checked(
          await db
            .from("pwd_lms_coach_sessions")
            .update({ title: report.title })
            .eq("id", session.id)
            .is("title", null),
        );
      }
      if (disabled) {
        checked(
          await db
            .from("pwd_lms_coach_reports")
            .update({ email_state: "skipped", locked_until: null })
            .eq("session_id", session.id),
        );
        continue;
      }
      if (
        job.email_started_at &&
        Date.now() - Date.parse(job.email_started_at) > 23 * 3600000
      ) {
        checked(
          await db
            .from("pwd_lms_coach_reports")
            .update({
              email_state: "failed",
              error:
                "Email delivery needs review; automatic retry window expired",
              locked_until: null,
            })
            .eq("session_id", session.id),
        );
        continue;
      }
      let payload = job.email_payload;
      if (!payload) {
        const { data, error } = await db.auth.admin.getUserById(
          session.user_id,
        );
        if (error || !data.user.email) throw Error("Student email unavailable");
        const live =
          process.env.TRAINING_EMAIL_MODE === "live" &&
          process.env.VERCEL_ENV === "production";
        payload = {
          from:
            process.env.RESEND_FROM_EMAIL ||
            "Pacific Wave Digital <noreply@pacificwavedigital.com>",
          to: live ? data.user.email : "delivered@resend.dev",
          reply_to: "steve@pacificwavedigital.com",
          subject: `Your coaching report: ${report.title}`,
          ...reportEmail(
            report,
            `https://pacificwavedigital.com/training-center/sessions?session=${session.id}`,
          ),
          attachments: [
            {
              filename: "PWD-Coaching-Session.pdf",
              content: (await reportPdf(report)).toString("base64"),
            },
          ],
        };
        checked(
          await db
            .from("pwd_lms_coach_reports")
            .update({
              email_payload: payload,
              email_started_at: new Date().toISOString(),
            })
            .eq("session_id", session.id),
        );
      }
      checked(
        await db
          .from("pwd_lms_coach_reports")
          .update({
            email_state: "sending",
            email_attempts: job.email_attempts + 1,
          })
          .eq("session_id", session.id),
      );
      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `pwd-coach-report-${session.id}`,
        },
        body: JSON.stringify(payload),
      });
      if (!sent.ok) throw Error(`Report email HTTP ${sent.status}`);
      const receipt = await sent.json();
      checked(
        await db
          .from("pwd_lms_coach_reports")
          .update({
            email_state: "sent",
            provider_id: receipt.id,
            locked_until: null,
            updated_at: new Date().toISOString(),
          })
          .eq("session_id", session.id),
      );
    } catch (error) {
      await reportServerError("lms-coach/report-worker", error);
      const current = checked(
        await db
          .from("pwd_lms_coach_reports")
          .select("report,email_attempts")
          .eq("session_id", job.session_id)
          .single(),
      );
      checked(
        await db
          .from("pwd_lms_coach_reports")
          .update({
            state: current?.report
              ? "ready"
              : job.attempts >= 3
                ? "failed"
                : "queued",
            email_state:
              current?.report && current.email_attempts >= 3
                ? "failed"
                : "pending",
            error:
              "Report preparation or email delivery is temporarily unavailable. Retrying automatically where possible.",
            locked_until: null,
            next_at: new Date(Date.now() + 60000 * job.attempts).toISOString(),
          })
          .eq("session_id", job.session_id),
      );
    }
  }
}
