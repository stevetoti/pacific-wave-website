import { reportServerError } from "@/lib/server/report-error";
import { sendPaidWelcomes } from "@/lib/server/paid-welcome";
export const dynamic="force-dynamic";
export const maxDuration=300;
export async function GET(request:Request) {
  if(!process.env.CRON_SECRET || request.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`) return Response.json({error:"Unauthorized"},{status:401});
  try {return Response.json(await sendPaidWelcomes());} catch(error) {await reportServerError("lms/welcome-cron",error);return Response.json({error:"Welcome email queue unavailable"},{status:503});}
}
