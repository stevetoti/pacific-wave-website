import { sendLmsEmails } from "@/lib/server/lms-email";
import { after, NextResponse } from "next/server";
import { stripeClient, fulfill, refundAccess } from "@/lib/server/lms";
import { apiError } from "@/lib/server/http";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Payments unavailable" },
      { status: 503 },
    );
  let event;
  try {
    const body = await request.text();
    if (body.length > 262144) return new Response(null, { status: 413 });
    event = stripeClient().webhooks.constructEvent(
      body,
      request.headers.get("stripe-signature") || "",
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    )
      await fulfill(event.data.object);
    if (event.type === "charge.refunded") await refundAccess(event.data.object);
    after(sendLmsEmails);
    return NextResponse.json({ received: true });
  } catch (e) {
    return apiError(e, "lms/stripe-webhook");
  }
}
