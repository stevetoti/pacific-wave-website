import { processCoachReports } from "@/lib/server/coach-report-worker";
import { sendOwnerNotifications } from "@/lib/server/owner-notifications";
import { processCampaigns } from "@/lib/server/lms-campaigns";
import { apiError } from "@/lib/server/http";
import { processMessageReminders } from "@/lib/server/messages";
export const maxDuration = 300;
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return new Response("Unauthorized", { status: 401 });
  try {
    await Promise.all([
      sendOwnerNotifications(),
      processCampaigns(),
      processCoachReports(),
      processMessageReminders(),
    ]);
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e, "campaign-cron");
  }
}
