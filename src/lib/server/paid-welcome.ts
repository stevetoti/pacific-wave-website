import "server-only";
import { getSupabaseAdmin } from "./clients";
import { checked } from "./lms";
import { paidWelcomeEmail } from "../email/paid-welcome";
import { reportServerError } from "./report-error";
// Only the dedicated welcome queue is claimed; legacy status-email jobs stay untouched.
type WelcomePayload = { from: string; to: string; reply_to: string; subject: string; html: string; text: string };
type WelcomeJob = { id: string; order_id: string; attempts: number; first_attempt_at?: string; payload?: WelcomePayload };
type WelcomeServices = {
  database?: () => ReturnType<typeof getSupabaseAdmin>;
  request?: typeof fetch;
  report?: typeof reportServerError;
  enabled?: boolean;
};
export async function sendPaidWelcomes(orderIds?: string[], services: WelcomeServices = {}) {
  if (!(services.enabled ?? (process.env.VERCEL_ENV === "production" && process.env.TRAINING_EMAIL_MODE === "live"))) return {accepted:0,failed:0,disabled:true};
  if (orderIds && !orderIds.length) return {accepted:0,failed:0};
  const db=(services.database || getSupabaseAdmin)();
  let accepted=0,failed=0;
  const deadline=Date.now()+240000;
  // Drain bounded batches in parallel; even a large selection starts promptly.
  while (Date.now()<deadline-30000) {
    const jobs=(checked(await db.rpc("pwd_lms_claim_welcomes",{p_orders:orderIds || null})) || []) as WelcomeJob[];
    if (!jobs.length) break;
    for (let offset=0;offset<jobs.length;offset+=5) await Promise.all(jobs.slice(offset,offset+5).map(async job => {
    try {
      const order=checked(await db.from("pwd_lms_orders").select("*").eq("id",job.order_id).single());
      if (!order || !["paid","granted"].includes(order.status)) {
        checked(await db.from("pwd_lms_emails").update({state:"cancelled",locked_until:null,last_error:"Enrolment no longer has paid access"}).eq("id",job.id));return;
      }
      // Reserved test addresses must never reach the provider or create owner copies.
      if (/@(?:[^@]*\.)?(?:example\.(?:test|invalid)|invalid|test)$/i.test(order.email)) {
        checked(await db.from("pwd_lms_emails").update({state:"test_skipped",locked_until:null,last_error:"Reserved test recipient; no email sent"}).eq("id",job.id));return;
      }
      // Resend retains idempotency keys for24h. Stop ambiguous retries before expiry.
      if (job.attempts>1 && job.first_attempt_at && Date.now()-Date.parse(job.first_attempt_at)>23*3600000) {
        failed++;
        checked(await db.from("pwd_lms_emails").update({state:"failed",locked_until:null,last_error:"Safe retry window expired; review provider receipt before resending"}).eq("id",job.id));
        await (services.report || reportServerError)("lms/welcome-expired",new Error("Welcome email needs manual receipt review"));return;
      }
      let payload=job.payload;
      if (!payload) {
        const course=checked(await db.from("pwd_lms_courses").select("id,title,slug,private_sessions,cohort_id").eq("id",order.course_id).single());
        if (!course) throw Error("Welcome course unavailable");
        const cohort=course.cohort_id ? checked(await db.from("pwd_training_cohorts").select("config").eq("id",course.cohort_id).single()) : null;
        const content=paidWelcomeEmail(order.name,course,cohort?.config);
        payload={from:process.env.RESEND_FROM_EMAIL || "Pacific Wave Digital <noreply@pacificwavedigital.com>",to:order.email,reply_to:"steve@pacificwavedigital.com",...content};
        // Persist exact recipient/content before any provider request so retries match.
        checked(await db.from("pwd_lms_emails").update({payload}).eq("id",job.id));
      }
      const response=await (services.request || fetch)("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(10000),headers:{
        Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":`pwd-welcome-${job.id}`,
      },body:JSON.stringify(payload)});
      if (!response.ok) throw Error(`Welcome email provider rejected request (${response.status})`);
      const receipt=await response.json();
      if (typeof receipt.id !== "string" || !receipt.id) throw Error("Welcome email provider returned no message ID");
      checked(await db.from("pwd_lms_emails").update({state:"accepted",provider_id:receipt.id,accepted_at:new Date().toISOString(),locked_until:null,last_error:null}).eq("id",job.id));
      accepted++;
    } catch (error) {
      failed++;
      checked(await db.from("pwd_lms_emails").update({state:job.attempts>=6?"failed":"pending",locked_until:job.attempts>=6?null:new Date(Date.now()+300000).toISOString(),last_error:error instanceof Error?error.message:"Welcome email unavailable"}).eq("id",job.id));
      await (services.report || reportServerError)("lms/welcome",error);
    }
    }));
  }
  return {accepted,failed};
}
