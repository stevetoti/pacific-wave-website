import { NextResponse, after } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/server/rate-limit";
import { student, checked } from "@/lib/server/lms";
import { readJson, apiError, HttpError } from "@/lib/server/http";
import {
  advancedQuestionSchema,
  publicQuestions,
  answersSchema,
  assess,
} from "@/lib/lms/assessment";
import {
  queueOwnerNotification,
  sendOwnerNotifications,
} from "@/lib/server/owner-notifications";
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  try {
    const { db, user } = await student(request),
      lesson = z.uuid().parse(new URL(request.url).searchParams.get("lesson"));
    const attempts = checked(
      await db
        .from("pwd_lms_quiz_attempts")
        .select("id,state,score,feedback,started_at,submitted_at")
        .eq("user_id", user.id)
        .eq("lesson_id", lesson)
        .order("started_at", { ascending: false }),
    );
    return json({ attempts });
  } catch (e) {
    return apiError(e, "lms-quiz/get");
  }
}
export async function POST(request: Request) {
  try {
    const { db, user } = await student(request);
    await rateLimit(request, `lms-quiz-${user.id}`, 60);
    const input = await readJson(
      request,
      z.discriminatedUnion("action", [
        z.object({ action: z.literal("start"), lesson_id: z.uuid() }),
        z.object({
          action: z.literal("submit"),
          attempt_id: z.uuid(),
          answers: answersSchema,
        }),
      ]),
    );
    if (input.action === "start") {
      const r = await db.rpc("pwd_lms_begin_quiz", {
        p_user: user.id,
        p_lesson: input.lesson_id,
      });
      if (r.error) throw new HttpError(409, r.error.message);
      const a = r.data;
      return json({
        attempt: {
          id: a.id,
          started_at: a.started_at,
          settings: a.settings,
          questions: publicQuestions(a.questions),
        },
      });
    }
    const a = checked(
      await db
        .from("pwd_lms_quiz_attempts")
        .select("*")
        .eq("id", input.attempt_id)
        .eq("user_id", user.id)
        .maybeSingle(),
    );
    if (!a) throw new HttpError(404, "Attempt not found");
    const lesson = checked(
      await db
        .from("pwd_lms_lessons")
        .select("id,course_id,order_id,published,title")
        .eq("id", a.lesson_id)
        .single(),
    );
    if (!lesson) throw new HttpError(404, "Lesson unavailable");
    const o = checked(
      await db
        .from("pwd_lms_orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id)
        .in("status", ["paid", "granted"])
        .maybeSingle(),
    );
    if (
      !o ||
      !lesson.published ||
      (lesson.order_id && lesson.order_id !== o.id)
    )
      throw new HttpError(403, "Active course access required");
    if (a.state !== "started") {
      return json({ state: a.state, score: a.score });
    }
    const limit = a.settings.time_limit_minutes;
    if (limit > 0 && Date.now() > Date.parse(a.started_at) + limit * 60000) {
      checked(
        await db
          .from("pwd_lms_quiz_attempts")
          .update({ state: "expired", submitted_at: new Date().toISOString() })
          .eq("id", a.id)
          .eq("state", "started"),
      );
      throw new HttpError(
        409,
        "Time expired. Start a new attempt if available.",
      );
    }
    let result;
    try {
      result = assess(
        z.array(advancedQuestionSchema).parse(a.questions),
        input.answers,
      );
    } catch (e) {
      throw new HttpError(
        400,
        e instanceof Error ? e.message : "Check your answers",
      );
    }
    const state = result.manual
      ? "review"
      : result.score >= a.settings.pass_mark
        ? "passed"
        : "failed";
    const saved = checked(
      await db.rpc("pwd_lms_finish_quiz", {
        p_id: a.id,
        p_expected: "started",
        p_state: state,
        p_answers: input.answers,
        p_score: result.manual ? null : result.score,
        p_earned: result.earned,
        p_total: result.total,
        p_feedback: "",
        p_actor: null,
      }),
    );
    if (!saved)
      throw new HttpError(
        409,
        "Attempt already submitted. Refresh your results.",
      );
    await queueOwnerNotification(
      `quiz-${a.id}`,
      "Student quiz submission",
      `Student: ${user.email}\nLesson: ${lesson.title}\nResult: ${state}${result.manual ? "" : ` (${result.score}%)`}`,
    );
    after(sendOwnerNotifications);
    return json({ state, score: result.manual ? null : result.score });
  } catch (e) {
    return apiError(e, "lms-quiz/post");
  }
}
