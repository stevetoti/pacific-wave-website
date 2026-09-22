import 'server-only';
import {getSupabaseAdmin} from './clients';
import {checked} from './lms';
import {reportServerError} from './report-error';
export const ownerSandbox=()=>!(process.env.TRAINING_EMAIL_MODE==='live'&&process.env.VERCEL_ENV==='production');
export async function queueOwnerNotification(event_key:string,subject:string,body:string){
 try{checked(await getSupabaseAdmin().from('pwd_owner_notifications').upsert({event_key,subject,body,sandbox:ownerSandbox()},{onConflict:'event_key',ignoreDuplicates:true}));}
 catch(e){await reportServerError('owner-notification/queue',e);}
}
export async function sendOwnerNotifications(){
 if(process.env.VERCEL_ENV!=="production" && process.env.TRAINING_EMAIL_MODE==="disabled")return;
 const db=getSupabaseAdmin(),sandbox=ownerSandbox(),deadline=Date.now()+20000;
 for(let i=0;i<5&&Date.now()<deadline;i++){
  const jobs=checked(await db.rpc('pwd_claim_owner_notification',{test_mode:sandbox}));const job=jobs?.[0];if(!job)break;
  if(Date.now()-new Date(job.first_attempt_at).getTime()>23*3600000){checked(await db.from('pwd_owner_notifications').update({state:'needs_review',lock_until:null}).eq('id',job.id));continue;}
  try{
   const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`pwd-owner-${job.id}`},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'Pacific Wave Digital <noreply@pacificwavedigital.com>',to:sandbox?'delivered@resend.dev':'steve@pacificwavedigital.com',subject:job.subject,text:job.body+'\n\nPacific Wave Digital admin: https://pacificwavedigital.com/admin'})});
   if(!response.ok)throw Error('Owner notification provider rejected request');const result=await response.json();if(!result.id)throw Error('Missing provider receipt');
   checked(await db.from('pwd_owner_notifications').update({state:sandbox?'test_accepted':'accepted',provider_id:result.id,lock_until:null}).eq('id',job.id));
  }catch(e){await reportServerError('owner-notification/send',e);checked(await db.from('pwd_owner_notifications').update({lock_until:new Date(Date.now()+60000).toISOString()}).eq('id',job.id));}
  await new Promise(r=>setTimeout(r,650));
 }
}
