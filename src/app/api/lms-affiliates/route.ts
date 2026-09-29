import { NextResponse, after } from "next/server";
import { z } from "zod";
import { randomInt } from "node:crypto";
import { authorize } from "@/lib/server/auth";
import { checked, student } from "@/lib/server/lms";
import { apiError, HttpError, readJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  AFFILIATE_SETTINGS,
  affiliateSettings,
  sendAffiliateEmail,
} from "@/lib/server/affiliates";
import {
  queueOwnerNotification,
  sendOwnerNotifications,
} from "@/lib/server/owner-notifications";
export const dynamic = "force-dynamic";
const json = (d: unknown) =>
  NextResponse.json(d, { headers: { "Cache-Control": "no-store" } });
// Buyers are shown to affiliates by first name and initial only.
const maskName = (name: string) => {
  const [first = "Student", last = ""] = name.trim().split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
};
const payout = {
  phone: z.string().trim().min(5).max(40),
  payout_method: z.enum(["bank", "mobile_money", "other"]),
  payout_details: z.string().trim().min(5).max(600),
};
const studentAction = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("apply"),
    full_name: z.string().trim().min(2).max(120),
    promotion_plan: z.string().trim().min(10).max(1500),
    agree: z.literal(true),
    ...payout,
  }),
  z.object({ action: z.literal("payout"), ...payout }),
]);
const adminAction = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("review"),
    id: z.uuid(),
    status: z.enum(["approved", "rejected", "suspended"]),
    commission_rate: z.number().min(0.5).max(100),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{4,20}$/, "Code must be 4–20 letters or numbers"),
    admin_note: z.string().trim().max(1000),
  }),
  z.object({ action: z.literal("settings"), auto_approve: z.boolean() }),
  z.object({
    action: z.literal("commissions"),
    ids: z.array(z.uuid()).min(1).max(200),
    status: z.enum(["approved", "paid", "void"]),
    payout_reference: z.string().trim().max(200).default(""),
    note: z.string().trim().max(500).default(""),
  }),
]);
// Commission status moves forward only; paid commissions are final.
const allowedFrom = {
  approved: ["pending"],
  paid: ["pending", "approved"],
  void: ["pending", "approved"],
} as const;
function newCode(name: string) {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "PWD";
  return `${letters.padEnd(3, "X")}${randomInt(1000, 10000)}`;
}
export async function GET(request: Request) {
  try {
    if (new URL(request.url).searchParams.get("scope") === "admin") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { db } = auth;
      const [a, c, o] = await Promise.all([
        db
          .from("pwd_lms_affiliates")
          .select("*,pwd_lms_affiliate_clicks(count)")
          .order("created_at", { ascending: false }),
        db
          .from("pwd_lms_affiliate_commissions")
          .select("*,pwd_lms_courses(title),pwd_lms_orders(name,email)")
          .order("created_at", { ascending: false })
          .limit(1000),
        db
          .from("pwd_lms_orders")
          .select("affiliate_id,status")
          .not("affiliate_id", "is", null)
          .limit(10000),
      ]);
      return json({
        settings: await affiliateSettings(db),
        affiliates: checked(a) || [],
        commissions: checked(c) || [],
        referrals: checked(o) || [],
      });
    }
    const { db, user } = await student(request);
    const [a, courses] = await Promise.all([
      db
        .from("pwd_lms_affiliates")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      db
        .from("pwd_lms_courses")
        .select("id,slug,title,amount,currency,enrollment_open,cohort_id")
        .eq("published", true)
        .order("created_at"),
    ]);
    const affiliate = checked(a);
    if (!affiliate)
      return json({ affiliate: null, courses: checked(courses) || [] });
    const [clicks, orders, commissions] = await Promise.all([
      db
        .from("pwd_lms_affiliate_clicks")
        .select("id", { count: "exact", head: true })
        .eq("affiliate_id", affiliate.id),
      db
        .from("pwd_lms_orders")
        .select("id,name,course_id,status,referred_at")
        .eq("affiliate_id", affiliate.id)
        .order("referred_at", { ascending: false })
        .limit(500),
      db
        .from("pwd_lms_affiliate_commissions")
        .select(
          "id,order_id,course_id,currency,order_amount,rate,amount,status,paid_at,payout_reference,created_at",
        )
        .eq("affiliate_id", affiliate.id)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    if (clicks.error) throw clicks.error;
    const { reviewed_by: _r, admin_note: _n, ...own } = affiliate;
    return json({
      affiliate: own,
      courses: checked(courses) || [],
      clicks: clicks.count || 0,
      referrals: (checked(orders) || []).map(
        (o: { name: string; [k: string]: unknown }) => ({
          ...o,
          name: maskName(o.name),
        }),
      ),
      commissions: checked(commissions) || [],
    });
  } catch (e) {
    return apiError(e, "lms-affiliates/get");
  }
}
export async function POST(request: Request) {
  try {
    if (new URL(request.url).searchParams.get("scope") === "admin") {
      const auth = await authorize(request);
      if (auth.response) return auth.response;
      const { db, user } = auth;
      const input = await readJson(request, adminAction);
      if (input.action === "review") {
        const current = checked(
          await db
            .from("pwd_lms_affiliates")
            .select("status")
            .eq("id", input.id)
            .single(),
        );
        const { error } = await db
          .from("pwd_lms_affiliates")
          .update({
            status: input.status,
            commission_rate: input.commission_rate,
            code: input.code,
            admin_note: input.admin_note,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.id);
        if (error?.code === "23505")
          throw new HttpError(409, "Another affiliate already uses that code.");
        if (error) throw error;
        checked(
          await db.from("pwd_lms_audit").insert({
            actor_id: user.id,
            action: `affiliate_${input.status}`,
            target_id: input.id,
          }),
        );
        if (current!.status !== input.status)
          after(() => sendAffiliateEmail(input.id, input.status));
        return json({ success: true });
      }
      if (input.action === "settings") {
        checked(
          await db.from("pwd_lms_settings").upsert({
            id: AFFILIATE_SETTINGS,
            value: { auto_approve: input.auto_approve },
          }),
        );
        return json({ success: true });
      }
      const updated = checked(
        await db
          .from("pwd_lms_affiliate_commissions")
          .update({
            status: input.status,
            updated_at: new Date().toISOString(),
            ...(input.note ? { note: input.note } : {}),
            ...(input.status === "paid"
              ? {
                  paid_at: new Date().toISOString(),
                  paid_by: user.id,
                  payout_reference: input.payout_reference,
                }
              : {}),
          })
          .in("id", input.ids)
          .in("status", [...allowedFrom[input.status]])
          .select("id"),
      );
      return json({ success: true, updated: updated?.length || 0 });
    }
    const { db, user } = await student(request);
    await rateLimit(request, `lms-affiliate-${user.id}`, 10);
    const input = await readJson(request, studentAction);
    const existing = checked(
      await db
        .from("pwd_lms_affiliates")
        .select("id,status")
        .eq("user_id", user.id)
        .maybeSingle(),
    );
    const details = {
      phone: input.phone,
      payout_method: input.payout_method,
      payout_details: input.payout_details,
      updated_at: new Date().toISOString(),
    };
    if (input.action === "payout") {
      if (!existing) throw new HttpError(404, "Apply to become an affiliate first.");
      checked(
        await db.from("pwd_lms_affiliates").update(details).eq("id", existing.id),
      );
      return json({ success: true });
    }
    if (existing && existing.status !== "rejected")
      throw new HttpError(409, "You have already applied.");
    // New applicants are approved instantly when auto-approval is on;
    // someone an admin previously rejected always goes back to manual review.
    const approve = !existing && (await affiliateSettings(db)).auto_approve;
    const application = {
      ...details,
      full_name: input.full_name,
      promotion_plan: input.promotion_plan,
      email: user.email!,
      status: approve ? "approved" : "pending",
      ...(approve ? { reviewed_at: new Date().toISOString() } : {}),
    };
    let affiliateId = existing?.id as string | undefined;
    if (existing) {
      checked(
        await db
          .from("pwd_lms_affiliates")
          .update(application)
          .eq("id", existing.id),
      );
    } else {
      // Retry on the rare code collision.
      for (let attempt = 0; ; attempt++) {
        const { data, error } = await db
          .from("pwd_lms_affiliates")
          .insert({
            ...application,
            user_id: user.id,
            code: newCode(input.full_name),
          })
          .select("id")
          .single();
        if (!error) {
          affiliateId = data.id;
          break;
        }
        if (error.code !== "23505" || attempt === 4) throw error;
      }
    }
    await queueOwnerNotification(
      `affiliate-application-${user.id}-${Date.now()}`,
      approve ? "New course affiliate joined (auto-approved)" : "New course affiliate application",
      `Name: ${input.full_name}\nEmail: ${user.email}\nPhone: ${input.phone}\nPromotion plan: ${input.promotion_plan}\n\n${approve ? "Their links are active. Manage or suspend them" : "Review it"} in Admin → Training centre → Affiliates.`,
    );
    after(async () => {
      if (approve && affiliateId) await sendAffiliateEmail(affiliateId, "approved");
      await sendOwnerNotifications();
    });
    return json({ success: true, status: application.status });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    return apiError(e, "lms-affiliates/post");
  }
}
