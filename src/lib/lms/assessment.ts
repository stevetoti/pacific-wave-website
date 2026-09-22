import { z } from "zod";
export const questionKinds = [
  "single",
  "multiple",
  "true_false",
  "short",
  "blanks",
  "matching",
  "ordering",
  "essay",
] as const;
export const quizSettingsSchema = z.object({
  pass_mark: z.number().int().min(1).max(100).default(70),
  max_attempts: z.number().int().min(0).max(100).default(0),
  time_limit_minutes: z.number().int().min(0).max(240).default(0),
});
export const advancedQuestionSchema = z
  .object({
    type: z.enum(questionKinds).default("single"),
    question: z.string().trim().min(3).max(2000),
    options: z.array(z.string().trim().min(1).max(600)).max(20).default([]),
    answer: z.number().int().min(0).optional(),
    correct: z
      .array(
        z.union([z.string().trim().min(1).max(600), z.number().int().min(0)]),
      )
      .max(20)
      .optional(),
    prompts: z.array(z.string().trim().min(1).max(600)).max(20).optional(),
    points: z.number().int().min(1).max(100).default(1),
    explanation: z.string().max(2000).default(""),
    case_sensitive: z.boolean().default(false),
  })
  .superRefine((q, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    if (
      ["single", "true_false"].includes(q.type) &&
      (q.options.length < 2 ||
        q.answer === undefined ||
        q.answer >= q.options.length)
    )
      fail("Choose a valid correct option");
    if (q.type === "true_false" && q.options.length !== 2)
      fail("True/false needs two options");
    if (["multiple", "matching", "ordering"].includes(q.type)) {
      if (
        q.options.length < 2 ||
        !q.correct?.length ||
        q.correct.some((v) => typeof v !== "number" || v >= q.options.length)
      )
        fail("Set valid correct option numbers");
      if (
        q.type === "multiple" &&
        new Set(q.correct).size !== q.correct?.length
      )
        fail("Correct options must be unique");
      if (
        q.type === "matching" &&
        (!q.prompts?.length || q.correct?.length !== q.prompts.length)
      )
        fail("Provide an answer for each matching prompt");
      if (
        q.type === "ordering" &&
        (q.correct?.length !== q.options.length ||
          new Set(q.correct).size !== q.options.length)
      )
        fail("Order must include each option once");
    }
    if (
      ["short", "blanks"].includes(q.type) &&
      (!q.correct?.length || q.correct.some((v) => typeof v !== "string"))
    )
      fail("Provide accepted text answers");
    if (
      q.type === "blanks" &&
      (q.question.match(/\[\[blank\]\]/g) || []).length !== q.correct?.length
    )
      fail("Use one [[blank]] marker for each blank answer");
  });
export type AssessmentQuestion = z.infer<typeof advancedQuestionSchema>;
export type QuizSettings = z.infer<typeof quizSettingsSchema>;
export type QuizAnswer = number | string | (number | string)[];
export const answersSchema = z
  .array(
    z.union([
      z.number().int(),
      z.string().max(12000),
      z.array(z.union([z.number().int(), z.string().max(600)])).max(20),
    ]),
  )
  .max(100);
export function publicQuestions(questions: unknown) {
  return z
    .array(advancedQuestionSchema)
    .parse(questions)
    .map(({ type, question, options, prompts, points }) => ({
      type,
      question,
      options,
      prompts,
      points,
    }));
}
export function assess(questions: AssessmentQuestion[], answers: QuizAnswer[]) {
  if (answers.length !== questions.length) throw Error("Answer every question");
  let earned = 0,
    total = 0,
    manual = 0;
  const marks = questions.map((q, i) => {
    total += q.points;
    const a = answers[i];
    const norm = (s: string) =>
      q.case_sensitive ? s.trim() : s.trim().toLocaleLowerCase("en");
    let correct = false;
    if (["single", "true_false"].includes(q.type)) {
      if (typeof a !== "number" || a < 0 || a >= q.options.length)
        throw Error("Choose an answer for every question");
      correct = a === q.answer;
    } else if (["multiple", "matching", "ordering"].includes(q.type)) {
      if (
        !Array.isArray(a) ||
        !a.length ||
        a.some((v) => typeof v !== "number" || v < 0 || v >= q.options.length)
      )
        throw Error("Complete every selection");
      if (q.type === "multiple" && new Set(a).size !== a.length)
        throw Error("Duplicate selections");
      if (q.type !== "multiple" && a.length !== q.correct!.length)
        throw Error("Complete every selection");
      correct =
        q.type === "multiple"
          ? a.length === q.correct!.length &&
            a.every((v) => q.correct!.includes(v))
          : a.every((v, j) => v === q.correct![j]);
    } else if (q.type === "blanks") {
      if (
        !Array.isArray(a) ||
        a.length !== q.correct!.length ||
        a.some((v) => typeof v !== "string" || !v.trim())
      )
        throw Error("Fill every blank");
      correct = a.every(
        (v, j) => norm(String(v)) === norm(String(q.correct![j])),
      );
    } else {
      if (typeof a !== "string" || !a.trim())
        throw Error("Write an answer for every question");
      if (q.type === "essay") manual += q.points;
      else correct = q.correct!.some((v) => norm(String(v)) === norm(a));
    }
    const points = correct ? q.points : 0;
    earned += points;
    return points;
  });
  return {
    earned,
    total,
    manual,
    marks,
    score: Math.round((100 * earned) / total),
  };
}
