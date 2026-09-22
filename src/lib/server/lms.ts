import "server-only";
import Stripe from "stripe";
import { getSupabaseAdmin } from "./clients";
import { HttpError } from "./http";
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpError(503, "Card payments are not available yet.");
  if (
    !(
      process.env.VERCEL_ENV === "production" &&
      process.env.TRAINING_PAYMENTS_MODE === "live"
    ) &&
    !key.startsWith("sk_test_")
  )
    throw new HttpError(503, "Preview requires a Stripe test key.");
  return new Stripe(key, { timeout: 15000, maxNetworkRetries: 1 });
}
export async function student(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) throw new HttpError(401, "Please sign in to continue.");
  const db = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await db.auth.getUser(token);
  if (error || !user?.email || !user.email_confirmed_at)
    throw new HttpError(401, "Please verify your email and sign in.");
  return { db, user };
}
export function checked<T>({ data, error }: { data: T; error: unknown }): T {
  if (error) throw error;
  return data;
}
export async function ownedOrder(request: Request, id: string) {
  const { db, user } = await student(request);
  const order = checked(
    await db
      .from("pwd_lms_orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  );
  if (!order) throw new HttpError(404, "Order not found");
  return { db, user, order };
}
export async function fulfill(session: Stripe.Checkout.Session) {
  if (
    session.payment_status !== "paid" ||
    session.metadata?.application !== "pwd_training_center" ||
    !session.metadata?.pwd_order_id
  )
    return;
  const db = getSupabaseAdmin();
  const order = checked(
    await db
      .from("pwd_lms_orders")
      .select("*")
      .eq("stripe_session", session.id)
      .maybeSingle(),
  );
  if (!order) throw new Error("Payment order mapping unavailable");
  if (
    session.metadata?.pwd_order_id !== order.id ||
    session.amount_total !== order.amount ||
    session.currency?.toUpperCase() !== order.currency
  )
    throw new Error("Payment does not match order");
  checked(
    await db
      .from("pwd_lms_orders")
      .update({ status: "paid", method: "stripe" })
      .eq("id", order.id)
      .in("status", ["pending", "rejected"]),
  );
}
export async function refundAccess(charge: Stripe.Charge) {
  if (
    charge.metadata?.application !== "pwd_training_center" ||
    !charge.refunded ||
    charge.amount_refunded !== charge.amount ||
    !charge.payment_intent
  )
    return;
  const paymentIntent =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent.id;
  const sessions = await stripeClient().checkout.sessions.list({
    payment_intent: paymentIntent,
    limit: 10,
  });
  const db = getSupabaseAdmin();
  for (const session of sessions.data) {
    if (
      session.metadata?.application !== "pwd_training_center" ||
      !session.metadata?.pwd_order_id
    )
      continue;
    checked(
      await db
        .from("pwd_lms_orders")
        .update({ status: "refunded" })
        .eq("stripe_session", session.id)
        .eq("id", session.metadata.pwd_order_id)
        .eq("method", "stripe")
        .eq("status", "paid"),
    );
  }
}
