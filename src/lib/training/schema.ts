import { z } from "zod";
import { locations, attendance, directions } from "./config";
const option = <T extends Record<string, string>>(values: T) =>
  z.enum(Object.keys(values) as [keyof T & string, ...(keyof T & string)[]]);
const short = (max: number) => z.string().trim().max(max).default("");
export function normalizePhone(raw: string): string | null {
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  let p = raw.replace(/[\s().-]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (!p.startsWith("+")) p = "+678" + p;
  if (!/^\+[1-9]\d{6,14}$/.test(p)) return null;
  if (p.startsWith("+678") && !/^\+678(?:\d{5}|\d{7})$/.test(p)) return null;
  return p;
}
export const registrationSchema = z
  .object({
    request_id: z.uuid(),
    cohort_id: z.string().max(60),
    full_name: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(120, "Name must be 120 characters or fewer."),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine(
        (p) => !!normalizePhone(p),
        "Enter a valid phone number with its country code.",
      ),
    location_code: option(locations),
    location_other: short(100),
    area_optional: short(100),
    attendance_preference: option(attendance),
    business_direction: z
      .union([option(directions), z.literal("")])
      .default(""),
    question: short(500),
    acknowledged: z.literal(true, {
      error: "Please acknowledge the course fee and Privacy Notice.",
    }),
    future_training_opt_in: z.boolean().default(false),
    website: short(200),
  })
  .superRefine((v, ctx) => {
    if (["other", "outside"].includes(v.location_code) && !v.location_other)
      ctx.addIssue({
        code: "custom",
        path: ["location_other"],
        message: "Please specify your location.",
      });
  });
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type Registration = Omit<
  RegistrationInput,
  "phone" | "website" | "acknowledged" | "request_id"
> & {
  id: string;
  reference: string;
  phone_raw: string;
  phone_normalized: string;
  created_at: string;
  updated_at: string;
  cohort_snapshot: import("./config").Cohort;
  status: (typeof import("./config").statuses)[number];
  privacy_version: string;
  acknowledged_at: string;
  student_email_state: string;
  internal_email_state: string;
  email_attempts: number;
  email_last_attempt_at: string | null;
  private_notes: string;
  pwd_training_receipts?: { reference: string }[];
};
