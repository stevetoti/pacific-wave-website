import "server-only";
import { spokenTime, coachingWindow, programOutline } from "@/lib/lms/coach/schedule";
import { octoberOutline } from "@/lib/training/outline";
import type { Cohort } from "@/lib/training/config";
import { student, checked } from "./lms";
import { HttpError } from "./http";
import {
  coaches,
  coachPrompt,
  visibleLesson,
  type CoachRole,
} from "@/lib/lms/coach/catalog";

export async function coachContext(
  request: Request,
  courseId: string,
  lessonId?: string | null,
) {
  const { db, user } = await student(request);
  const order = checked(
    await db
      .from("pwd_lms_orders")
      .select("id,name,status")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .in("status", ["paid", "granted"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
  if (!order)
    throw new HttpError(
      403,
      "Active course access is required to use your AI tutors.",
    );
  const course = checked(
    await db
      .from("pwd_lms_courses")
      .select("id,slug,title,description,introduction,private_sessions,cohort_id,coaching_ends_on")
      .eq("id", courseId)
      .single(),
  );
  if (!course) throw new HttpError(404, "Course not found.");
  const cohort = course.cohort_id ? checked(await db.from("pwd_training_cohorts").select("config").eq("id", course.cohort_id).single())?.config as Cohort | null : null;
  const [p, l, g, n, h] = await Promise.all([
    db
      .from("pwd_lms_profiles")
      .select(
        "full_name,city,country,occupation,organization,bio,learning_goals,timezone",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    db
      .from("pwd_lms_lessons")
      .select("id,title,content,position,published,order_id,starts_at,section_title")
      .eq("course_id", courseId)
      .eq("published", true)
      .or(
        course.private_sessions
          ? `order_id.eq.${order.id}`
          : `order_id.is.null,order_id.eq.${order.id}`,
      )
      .order("position"),
    db
      .from("pwd_lms_progress")
      .select("lesson_id,score,completed_at")
      .eq("user_id", user.id),
    db
      .from("pwd_lms_coach_notes")
      .select("notes,updated_at,onboarding_completed_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle(),
    db
      .from("pwd_lms_coach_sessions")
      .select("id,role,created_at,transcript")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("state", "ended")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  const lessons = (checked(l) || []).filter((x) =>
    visibleLesson(x, order.id, !!course.private_sessions),
  );
  const current = lessonId ? lessons.find((x) => x.id === lessonId) : null;
  if (lessonId && !current)
    throw new HttpError(403, "This lesson is not available for coaching.");
  const profile = checked(p),
    progress = (checked(g) || []).filter((x) =>
      lessons.some((v) => v.id === x.lesson_id),
    ),
    notes = checked(n),
    history = checked(h) || [];
  const context = {
    as_of: new Date().toISOString(),
    student: { name: profile?.full_name || order.name, ...profile },
    course,
    schedule: cohort ? { timezone: cohort.timezone, days: cohort.daysLabel, time: cohort.timeLabel, spoken_time: spokenTime(cohort.timeLabel), starts_at: cohort.start, teaching_ends_at: cohort.teachingEnd, action_period_ends: cohort.actionEnd, session_dates: cohort.dates, teaching_hours: cohort.hours, venue: cohort.venue, fixed_timetable: true } : { fixed_timetable: !course.private_sessions, note: "Use published lesson appointments; ask the instructor for any missing dates." },
    course_outline: course.slug === "vanuatu-october-2026" ? octoberOutline.map(([title, body], i) => ({title: `Week ${i + 1}: ${title}`, body})) : programOutline(course.slug),
    lessons: lessons.map((x) => ({
      id: x.id,
      title: x.title,
      module: x.section_title,
      starts_at: x.starts_at,
    })),
    current_lesson: current
      ? { title: current.title, content: current.content.slice(0, 16000) }
      : null,
    progress,
    student_confirmed_notes: notes,
    previous_sessions: history.map((x) => ({
      role: x.role,
      date: x.created_at,
      source: "Student device transcript; not verified assessment evidence",
      recent_dialogue: (Array.isArray(x.transcript) ? x.transcript : [])
        .slice(-8)
        .map((line: { role: string; content: string }) => ({
          role: line.role,
          content: String(line.content).slice(0, 800),
        })),
    })),
  };
  return { db, user, context, notes: notes?.notes || "", history, onboardingCompleted: !!notes?.onboarding_completed_at, access: coachingWindow(course, cohort, lessons.map(x => x.starts_at)) };
}
export async function mintCoach(
  role: CoachRole,
  context: Awaited<ReturnType<typeof coachContext>>["context"],
) {
  const key = process.env.ANAM_API_KEY,
    personaId = process.env[coaches[role].personaEnv];
  if (!key || !personaId)
    throw new HttpError(
      503,
      "This video tutor is not configured yet. Please contact your instructor.",
    );
  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  const detail = await fetch(
    `https://api.anam.ai/v1/personas/${encodeURIComponent(personaId)}`,
    { headers, signal: AbortSignal.timeout(10000) },
  );
  if (!detail.ok)
    throw new Error(`Anam persona lookup failed (${detail.status})`);
  const p = await detail.json();
  const avatarId = p.avatar?.id || p.avatarId,
    voiceId = p.voice?.id || p.voiceId,
    llmId = p.llmId || p.brain?.llmId;
  if (!avatarId || !voiceId || !llmId)
    throw new Error("Anam persona configuration incomplete");
  const r = await fetch("https://api.anam.ai/v1/auth/session-token", {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      personaConfig: {
        name: coaches[role].title,
        avatarId,
        voiceId,
        llmId,
        systemPrompt: coachPrompt(role, context),
        initialMessage: `Hello ${String(context.student.name || "there").split(" ")[0]}! I'm your ${coaches[role].title}. ${role === "onboarding" ? "Welcome to your course. Let’s walk through the course outline, the published class timetable, and how to use your coaches. Shall we start with the course journey?" : role === "class_assistant" && context.current_lesson ? `Let's work on ${context.current_lesson.title}. What would you like to understand better?` : "What would you like to work on together today?"}`,
        maxSessionLengthSeconds: 900,
        ...(p.avatarModel ? { avatarModel: p.avatarModel } : {}),
      },
    }),
  });
  if (!r.ok) throw new Error(`Anam session creation failed (${r.status})`);
  const data = await r.json();
  const token = data.sessionToken || data.session_token;
  if (!token) throw new Error("Anam session token missing");
  return token as string;
}
