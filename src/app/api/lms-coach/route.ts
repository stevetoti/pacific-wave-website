import { after } from "next/server";
import { consentVersion } from "@/lib/lms/coach/report";
import { researchTopic } from "@/lib/server/coach-research";
import { processCoachReports } from "@/lib/server/coach-report-worker";
import { NextResponse } from "next/server";
import { z } from "zod";
import { coachInput, coaches } from "@/lib/lms/coach/catalog";
import { coachContext, mintCoach } from "@/lib/server/lms-coach";
import { student, checked } from "@/lib/server/lms";
import { readJson, apiError, HttpError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
export const maxDuration = 300;
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams,
      course = z.uuid().parse(q.get("course"));
    const {
      context,
      notes,
      history,
      onboardingCompleted,
      access,
      consentAccepted,
    } = await coachContext(
      req,
      course,
      q.get("lesson") ? z.uuid().parse(q.get("lesson")) : null,
    );
    return json({
      context,
      notes,
      history,
      onboarding_completed: onboardingCompleted,
      access,
      consent_accepted: consentAccepted,
      available: Object.fromEntries(
        Object.entries(coaches).map(([k, v]) => [
          k,
          access.active &&
            !(k === "onboarding" && onboardingCompleted) &&
            !!process.env.ANAM_API_KEY &&
            !!process.env[v.personaEnv],
        ]),
      ),
    });
  } catch (e) {
    return apiError(e, "lms-coach/context");
  }
}
export async function POST(req: Request) {
  try {
    const input = await readJson(req, coachInput);
    if (input.action === "end") {
      const { db, user } = await student(req);
      const result = await db.rpc("pwd_lms_coach_finish", {
        p_user: user.id,
        p_course: input.course_id,
        p_session: input.session_id,
        p_transcript: input.transcript,
        p_complete: input.complete_onboarding || false,
      });
      if (result.error?.message.includes("onboarding_not_ready"))
        throw new HttpError(
          400,
          "Discuss your course with the tutor before completing onboarding.",
        );
      if (result.data) after(() => processCoachReports(input.session_id));
      return json({
        saved: !!checked(result),
        onboarding_completed: !!result.data && !!input.complete_onboarding,
      });
    }
    const { db, user, context, access, onboardingCompleted, consentAccepted } =
      await coachContext(
        req,
        input.course_id,
        input.action === "start" ? input.lesson_id : null,
      );
    if (input.action === "consent") {
      checked(
        await db
          .from("pwd_lms_coach_preferences")
          .upsert({
            user_id: user.id,
            consent_version: consentVersion,
            accepted_at: new Date().toISOString(),
          }),
      );
      return json({ consent_accepted: true });
    }
    if (input.action === "checkpoint") {
      checked(
        await db
          .from("pwd_lms_coach_sessions")
          .update({ transcript: input.transcript })
          .eq("id", input.session_id)
          .eq("user_id", user.id)
          .eq("course_id", input.course_id)
          .eq("state", "active"),
      );
      return json({ saved: true });
    }
    await rateLimit(
      req,
      `coach-${input.action}-${user.id}`,
      input.action === "start" ? 10 : 30,
    );
    if (input.action === "notes") {
      checked(
        await db.from("pwd_lms_coach_notes").upsert({
          user_id: user.id,
          course_id: input.course_id,
          notes: input.notes,
          updated_at: new Date().toISOString(),
        }),
      );
      return json({ saved: true });
    }
    if (!consentAccepted)
      throw new HttpError(
        403,
        "Please approve AI coaching and session reports once before starting.",
      );
    if (input.action === "research") {
      if (!access.active)
        throw new HttpError(403, "Your course coaching period has ended.");
      const session = checked(
        await db
          .from("pwd_lms_coach_sessions")
          .select("id")
          .eq("id", input.session_id)
          .eq("course_id", input.course_id)
          .eq("user_id", user.id)
          .maybeSingle(),
      );
      if (!session) throw new HttpError(403, "Session unavailable.");
      const reserve = await db.rpc("pwd_coach_reserve_research", {
        p_user: user.id,
        p_session: input.session_id,
        p_topic: input.topic,
      });
      if (reserve.error)
        throw new HttpError(
          429,
          "Live research is unavailable or this session's research allowance is used. Explain this and defer further research to the report.",
        );
      try {
        const result = await researchTopic(input.topic);
        const safe = result.sources.length
          ? result
          : {
              ...result,
              text: "No sources could be verified for this query. Do not present unverified claims as facts; explain the uncertainty.",
            };
        checked(
          await db
            .from("pwd_lms_coach_research")
            .update({ status: "ready", result: safe })
            .eq("id", reserve.data),
        );
        return json(safe);
      } catch (e) {
        await db
          .from("pwd_lms_coach_research")
          .update({ status: "failed" })
          .eq("id", reserve.data);
        throw e;
      }
    }
    if (!access.active)
      throw new HttpError(
        403,
        "The AI coaching period for this course has ended. Your saved notes and conversations remain available.",
      );
    if (input.role === "onboarding" && onboardingCompleted)
      throw new HttpError(
        409,
        "You have already completed onboarding for this course.",
      );
    const reservation = await db.rpc("pwd_lms_coach_reserve", {
      p_user: user.id,
      p_course: input.course_id,
      p_lesson: input.lesson_id || null,
      p_role: input.role,
    });
    if (reservation.error) {
      if (reservation.error.message.includes("onboarding_completed"))
        throw new HttpError(
          409,
          "You have already completed onboarding for this course.",
        );
      if (reservation.error.message.includes("active_session"))
        throw new HttpError(
          409,
          "You already have a video session. End it first, or wait for its 15-minute expiry.",
        );
      if (reservation.error.message.includes("daily_limit"))
        throw new HttpError(
          429,
          "You've used your eight video sessions for this 24-hour period. Your lessons and mentor chat are still available.",
        );
      throw reservation.error;
    }
    const id = reservation.data;
    try {
      const token = await mintCoach(input.role, {...context, preferred_language: input.language === "bi" ? "Bislama" : input.language === "fr" ? "French" : "English"});
      checked(
        await db
          .from("pwd_lms_coach_sessions")
          .update({ state: "active" })
          .eq("id", id),
      );
      return json({
        session_id: id,
        token,
        max_seconds: 900,
        expires_at: new Date(Date.now() + 900000).toISOString(),
      });
    } catch (e) {
      await db
        .from("pwd_lms_coach_sessions")
        .update({ state: "failed" })
        .eq("id", id);
      throw e;
    }
  } catch (e) {
    return apiError(e, "lms-coach/action");
  }
}
