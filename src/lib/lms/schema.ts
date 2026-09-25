import { advancedQuestionSchema, quizSettingsSchema } from "./assessment";
import { z } from "zod";
export const bankSchema = z.object({
  bank: z.enum(["ANZ", "BRED"]),
  account_name: z.string().trim().min(2).max(160),
  account_number: z.string().trim().min(3).max(80),
  branch: z.string().trim().min(2).max(160),
  swift_code: z.string().trim().max(11).optional(),
  bank_address: z.string().trim().max(200).optional(),
  currency: z.enum(["VUV", "USD", "AUD"]),
});
export const courseSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  title: z.string().trim().min(3).max(180),
  description: z.string().max(2000),
  introduction: z.string().max(12000),
  kind: z.enum(["live", "recorded"]),
  amount: z.number().int().min(1).max(100000000),
  currency: z.enum(["VUV", "USD", "AUD"]),
  published: z.boolean(),
  enrollment_open: z.boolean(),
  private_sessions: z.boolean().optional(),
  coaching_ends_on: z.iso.date().nullable().optional(),
});
export const questionSchema = z
  .object({
    question: z.string().min(3).max(600),
    options: z.array(z.string().min(1).max(300)).min(2).max(6),
    answer: z.number().int().min(0),
  })
  .refine((q) => q.answer < q.options.length, "Answer must match an option");
export const lessonSchema = z.object({
  order_id: z.uuid().nullable().optional(),
  recording_path: z
    .string()
    .regex(/^$|^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(mp4|webm)$/)
    .optional(),
  id: z.uuid().optional(),
  course_id: z.uuid(),
  title: z.string().trim().min(2).max(180),
  position: z.number().int().min(0).max(10000),
  starts_at: z.iso.datetime({ offset: true }).nullable(),
  content: z.string().max(20000),
  youtube_id: z.string().regex(/^$|^[a-zA-Z0-9_-]{11}$/),
  meeting_url: z.union([
    z.literal(""),
    z
      .url()
      .refine(
        (v) => new URL(v).protocol === "https:",
        "Use an HTTPS meeting link",
      ),
  ]),
  published: z.boolean(),
  thumbnail_path: z
    .string()
    .regex(/^$|^[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/)
    .optional(),
  section_title: z.string().trim().max(160).default(""),
  quiz_settings: quizSettingsSchema.default({
    pass_mark: 70,
    max_attempts: 0,
    time_limit_minutes: 0,
  }),
  quiz: z.array(advancedQuestionSchema).max(100),
});
export const orderSchema = z.object({
  course_id: z.uuid(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(40),
  attendance: z.enum(["online", "in_person", "mixed"]),
  acknowledged: z.literal(true),
});
export function gradeQuiz(
  questions: z.infer<typeof questionSchema>[],
  answers: number[],
) {
  if (
    answers.length !== questions.length ||
    answers.some(
      (a, i) =>
        !Number.isInteger(a) || a < 0 || a >= questions[i].options.length,
    )
  )
    throw new Error("Answer every question");
  return Math.round(
    (100 * questions.filter((q, i) => q.answer === answers[i]).length) /
      questions.length,
  );
}
