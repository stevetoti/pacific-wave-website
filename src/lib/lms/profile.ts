import { z } from "zod";
export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name.").max(120),
  phone: z.string().trim().max(40),
  city: z.string().trim().max(100),
  country: z.string().trim().max(100),
  occupation: z.string().trim().max(120),
  organization: z.string().trim().max(160),
  bio: z.string().trim().max(1000),
  learning_goals: z.string().trim().max(2000),
  website: z.union([
    z.literal(""),
    z
      .url()
      .max(500)
      .refine(
        (v) => new URL(v).protocol === "https:",
        "Use an HTTPS website address.",
      ),
  ]),
  timezone: z
    .string()
    .max(80)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Choose a valid time zone."),
});
export type StudentProfile = z.infer<typeof profileSchema> & {
  avatar_url?: string;
  avatar_path?: string;
  created_at?: string;
  updated_at?: string;
};
export type LessonSummary = {
  id: string;
  course_id: string;
  title: string;
  starts_at: string | null;
  published: boolean;
  has_quiz: boolean;
};
export const emptyProfile: StudentProfile = {
  full_name: "",
  phone: "",
  city: "",
  country: "",
  occupation: "",
  organization: "",
  bio: "",
  learning_goals: "",
  website: "",
  timezone: "Pacific/Efate",
};
export function profileCompletion(profile: StudentProfile) {
  const values = [
    profile.full_name,
    profile.phone,
    profile.city,
    profile.country,
    profile.occupation,
    profile.bio,
    profile.learning_goals,
    profile.avatar_url,
  ];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}
