import { z } from "zod";
export const consentVersion = "2026-09-27";
export const reportSchema = z.object({
  title: z.string().max(160),
  summary: z.string().max(6000),
  discussion: z
    .array(z.object({ heading: z.string(), details: z.string() }))
    .max(24),
  learning_gaps: z
    .array(z.object({ topic: z.string(), explanation: z.string() }))
    .max(16),
  research: z
    .array(
      z.object({
        heading: z.string(),
        details: z.string(),
        source_ids: z.array(z.number().int()),
      }),
    )
    .max(24),
  actions: z.array(z.string()).max(20),
  limitations: z.array(z.string()).max(12),
});
export type ReportContent = z.infer<typeof reportSchema>;
export type ResearchSource = {
  id: number;
  title: string;
  url: string;
  checked_at: string;
};
export type CoachReport = ReportContent & {
  sources: ResearchSource[];
  course_title: string;
  coach_title: string;
  student_name: string;
  session_date: string;
  created_at: string;
};
export function plainText(value: string) {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^]+/g, "")
    .trim();
}
