import { accountSchema } from "@/lib/lms/signup";
import { createTrainingAccount } from "@/lib/server/lms-signup";
import { reportServerError } from "@/lib/server/report-error";
import { withLessonThumbnails } from "@/lib/server/lesson-thumbnails";
import {
  queueOwnerNotification,
  sendOwnerNotifications,
} from "@/lib/server/owner-notifications";
import {
  sendAccountEmail,
  accountEmailBucket,
} from "@/lib/server/lms-account-email";
import { sendLmsEmails } from "@/lib/server/lms-email";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/server/clients";
import { authorize } from "@/lib/server/auth";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  checked,
  student,
  ownedOrder,
  stripeClient,
  fulfill,
} from "@/lib/server/lms";
import {
  bankSchema,
  courseSchema,
  lessonSchema,
  orderSchema,
} from "@/lib/lms/schema";
import { csvCell } from "@/lib/training/csv";
import type { Bank, Lesson } from "@/lib/lms/types";
export const dynamic = "force-dynamic";
const json = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
type Context = { params: Promise<{ action: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { action } = await context.params;
    const db = getSupabaseAdmin();
    if (action === "catalog") {
      const courses = checked(
        await db
          .from("pwd_lms_courses")
          .select("*")
          .eq("published", true)
          .order("created_at"),
      );
      const banks = checked(
        await db
          .from("pwd_lms_settings")
          .select("value")
          .eq("id", "banks")
          .single(),
      );
      return json({
        courses,
        sandbox: !(
          process.env.TRAINING_EMAIL_MODE === "live" &&
          process.env.VERCEL_ENV === "production"
        ),
        banks: banks!.value,
        stripe: Boolean(
          process.env.STRIPE_SECRET_KEY &&
          process.env.STRIPE_WEBHOOK_SECRET &&
          ((process.env.VERCEL_ENV === "production" &&
            process.env.TRAINING_PAYMENTS_MODE === "live") ||
            process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")),
        ),
      });
    }
    if (action === "recording") {
      const { user } = await student(request);
      const id = z.uuid().parse(new URL(request.url).searchParams.get("id"));
      const lesson = checked(
        await db
          .from("pwd_lms_lessons")
          .select("*")
          .eq("id", id)
          .eq("published", true)
          .maybeSingle(),
      );
      if (!lesson?.order_id || !lesson.recording_path)
        throw new HttpError(404, "Recording unavailable.");
      const order = checked(
        await db
          .from("pwd_lms_orders")
          .select("id")
          .eq("id", lesson.order_id)
          .eq("course_id", lesson.course_id)
          .eq("user_id", user.id)
          .in("status", ["paid", "granted"])
          .maybeSingle(),
      );
      if (!order)
        throw new HttpError(
          403,
          "This recording is private to its enrolled student.",
        );
      const signed = checked(
        await db.storage
          .from("pwd-mentorship-recordings")
          .createSignedUrl(lesson.recording_path, 14400),
      );
      return json({ url: signed!.signedUrl });
    }
    if (action === "dashboard") {
      const { user } = await student(request);
      const [orderRows, progressRows] = await Promise.all([
        db
          .from("pwd_lms_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        db.from("pwd_lms_progress").select("*").eq("user_id", user.id),
      ]);
      const orders = checked(orderRows),
        progress = checked(progressRows);
      after(sendLmsEmails);
      return json({ orders, progress });
    }
    if (action === "course") {
      const { user } = await student(request);
      const id = z.uuid().parse(new URL(request.url).searchParams.get("id"));
      const order = checked(
        await db
          .from("pwd_lms_orders")
          .select("*")
          .eq("course_id", id)
          .eq("user_id", user.id)
          .maybeSingle(),
      );
      if (!order) throw new HttpError(403, "Register for this course first.");
      const course = checked(
        await db.from("pwd_lms_courses").select("*").eq("id", id).single(),
      );
      const rows = checked(
        await db
          .from("pwd_lms_lessons")
          .select("*")
          .eq("course_id", id)
          .or(
            course.private_sessions
              ? `order_id.eq.${order.id}`
              : `order_id.is.null,order_id.eq.${order.id}`,
          )
          .order("position"),
      ) as Lesson[];
      const lessons = rows.map((l) => ({
        ...l,
        recording_path: "",
        has_recording:
          ["paid", "granted"].includes(order.status) &&
          l.published &&
          Boolean(l.recording_path),
        content:
          ["paid", "granted"].includes(order.status) && l.published
            ? l.content
            : "",
        youtube_id:
          ["paid", "granted"].includes(order.status) && l.published
            ? l.youtube_id
            : "",
        meeting_url:
          ["paid", "granted"].includes(order.status) && l.published
            ? l.meeting_url
            : "",
        quiz:
          ["paid", "granted"].includes(order.status) && l.published
            ? l.quiz.map(() => ({
                question: "Start the quiz to view this question",
                options: [],
              }))
            : [],
      }));
      return json({
        course,
        lessons: await withLessonThumbnails(lessons),
        order,
      });
    }
    if (action === "email_logs") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const logs = checked(
        await db
          .from("pwd_lms_account_emails")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      );
      return json({ logs });
    }
    if (action === "students_export") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const params = new URL(request.url).searchParams;
      const course = params.get("course")
        ? z.uuid().parse(params.get("course"))
        : null;
      const status = params.get("status")
        ? z
            .enum([
              "paid",
              "pending",
              "review",
              "rejected",
              "refunded",
              "granted",
              "revoked",
            ])
            .parse(params.get("status"))
        : null;
      const titles = new Map(
        (
          checked(await db.from("pwd_lms_courses").select("id,title")) || []
        ).map((c) => [c.id, c.title]),
      );
      const rows: string[] = [
        [
          "full_name",
          "email",
          "phone",
          "course",
          "course_id",
          "payment_status",
          "amount_minor_units",
          "currency",
          "payment_method",
          "bank",
          "attendance",
          "registration_date",
          "order_reference",
        ].join(","),
      ];
      // Fetch all matching registrations; the admin screen's 500-row limit does not apply.
      for (let offset = 0; ; offset += 500) {
        let query = db
          .from("pwd_lms_orders")
          .select(
            "id,name,email,phone,course_id,status,amount,currency,method,bank,attendance,created_at",
          )
          .order("created_at")
          .order("id")
          .range(offset, offset + 499);
        if (course) query = query.eq("course_id", course);
        if (status) query = query.eq("status", status);
        const batch = checked(await query) || [];
        for (const o of batch)
          rows.push(
            [
              o.name,
              o.email,
              o.phone,
              titles.get(o.course_id) || "",
              o.course_id,
              o.status,
              o.amount,
              o.currency,
              o.method,
              o.bank,
              o.attendance,
              o.created_at,
              o.id,
            ]
              .map(csvCell)
              .join(","),
          );
        if (batch.length < 500) break;
      }
      return new Response("\uFEFF" + rows.join("\r\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="training-course-registrations.csv"',
          "Cache-Control": "no-store",
        },
      });
    }
    if (action === "admin") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const [courses, lessons, orders, banks] = await Promise.all([
        db.from("pwd_lms_courses").select("*").order("created_at"),
        db.from("pwd_lms_lessons").select("*").order("position"),
        db
          .from("pwd_lms_orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        db.from("pwd_lms_settings").select("value").eq("id", "banks").single(),
      ]);
      return json({
        courses: checked(courses),
        lessons: await withLessonThumbnails(checked(lessons) || []),
        orders: checked(orders),
        banks: checked(banks)!.value,
      });
    }
    throw new HttpError(404, "Not found");
  } catch (e) {
    if (e instanceof z.ZodError) return jsonError("Invalid request");
    return apiError(e, "lms/get");
  }
}
export async function POST(request: Request, context: Context) {
  let locked: string | null = null;
  async function lock(id: string) {
    const db = getSupabaseAdmin();
    if (!checked(await db.rpc("pwd_lms_lock_order", { order_id: id })))
      throw new HttpError(
        409,
        "Another payment action is in progress. Please wait and refresh.",
      );
    locked = id;
  }
  try {
    const { action } = await context.params;
    if (action === "account") {
      await rateLimit(request, "lms-account", 5);
      const input = await readJson(request, accountSchema);
      await rateLimit(request, accountEmailBucket(input.email), 4);
      if (input.mode === "signup") {
        const registration = await createTrainingAccount(input);
        after(async () => {
          try {
            await sendAccountEmail({ email: input.email, mode: "welcome", course: input.course });
            await sendLmsEmails();
          } catch (error) { await reportServerError("lms/signup-welcome", error); }
        });
        return json({ success: true, ...registration });
      }
      await sendAccountEmail({
        ...input,
        email: input.email.trim().toLowerCase(),
      });
      return json({ success: true });
    }
    if (action === "order") {
      const { db, user } = await student(request);
      await rateLimit(request, `lms-order-${user.id}`, 20);
      const input = await readJson(request, orderSchema);
      const course = checked(
        await db
          .from("pwd_lms_courses")
          .select("*")
          .eq("id", input.course_id)
          .eq("published", true)
          .single(),
      );
      if (!course.enrollment_open)
        throw new HttpError(409, "Enrolment for this course is closed.");
      if (course.cohort_id) {
        const cohort = checked(
          await db
            .from("pwd_training_cohorts")
            .select("config")
            .eq("id", course.cohort_id)
            .single(),
        );
        if (
          cohort!.config.registrationState !== "open" ||
          Date.now() > Date.parse(cohort!.config.teachingEnd)
        )
          throw new HttpError(409, "Enrolment for this cohort is closed.");
      }
      checked(
        await db.from("pwd_lms_orders").upsert(
          {
            user_id: user.id,
            course_id: course.id,
            email: user.email,
            name: input.name,
            phone: input.phone,
            attendance: input.attendance,
            amount: course.amount,
            currency: course.currency,
          },
          { onConflict: "user_id,course_id", ignoreDuplicates: true },
        ),
      );
      const order = checked(
        await db
          .from("pwd_lms_orders")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .single(),
      );
      after(sendLmsEmails);
      return json({ order });
    }
    if (action === "coupon") {
      const input = await readJson(
        request,
        z.object({
          id: z.uuid(),
          code: z
            .string()
            .trim()
            .toUpperCase()
            .regex(/^[A-Z0-9][A-Z0-9_-]{2,39}$/),
        }),
      );
      const { db, user } = await ownedOrder(request, input.id);
      await rateLimit(request, `lms-coupon-${user.id}`, 15);
      await lock(input.id);
      const order = checked(
        await db.from("pwd_lms_orders").select("*").eq("id", input.id).single(),
      );
      if (!["pending", "rejected"].includes(order.status))
        throw new HttpError(
          409,
          "Discounts apply before payment or bank review.",
        );
      if (order.stripe_session) {
        const stripe = stripeClient(),
          session = await stripe.checkout.sessions.retrieve(
            order.stripe_session,
          );
        if (session.status === "complete") {
          await fulfill(session);
          throw new HttpError(
            409,
            "Payment already completed. Refresh your dashboard.",
          );
        }
        if (session.status === "open")
          await stripe.checkout.sessions.expire(session.id);
      }
      const result = await db.rpc("pwd_lms_apply_coupon", {
        p_order: order.id,
        p_user: user.id,
        p_code: input.code,
      });
      if (result.error) throw new HttpError(400, result.error.message);
      after(sendLmsEmails);
      return json({ order: result.data });
    }
    if (action === "checkout") {
      const input = await readJson(request, z.object({ id: z.uuid() }));
      const {
        db,
        user,
        order: initialOrder,
      } = await ownedOrder(request, input.id);
      await lock(initialOrder.id);
      const order = checked(
        await db
          .from("pwd_lms_orders")
          .select("*")
          .eq("id", initialOrder.id)
          .single(),
      );
      await rateLimit(request, `lms-checkout-${user.id}`, 20);
      if (!["pending", "rejected"].includes(order.status))
        throw new HttpError(
          409,
          "This order is already paid or awaiting bank review.",
        );
      if (!process.env.STRIPE_WEBHOOK_SECRET)
        throw new HttpError(503, "Card payments are not available yet.");
      const stripe = stripeClient();
      if (order.stripe_session) {
        const session = await stripe.checkout.sessions.retrieve(
          order.stripe_session,
        );
        if (session.status === "complete") {
          await fulfill(session);
          return json({ url: "/training-center/dashboard" });
        }
        if (session.status === "open") return json({ url: session.url });
      }
      const origin =
        process.env.VERCEL_ENV === "production"
          ? "https://pacificwavedigital.com"
          : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3100";
      const purchasedCourse = checked(
        await db
          .from("pwd_lms_courses")
          .select("title")
          .eq("id", order.course_id)
          .single(),
      );
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: user.email,
          metadata: {
            application: "pwd_training_center",
            pwd_order_id: order.id,
          },
          payment_intent_data: {
            metadata: {
              application: "pwd_training_center",
              pwd_order_id: order.id,
            },
          },
          custom_text: {
            submit: {
              message:
                "Card payments are processed by Global Digital Prime, Inc. for Pacific Wave Digital training.",
            },
          },
          line_items: [
            {
              price_data: {
                currency: order.currency.toLowerCase(),
                unit_amount: order.amount,
                product_data: { name: purchasedCourse!.title },
              },
              quantity: 1,
            },
          ],
          success_url: `${origin}/training-center/dashboard?payment=processing`,
          cancel_url: `${origin}/training-center/checkout?course=${order.course_id}`,
        },
        {
          idempotencyKey: `pwd-lms-${order.id}-${order.stripe_session || "initial"}`,
        },
      );
      checked(
        await db
          .from("pwd_lms_orders")
          .update({ stripe_session: session.id, method: "stripe" })
          .eq("id", order.id)
          .in("status", ["pending", "rejected"]),
      );
      return json({ url: session.url });
    }
    if (action === "proof") {
      const url = new URL(request.url);
      const id = z.uuid().parse(url.searchParams.get("id"));
      const bank = z.enum(["ANZ", "BRED"]).parse(url.searchParams.get("bank"));
      const { db, user, order: initialOrder } = await ownedOrder(request, id);
      await lock(initialOrder.id);
      const order = checked(
        await db
          .from("pwd_lms_orders")
          .select("*")
          .eq("id", initialOrder.id)
          .single(),
      );
      await rateLimit(request, `lms-proof-${user.id}`, 12);
      if (!["pending", "rejected"].includes(order.status))
        throw new HttpError(409, "Payment is already submitted.");
      const banks = checked(
        await db
          .from("pwd_lms_settings")
          .select("value")
          .eq("id", "banks")
          .single(),
      )!.value as Bank[];
      if (!banks.some((b) => b.bank === bank && b.currency === order.currency))
        throw new HttpError(400, "This bank is unavailable for this currency.");
      if (order.stripe_session) {
        const session = await stripeClient().checkout.sessions.retrieve(
          order.stripe_session,
        );
        if (session.status === "complete") {
          await fulfill(session);
          throw new HttpError(409, "Card payment has already completed.");
        }
        if (session.status === "open")
          await stripeClient().checkout.sessions.expire(session.id);
      }
      const reader = request.body?.getReader();
      if (!reader) throw new HttpError(400, "Select your payment proof.");
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 3145728) {
          await reader.cancel();
          throw new HttpError(413, "Proof must be 3 MB or smaller.");
        }
        chunks.push(value);
      }
      const bytes = Buffer.concat(chunks);
      const pdf = bytes.subarray(0, 5).toString() === "%PDF-";
      const png = bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      if (!pdf && !png && !jpg)
        throw new HttpError(400, "Upload a PDF, PNG or JPEG.");
      const ext = pdf ? "pdf" : png ? "png" : "jpg";
      const path = `${user.id}/${order.id}/${randomUUID()}.${ext}`;
      checked(
        await db.storage.from("pwd-training-proofs").upload(path, bytes, {
          contentType: pdf
            ? "application/pdf"
            : png
              ? "image/png"
              : "image/jpeg",
        }),
      );
      const updated = await db
        .from("pwd_lms_orders")
        .update({
          proof_path: path,
          bank,
          status: "review",
          method: "bank",
          review_note: "",
        })
        .eq("id", order.id)
        .in("status", ["pending", "rejected"])
        .select("id");
      if (updated.error || !updated.data?.length) {
        await db.storage.from("pwd-training-proofs").remove([path]);
        if (updated.error) throw updated.error;
        throw new HttpError(
          409,
          "Payment status changed. Refresh your dashboard.",
        );
      }
      after(sendLmsEmails);
      return json({ success: true });
    }
    if (action === "progress") {
      const { db, user } = await student(request);
      const input = await readJson(
        request,
        z.object({
          lesson_id: z.uuid(),
          answers: z.array(z.number().int()).max(30),
        }),
      );
      const lesson = checked(
        await db
          .from("pwd_lms_lessons")
          .select("*")
          .eq("id", input.lesson_id)
          .eq("published", true)
          .single(),
      );
      const order = checked(
        await db
          .from("pwd_lms_orders")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", lesson.course_id)
          .in("status", ["paid", "granted"])
          .maybeSingle(),
      );
      if (!order || (lesson.order_id && lesson.order_id !== order.id))
        throw new HttpError(403, "Paid course access required.");
      if (lesson.quiz.length)
        throw new HttpError(
          400,
          "Use the quiz attempt form to complete this lesson.",
        );
      const score = null;
      checked(
        await db
          .from("pwd_lms_progress")
          .upsert(
            { user_id: user.id, lesson_id: lesson.id, score },
            { onConflict: "user_id,lesson_id" },
          ),
      );
      await queueOwnerNotification(
        `lesson-${randomUUID()}`,
        "Student lesson or quiz submission",
        `Student: ${user.email}\nLesson: ${lesson.title}\nResult: ${score === null ? "Lesson completed" : `${score}%`}`,
      );
      after(sendOwnerNotifications);
      return json({ passed: true, score });
    }
    if (action === "admin") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { db, user } = auth;
      const input = await readJson(
        request,
        z.discriminatedUnion("action", [
          z.object({ action: z.literal("retry_emails") }),
          z.object({ action: z.literal("email_status"), id: z.uuid() }),
          z.object({
            action: z.literal("recording_upload"),
            order_id: z.uuid(),
            extension: z.enum(["mp4", "webm"]),
          }),
          z.object({ action: z.literal("course"), value: courseSchema }),
          z.object({ action: z.literal("lesson"), value: lessonSchema }),
          z.object({
            action: z.literal("banks"),
            value: z.array(bankSchema).max(2),
          }),
          z.object({
            action: z.literal("review"),
            id: z.uuid(),
            status: z.enum(["paid", "rejected"]),
            note: z.string().trim().max(1000),
          }),
          z.object({ action: z.literal("proof"), id: z.uuid() }),
        ]),
      );
      if (input.action === "email_status") {
        const log = checked(
          await db
            .from("pwd_lms_account_emails")
            .select("provider_id")
            .eq("id", input.id)
            .single(),
        );
        if (!log?.provider_id)
          throw new HttpError(
            400,
            "This email has no provider receipt. Ask the student to resend their access email.",
          );
        const r = await fetch(
          `https://api.resend.com/emails/${encodeURIComponent(log.provider_id)}`,
          {
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
            signal: AbortSignal.timeout(10000),
          },
        );
        if (!r.ok)
          throw new HttpError(
            503,
            "Provider status is unavailable. Try again shortly.",
          );
        const d = await r.json();
        checked(
          await db
            .from("pwd_lms_account_emails")
            .update({ state: String(d.last_event || "accepted").slice(0, 50) })
            .eq("id", input.id),
        );
        return json({ success: true });
      }
      if (input.action === "recording_upload") {
        const order = checked(
          await db
            .from("pwd_lms_orders")
            .select("id")
            .eq("id", input.order_id)
            .maybeSingle(),
        );
        if (!order) throw new HttpError(404, "Enrolment not found.");
        const path = `${order.id}/${randomUUID()}.${input.extension}`;
        const upload = checked(
          await db.storage
            .from("pwd-mentorship-recordings")
            .createSignedUploadUrl(path),
        );
        return json({ path, token: upload!.token });
      }
      if (input.action === "proof") {
        const order = checked(
          await db
            .from("pwd_lms_orders")
            .select("proof_path")
            .eq("id", input.id)
            .single(),
        );
        if (!order?.proof_path) throw new HttpError(404, "No proof uploaded.");
        return json(
          checked(
            await db.storage
              .from("pwd-training-proofs")
              .createSignedUrl(order.proof_path, 60, { download: true }),
          ),
        );
      }
      if (input.action === "course")
        checked(await db.from("pwd_lms_courses").upsert(input.value));
      if (input.action === "lesson") {
        if (
          input.value.thumbnail_path &&
          !input.value.thumbnail_path.startsWith(`${input.value.course_id}/`)
        )
          throw new HttpError(
            400,
            "Choose a thumbnail uploaded for this course.",
          );
        const course = checked(
          await db
            .from("pwd_lms_courses")
            .select("private_sessions")
            .eq("id", input.value.course_id)
            .single(),
        );
        if (
          course!.private_sessions &&
          (!input.value.order_id || input.value.youtube_id)
        )
          throw new HttpError(
            400,
            "Choose a student enrolment and use a private recording for mentorship.",
          );
        checked(await db.from("pwd_lms_lessons").upsert(input.value));
      }
      if (input.action === "banks") {
        if (new Set(input.value.map((b) => b.bank)).size !== input.value.length)
          throw new HttpError(400, "Use one entry per bank.");
        checked(
          await db
            .from("pwd_lms_settings")
            .upsert({ id: "banks", value: input.value }),
        );
      }
      if (input.action === "review") {
        const result = checked(
          await db
            .from("pwd_lms_orders")
            .update({
              status: input.status,
              review_note: input.note,
              reviewed_by: user.id,
            })
            .eq("id", input.id)
            .eq("status", "review")
            .eq("method", "bank")
            .select("id"),
        );
        if (!result?.length)
          throw new HttpError(
            409,
            "This bank payment is no longer awaiting review.",
          );
      }
      checked(
        await db.from("pwd_lms_audit").insert({
          actor_id: user.id,
          action: input.action,
          target_id: "id" in input ? input.id : null,
        }),
      );
      after(sendLmsEmails);
      return json({ success: true });
    }
    throw new HttpError(404, "Not found");
  } catch (e) {
    if (e instanceof z.ZodError)
      return jsonError(e.issues[0]?.message || "Invalid request");
    return apiError(e, "lms/post");
  } finally {
    if (locked)
      await getSupabaseAdmin()
        .from("pwd_lms_orders")
        .update({ checkout_lock_until: null })
        .eq("id", locked);
  }
}
function jsonError(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
