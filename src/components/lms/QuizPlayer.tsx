"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import type { Lesson, Question } from "@/lib/lms/types";
import type { QuizAnswer, QuizSettings } from "@/lib/lms/assessment";
type Attempt = {
  id: string;
  started_at: string;
  settings: QuizSettings;
  questions: Question[];
};
type Result = {
  id: string;
  state: string;
  score: number | null;
  feedback: string;
  started_at: string;
};
export default function QuizPlayer({
  lesson,
  onComplete,
}: {
  lesson: Lesson;
  onComplete: () => Promise<void>;
}) {
  const [attempt, setAttempt] = useState<Attempt | null>(null),
    [history, setHistory] = useState<Result[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [remaining, setRemaining] = useState<number | null>(null);
  async function load() {
    const r = await authFetch(`/api/lms-quiz?lesson=${lesson.id}`),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    setHistory(d.attempts);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [lesson.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!attempt?.settings.time_limit_minutes) {
      setRemaining(null);
      return;
    }
    const tick = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (Date.parse(attempt.started_at) +
              attempt.settings.time_limit_minutes * 60000 -
              Date.now()) /
              1000,
          ),
        ),
      );
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [attempt]);
  async function post(body: unknown) {
    const r = await authFetch("/api/lms-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    return d;
  }
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="qb-player">
      <h3>Check your understanding</h3>
      <p>
        Pass mark: {lesson.quiz_settings?.pass_mark ?? 70}%.{" "}
        {lesson.quiz_settings?.max_attempts
          ? `${lesson.quiz_settings.max_attempts} attempts allowed.`
          : "Unlimited attempts."}{" "}
        {lesson.quiz_settings?.time_limit_minutes
          ? `${lesson.quiz_settings.time_limit_minutes} minutes per attempt. The timer continues if you leave this page.`
          : "Complete this quiz at your own pace."}
      </p>
      {error && (
        <p role="alert" className="lms-alert">
          {error}
        </p>
      )}
      {!attempt ? (
        <button
          className="lms-button"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const d = await post({ action: "start", lesson_id: lesson.id });
              setAttempt(d.attempt);
            })
          }
        >
          Start / resume quiz
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(async () => {
              const answers: QuizAnswer[] = attempt.questions.map((q, i) => {
                const t = q.type || "single";
                if (t === "multiple") return f.getAll(`q${i}`).map(Number);
                if (["matching", "ordering", "blanks"].includes(t)) {
                  const count =
                    t === "matching"
                      ? q.prompts?.length || 0
                      : t === "ordering"
                        ? q.options.length
                        : (q.question.match(/\[\[blank\]\]/g) || []).length;
                  return Array.from({ length: count }, (_, j) =>
                    t === "blanks"
                      ? String(f.get(`q${i}_${j}`) || "")
                      : Number(f.get(`q${i}_${j}`)),
                  );
                }
                if (["short", "essay"].includes(t))
                  return String(f.get(`q${i}`) || "");
                return Number(f.get(`q${i}`));
              });
              await post({ action: "submit", attempt_id: attempt.id, answers });
              setAttempt(null);
              await load();
              await onComplete();
            });
          }}
        >
          {remaining !== null && (
            <p className="lms-notice" role="timer">
              Time remaining: {Math.floor(remaining / 60)}:
              {String(remaining % 60).padStart(2, "0")}
            </p>
          )}
          <fieldset disabled={busy || remaining === 0}>
            {attempt.questions.map((q, i) => {
              const t = q.type || "single";
              return (
                <fieldset className="lms-quiz" key={i}>
                  <legend>
                    {i + 1}. {q.question.replaceAll("[[blank]]", "______")}{" "}
                    <small>({q.points ?? 1} points)</small>
                  </legend>
                  {["single", "true_false", "multiple"].includes(t) &&
                    q.options.map((o, j) => (
                      <label className="lms-check" key={j}>
                        <input
                          required={t !== "multiple"}
                          type={t === "multiple" ? "checkbox" : "radio"}
                          name={`q${i}`}
                          value={j}
                        />
                        {o}
                      </label>
                    ))}
                  {["short", "essay"].includes(t) && (
                    <textarea
                      aria-label={`Answer ${i + 1}`}
                      name={`q${i}`}
                      required
                      maxLength={12000}
                      rows={t === "essay" ? 6 : 2}
                    />
                  )}
                  {t === "blanks" &&
                    Array.from(
                      {
                        length: (q.question.match(/\[\[blank\]\]/g) || [])
                          .length,
                      },
                      (_, j) => (
                        <label key={j}>
                          Blank {j + 1}
                          <input required name={`q${i}_${j}`} maxLength={600} />
                        </label>
                      ),
                    )}
                  {["matching", "ordering"].includes(t) &&
                    (t === "matching"
                      ? q.prompts || []
                      : q.options.map((_, j) => `Position ${j + 1}`)
                    ).map((prompt, j) => (
                      <label key={j}>
                        {prompt}
                        <select required defaultValue="" name={`q${i}_${j}`}>
                          <option value="">Choose an option</option>
                          {q.options.map((o, k) => (
                            <option value={k} key={k}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                </fieldset>
              );
            })}
            <button className="lms-button">Submit answers</button>
          </fieldset>
          {remaining === 0 && (
            <button
              type="button"
              onClick={() => {
                setAttempt(null);
                load().catch((e) => setError(e.message));
              }}
            >
              Time expired — return to attempts
            </button>
          )}
        </form>
      )}
      {!!history.length && (
        <div className="lms-bank">
          <h4>Your attempts</h4>
          {history.map((a) => (
            <p key={a.id}>
              {new Date(a.started_at).toLocaleString()} ·{" "}
              {a.state === "review" ? "Awaiting instructor review" : a.state}
              {a.score !== null ? ` · ${a.score}%` : ""}
              {a.feedback && (
                <>
                  <br />
                  Instructor feedback: {a.feedback}
                </>
              )}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
