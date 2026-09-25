import type { AssessmentQuestion, QuizSettings } from "./assessment";
export type Question = Partial<AssessmentQuestion> & {
  question: string;
  options: string[];
  answer_spec?: string;
};
export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  kind: "live" | "recorded";
  amount: number;
  currency: string;
  published: boolean;
  enrollment_open: boolean;
  private_sessions?: boolean;
  cohort_id: string | null;
  coaching_ends_on?: string | null;
};
export type Lesson = {
  order_id?: string | null;
  recording_path?: string;
  has_recording?: boolean;
  thumbnail_path?: string;
  thumbnail_url?: string;

  id: string;
  course_id: string;
  title: string;
  position: number;
  starts_at: string | null;
  content: string;
  youtube_id: string;
  meeting_url: string;
  published: boolean;
  quiz: Question[];
  section_title?: string;
  quiz_settings?: QuizSettings;
};
export type Order = {
  id: string;
  user_id: string;
  course_id: string;
  email: string;
  name: string;
  phone: string;
  attendance: string;
  amount: number;
  currency: string;
  status: string;
  method: string | null;
  bank: string | null;
  proof_path: string | null;
  review_note: string;
  coupon_code?: string;
  discount_amount?: number;
  original_amount?: number;
  package_label?: string;
  created_at: string;
};
export type Bank = {
  bank: "ANZ" | "BRED";
  account_name: string;
  account_number: string;
  branch: string;
  swift_code?: string;
  bank_address?: string;
  currency: "VUV" | "USD" | "AUD";
};
export type Progress = {
  lesson_id: string;
  completed_at: string;
  score: number | null;
};
export function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VUV" ? 0 : 2,
  }).format(amount / (currency === "VUV" ? 1 : 100));
}
