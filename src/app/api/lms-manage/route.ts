import { NextResponse, after } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/server/auth";
import { checked } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { sendLmsEmails } from "@/lib/server/lms-email";
import { assess, advancedQuestionSchema } from "@/lib/lms/assessment";
export const dynamic = "force-dynamic";
const json = (d: unknown) =>
  NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
const coupon = z
  .object({
    id: z.uuid().optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9][A-Z0-9_-]{2,39}$/),
    course_id: z.uuid(),
    kind: z.enum(["percent", "fixed", "free"]),
    value: z.number().int().min(1).max(100000000),
    active: z.boolean(),
    starts_at: z.iso.datetime({ offset: true }).nullable(),
    ends_at: z.iso.datetime({ offset: true }).nullable(),
    max_uses: z.number().int().min(1).max(100000),
    per_student: z.number().int().min(1).max(100),
    email: z.email().toLowerCase().nullable(),
  })
  .refine(
    (v) => v.kind !== "percent" || v.value <= 100,
    "Percentage must be 1–100",
  )
  .refine(
    (v) => !v.starts_at || !v.ends_at || v.ends_at > v.starts_at,
    "End date must be after start date",
  );
export async function GET(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db } = auth;
    const [c, g, a] = await Promise.all([
      db
        .from("pwd_lms_coupons")
        .select("*,pwd_lms_coupon_uses(count)")
        .order("created_at", { ascending: false }),
      db
        .from("pwd_lms_orders")
        .select("id,email,name,course_id,status,package_label,created_at")
        .eq("method", "grant")
        .order("created_at", { ascending: false })
        .limit(500),
      db
        .from("pwd_lms_quiz_attempts")
        .select("*,pwd_lms_lessons(title)")
        .eq("state", "review")
        .order("submitted_at")
        .limit(100),
    ]);
    const pending = checked(a) || [];
    const studentIds = Array.from(new Set(pending.map((row) => row.user_id)));
    const contacts = studentIds.length
      ? checked(
          await db
            .from("pwd_lms_orders")
            .select("user_id,email,name")
            .in("user_id", studentIds),
        )
      : [];
    return json({
      coupons: checked(c),
      grants: checked(g),
      attempts: pending.map((row) => ({
        ...row,
        student_email:
          contacts?.find((contact) => contact.user_id === row.user_id)?.email ||
          "",
        student_name:
          contacts?.find((contact) => contact.user_id === row.user_id)?.name ||
          "",
      })),
    });
  } catch (e) {
    return apiError(e, "lms-manage/get");
  }
}
export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if (auth.response) return auth.response;
    const { db, user } = auth;
    const input = await readJson(
      request,
      z.discriminatedUnion("action", [
        z.object({ action: z.literal("coupon"), value: coupon }),
        z.object({
          action: z.literal("grant"),
          email: z.email().toLowerCase(),
          course_ids: z.array(z.uuid()).min(1).max(30),
          label: z.string().trim().min(3).max(300),
        }),
        z.object({ action: z.literal("revoke"), id: z.uuid() }),
        z.object({
          action: z.literal("grade"),
          id: z.uuid(),
          marks: z.array(z.number().min(0).max(100)).max(100),
          feedback: z.string().trim().min(1).max(4000),
        }),
      ]),
    );
    if (input.action === "coupon") {
      const course = checked(
        await db
          .from("pwd_lms_courses")
          .select("currency")
          .eq("id", input.value.course_id)
          .single(),
      );
      checked(
        await db
          .from("pwd_lms_coupons")
          .upsert({ ...input.value, currency: course!.currency }),
      );
    }
    if (input.action === "grant") {
      const result = await db.rpc("pwd_lms_grant", {
        p_email: input.email,
        p_courses: Array.from(new Set(input.course_ids)),
        p_label: input.label,
        p_actor: user.id,
      });
      if (result.error) throw new HttpError(400, result.error.message);
      after(sendLmsEmails);
    }
    if (input.action === "revoke") {
      const changed = checked(
        await db
          .from("pwd_lms_orders")
          .update({ status: "revoked", reviewed_by: user.id })
          .eq("id", input.id)
          .eq("method", "grant")
          .eq("status", "granted")
          .select("id"),
      );
      if (!changed?.length)
        throw new HttpError(
          409,
          "Only active manual grants can be revoked here.",
        );
      after(sendLmsEmails);
    }
    if (input.action === "grade") {
      const a = checked(
        await db
          .from("pwd_lms_quiz_attempts")
          .select("*")
          .eq("id", input.id)
          .eq("state", "review")
          .single(),
      );
      const qs = z.array(advancedQuestionSchema).parse(a.questions),
        result = assess(qs, a.answers);
      const essays = qs.filter((q) => q.type === "essay");
      if (
        input.marks.length !== essays.length ||
        input.marks.some((m, i) => m > essays[i].points)
      )
        throw new HttpError(
          400,
          "Marks must fit each question’s available points.",
        );
      const earned = result.earned + input.marks.reduce((s, n) => s + n, 0),
        score = Math.round((100 * earned) / result.total),
        passed = score >= a.settings.pass_mark;
      const saved = checked(
        await db.rpc("pwd_lms_finish_quiz", {
          p_id: a.id,
          p_expected: "review",
          p_state: passed ? "passed" : "failed",
          p_answers: a.answers,
          p_score: score,
          p_earned: earned,
          p_total: result.total,
          p_feedback: input.feedback,
          p_actor: user.id,
        }),
      );
      if (!saved) throw new HttpError(409, "This attempt was already graded.");
    }
    checked(
      await db.from("pwd_lms_audit").insert({
        actor_id: user.id,
        action: input.action,
        target_id:
          "id" in input
            ? input.id
            : input.action === "coupon"
              ? input.value.id || null
              : null,
      }),
    );
    return json({ success: true });
  } catch (e) {
    return apiError(e, "lms-manage/post");
  }
}
