"use client";
import { useRef, useState } from "react";
import { z } from "zod";
import { advancedQuestionSchema } from "@/lib/lms/assessment";
import type { Question } from "@/lib/lms/types";
import { questionKinds, type QuizSettings } from "@/lib/lms/assessment";
const labels = {
  single: "Single choice",
  multiple: "Multiple answers",
  true_false: "True / false",
  short: "Short answer",
  blanks: "Fill in the blanks",
  matching: "Matching",
  ordering: "Ordering",
  essay: "Written answer / essay",
};
export default function QuizBuilder({
  questions,
  onChange,
  settings,
  onSettings,
}: {
  questions: Question[];
  onChange: (q: Question[]) => void;
  settings: QuizSettings;
  onSettings: (s: QuizSettings) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState("");
  const patch = (i: number, v: Partial<Question>) =>
    onChange(questions.map((q, j) => (j === i ? { ...q, ...v } : q)));
  return (
    <section className="qb-builder">
      <h3>Assessment builder</h3>
      <div className="qb-toolbar">
        <button
          type="button"
          className="lms-text"
          onClick={() => fileInput.current?.click()}
        >
          Import question bank (JSON)
        </button>
        <button
          type="button"
          className="lms-text"
          disabled={!questions.length}
          onClick={() => {
            const blob = new Blob([JSON.stringify(questions, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob),
              a = document.createElement("a");
            a.href = url;
            a.download = "question-bank.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export question bank
        </button>
      </div>
      <input
        ref={fileInput}
        hidden
        type="file"
        accept="application/json,.json"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            if (file.size > 120000)
              throw Error("Question bank must be under 120 KB");
            const data = z
              .array(advancedQuestionSchema)
              .max(100)
              .parse(JSON.parse(await file.text()));
            if (questions.length + data.length > 100)
              throw Error("A quiz supports up to 100 questions");
            onChange([...questions, ...data]);
            setImportError("");
          } catch (e) {
            setImportError(
              e instanceof Error ? e.message : "Invalid question bank",
            );
          } finally {
            if (fileInput.current) fileInput.current.value = "";
          }
        }}
      />
      {importError && (
        <p className="lms-alert" role="alert">
          {importError}
        </p>
      )}
      <p>
        Combine question types, award points and choose how students pass.
        Written answers are reviewed by an instructor.
      </p>
      <div className="lms-grid">
        {(
          [
            ["pass_mark", "Pass mark (%)", 1, 100],
            ["max_attempts", "Maximum attempts (0 = unlimited)", 0, 100],
            [
              "time_limit_minutes",
              "Time limit in minutes (0 = untimed)",
              0,
              240,
            ],
          ] as const
        ).map(([key, label, min, max]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min={min}
              max={max}
              required
              value={settings[key]}
              onChange={(e) =>
                onSettings({ ...settings, [key]: Number(e.target.value) })
              }
            />
          </label>
        ))}
      </div>
      {questions.map((q, i) => {
        const type = q.type || "single";
        return (
          <article className="lms-bank qb-question" key={i}>
            <div className="qb-toolbar">
              <strong>Question {i + 1}</strong>
              <div>
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...questions];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    onChange(next);
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange([
                      ...questions.slice(0, i + 1),
                      { ...q },
                      ...questions.slice(i + 1),
                    ])
                  }
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => onChange(questions.filter((_, j) => i !== j))}
                >
                  Remove
                </button>
              </div>
            </div>
            <label>
              Question type
              <select
                value={type}
                onChange={(e) => {
                  const type = e.target.value as (typeof questionKinds)[number];
                  patch(i, {
                    type,
                    options: type === "true_false" ? ["True", "False"] : [],
                    answer: undefined,
                    correct: [],
                    prompts: [],
                    answer_spec: "",
                  });
                }}
              >
                {questionKinds.map((t) => (
                  <option value={t} key={t}>
                    {labels[t]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Question
              <textarea
                required
                value={q.question}
                onChange={(e) => patch(i, { question: e.target.value })}
              />
            </label>
            {type === "blanks" && (
              <p>
                Use <code>[[blank]]</code> at each missing word. Enter one
                correct answer per blank below, in the same order.
              </p>
            )}
            <label>
              Points
              <input
                type="number"
                min="1"
                max="100"
                required
                value={q.points ?? 1}
                onChange={(e) => patch(i, { points: Number(e.target.value) })}
              />
            </label>
            {[
              "single",
              "multiple",
              "true_false",
              "matching",
              "ordering",
            ].includes(type) && (
              <>
                <label>
                  Options — one per line
                  <textarea
                    required
                    rows={4}
                    value={q.options.join("\n")}
                    onChange={(e) =>
                      patch(i, { options: e.target.value.split("\n") })
                    }
                  />
                </label>
                {type === "matching" && (
                  <label>
                    Prompts to match — one per line
                    <textarea
                      required
                      value={(q.prompts || []).join("\n")}
                      onChange={(e) =>
                        patch(i, { prompts: e.target.value.split("\n") })
                      }
                    />
                  </label>
                )}
                {["single", "true_false"].includes(type) ? (
                  <label>
                    Correct answer
                    <select
                      required
                      value={q.answer ?? ""}
                      onChange={(e) =>
                        patch(i, { answer: Number(e.target.value) })
                      }
                    >
                      <option value="">Choose correct option</option>
                      {q.options.map((o, j) => (
                        <option key={j} value={j}>
                          {j + 1}. {o}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label>
                    {type === "multiple"
                      ? "Correct option numbers (e.g. 1,3)"
                      : type === "matching"
                        ? "Matching option number for each prompt (e.g. 2,1,3)"
                        : "Option numbers in the correct order (e.g. 3,1,2)"}
                    <input
                      required
                      value={
                        q.answer_spec ??
                        (q.correct || []).map((n) => Number(n) + 1).join(",")
                      }
                      onChange={(e) =>
                        patch(i, {
                          answer_spec: e.target.value,
                          correct: e.target.value
                            .split(",")
                            .filter((v) => v.trim())
                            .map((v) => Number(v) - 1),
                        })
                      }
                    />
                  </label>
                )}
              </>
            )}
            {["short", "blanks"].includes(type) && (
              <>
                <label>
                  {type === "short"
                    ? "Accepted answers — one alternative per line"
                    : "Correct answers — one per blank"}
                  <textarea
                    required
                    value={(q.correct || []).join("\n")}
                    onChange={(e) =>
                      patch(i, { correct: e.target.value.split("\n") })
                    }
                  />
                </label>
                <label className="lms-check">
                  <input
                    type="checkbox"
                    checked={q.case_sensitive || false}
                    onChange={(e) =>
                      patch(i, { case_sensitive: e.target.checked })
                    }
                  />
                  Case-sensitive answers
                </label>
              </>
            )}
            <label>
              {type === "essay"
                ? "Instructor marking guide"
                : "Instructor explanation / marking notes"}
              <textarea
                value={q.explanation || ""}
                onChange={(e) => patch(i, { explanation: e.target.value })}
              />
            </label>
          </article>
        );
      })}
      <button
        type="button"
        className="lms-button"
        disabled={questions.length >= 100}
        onClick={() =>
          onChange([
            ...questions,
            { type: "single", question: "", options: ["", ""], points: 1 },
          ])
        }
      >
        + Add question
      </button>
    </section>
  );
}
