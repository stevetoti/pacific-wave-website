import { NextResponse } from "next/server";
import { z } from "zod";
import { coachInput, coaches } from "@/lib/lms/coach/catalog";
import { coachContext, mintCoach } from "@/lib/server/lms-coach";
import { student, checked } from "@/lib/server/lms";
import { readJson, apiError, HttpError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams,
      course = z.uuid().parse(q.get("course"));
    const { context, notes, history } = await coachContext(
      req,
      course,
      q.get("lesson") ? z.uuid().parse(q.get("lesson")) : null,
    );
    return json({
      context,
      notes,
      history,
      available: Object.fromEntries(
        Object.entries(coaches).map(([k, v]) => [
          k,
          !!process.env.ANAM_API_KEY && !!process.env[v.personaEnv],
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
      const updated = checked(
        await db
          .from("pwd_lms_coach_sessions")
          .update({
            state: "ended",
            ended_at: new Date().toISOString(),
            transcript: input.transcript,
          })
          .eq("id", input.session_id)
          .eq("course_id", input.course_id)
          .eq("user_id", user.id)
          .in("state", ["starting", "active"])
          .select("id"),
      );
      return json({ saved: !!updated?.length });
    }
    const { db, user, context } = await coachContext(
      req,
      input.course_id,
      input.action === "start" ? input.lesson_id : null,
    );
    await rateLimit(
      req,
      `coach-${input.action}-${user.id}`,
      input.action === "start" ? 10 : 30,
    );
    if (input.action === "notes") {
      checked(
        await db
          .from("pwd_lms_coach_notes")
          .upsert({
            user_id: user.id,
            course_id: input.course_id,
            notes: input.notes,
            updated_at: new Date().toISOString(),
          }),
      );
      return json({ saved: true });
    }
    const reservation = await db.rpc("pwd_lms_coach_reserve", {
      p_user: user.id,
      p_course: input.course_id,
      p_lesson: input.lesson_id || null,
      p_role: input.role,
    });
    if (reservation.error) {
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
      const token = await mintCoach(input.role, context);
      checked(
        await db
          .from("pwd_lms_coach_sessions")
          .update({ state: "active" })
          .eq("id", id),
      );
      return json({ session_id: id, token, max_seconds: 900 });
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
