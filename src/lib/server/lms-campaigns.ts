import 'server-only';
import {getSupabaseAdmin} from './clients';
import {checked} from './lms';
import {campaignContent, type Campaign} from '../lms/campaign';
export const campaignSandbox=()=>!(process.env.TRAINING_EMAIL_MODE==='live'&&process.env.VERCEL_ENV==='production');
const pause=()=>new Promise(r=>setTimeout(r,650));
export async function sendCampaignMessage(c:Campaign,to:string,name:string,key:string,unsubscribe?:string){
 const test=campaignSandbox();
 const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL||'Pacific Wave Digital <noreply@pacificwavedigital.com>',to:test?'delivered@resend.dev':to,reply_to:'steve@pacificwavedigital.com',subject:c.subject,...campaignContent(c,name,unsubscribe),...(unsubscribe?{headers:{'List-Unsubscribe':`<${unsubscribe.replace('/training-center/email-preferences','/api/training-unsubscribe')}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}}:{})})});
 if(!response.ok)throw Error(`Email provider returned ${response.status}`);
 const result=await response.json();if(!result.id)throw Error('Email provider returned no receipt');return result.id as string;
}
export async function processCampaigns(){
 const db=getSupabaseAdmin(),sandbox=campaignSandbox(),deadline=Date.now()+45000;
 while(Date.now()<deadline){
  const rows=checked(await db.rpc('pwd_claim_campaign_recipient',{test_mode:sandbox}));const r=rows?.[0];if(!r)break;
  const c=checked(await db.from('pwd_lms_campaigns').select('*').eq('id',r.campaign_id).single()) as Campaign;
  const save=async (values:Record<string,unknown>)=>checked(await db.from('pwd_lms_campaign_recipients').update({...values,updated_at:new Date().toISOString()}).eq('id',r.id));
  const suppressed=checked(await db.from('pwd_lms_email_suppressions').select('email').eq('email',r.email).maybeSingle());
  if(c.status!=='sending'||suppressed){await save({state:'skipped',lock_until:null,error:suppressed?'Unsubscribed or suppressed':'Campaign cancelled'});continue;}
  // Provider idempotency lasts 24h. Never resend an uncertain attempt beyond that window.
  if(Date.now()-new Date(r.first_attempt_at).getTime()>23*3600000){await save({state:'needs_review',lock_until:null,error:'Delivery uncertain; review before creating another campaign.'});continue;}
  try{
   const provider_id=await sendCampaignMessage(c,r.email,r.name,`pwd-campaign-${r.id}`,`https://pacificwavedigital.com/training-center/email-preferences?token=${r.unsubscribe_token}`);
   await save({state:sandbox?'test_accepted':'accepted',provider_id,lock_until:null,error:null});
  }catch(e){await save({state:r.attempts>=3?'needs_review':'pending',lock_until:new Date(Date.now()+60000).toISOString(),error:e instanceof Error?e.message:'Delivery failed'});}
  await pause();
 }
 const campaigns=checked(await db.from('pwd_lms_campaigns').select('id').eq('status','sending').eq('sandbox',sandbox))||[];
 for(const c of campaigns){const pending=await db.from('pwd_lms_campaign_recipients').select('id',{count:'exact',head:true}).eq('campaign_id',c.id).in('state',['pending','sending']);checked(pending);if(pending.count===0)checked(await db.from('pwd_lms_campaigns').update({status:'completed'}).eq('id',c.id).eq('status','sending'));}
}
export async function refreshCampaignDelivery(id:string){
 const db=getSupabaseAdmin();const rows=checked(await db.from('pwd_lms_campaign_recipients').select('id,email,provider_id').eq('campaign_id',id).in('state',['accepted','delivered']).order('updated_at').limit(20))||[];
 for(const r of rows){
  const response=await fetch(`https://api.resend.com/emails/${encodeURIComponent(r.provider_id)}`,{headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Unable to refresh provider delivery status');const result=await response.json();
  const event=String(result.last_event||'').replace('email.','');const state=['opened','clicked'].includes(event)?'delivered':['delivered','bounced','complained','suppressed'].includes(event)?event:'accepted';
  checked(await db.from('pwd_lms_campaign_recipients').update({state,updated_at:new Date().toISOString()}).eq('id',r.id));
  if(['bounced','complained','suppressed'].includes(state))checked(await db.from('pwd_lms_email_suppressions').upsert({email:r.email,reason:state}));await pause();
 }
}
