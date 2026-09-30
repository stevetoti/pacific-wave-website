import { processNotificationEmails } from "@/lib/server/notifications";
import { apiError } from "@/lib/server/http";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
// Every minute: sends batched message, mention, announcement and connection emails.
export async function GET(request: Request) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return new Response("Unauthorized", { status: 401 });
  try {
    await processNotificationEmails();
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e, "notification-cron");
  }
}
