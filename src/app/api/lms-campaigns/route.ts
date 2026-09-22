import {after,NextResponse} from 'next/server';
import {z} from 'zod';
import {authorize} from '@/lib/server/auth';
import {apiError,HttpError,readJson} from '@/lib/server/http';
import {checked} from '@/lib/server/lms';
import {campaignSchema,campaignContent,type Campaign} from '@/lib/lms/campaign';
import {campaignSandbox,processCampaigns,sendCampaignMessage,refreshCampaignDelivery} from '@/lib/server/lms-campaigns';
import {randomUUID} from 'node:crypto';
import {rateLimit} from '@/lib/server/rate-limit';
export const dynamic='force-dynamic';export const maxDuration=60;
const json=(d:unknown)=>NextResponse.json(d,{headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){try{
 const auth=await authorize(request);if(auth.response)return auth.response;const db=auth.db;
 const id=new URL(request.url).searchParams.get('id');
 if(!id)return json({campaigns:checked(await db.from('pwd_lms_campaigns').select('*').order('created_at',{ascending:false}).limit(100)),sandbox:campaignSandbox()});
 z.uuid().parse(id);const campaign=checked(await db.from('pwd_lms_campaigns').select('*').eq('id',id).single());
 const recipients=checked(await db.from('pwd_lms_campaign_recipients').select('id,email,name,state,error,provider_id').eq('campaign_id',id).order('email').limit(500));
 const states=['pending','sending','accepted','test_accepted','delivered','bounced','complained','suppressed','skipped','needs_review'];
 const countRows=await Promise.all(states.map(async state=>{const r=await db.from('pwd_lms_campaign_recipients').select('id',{count:'exact',head:true}).eq('campaign_id',id).eq('state',state);checked(r);return [state,r.count||0] as const;}));const counts=Object.fromEntries(countRows);
 return json({campaign,recipients,counts,preview:campaignContent(campaign,'Student').html});
}catch(e){return apiError(e,'lms-campaigns:get');}}
const actionSchema=z.object({action:z.enum(['save','prepare','send','test','cancel','process','refresh']),id:z.uuid().optional(),revision:z.uuid().optional(),draft:campaignSchema.optional()});
export async function POST(request:Request){try{
 const auth=await authorize(request);if(auth.response)return auth.response;const db=auth.db;
 const input=await readJson(request,actionSchema);
 if(input.action==='save'){
  if(!input.draft)throw new HttpError(400,'Draft required');
  if(input.draft.id){const current=checked(await db.from('pwd_lms_campaigns').select('status,revision').eq('id',input.draft.id).maybeSingle());if(!current||current.status!=='draft'||current.revision!==input.draft.revision)throw new HttpError(409,'This draft changed or was already sent. Reload it or copy it as a new draft.');}
  const campaign=checked(await db.rpc('pwd_save_campaign',{input:input.draft,actor:auth.user.id,test_mode:campaignSandbox()}));return json({campaign});
 }
 if(input.action==='process'){after(processCampaigns);return json({queued:true});}
 if(!input.id)throw new HttpError(400,'Campaign required');
 const c=checked(await db.from('pwd_lms_campaigns').select('*').eq('id',input.id).single()) as Campaign;
 if(c.sandbox!==campaignSandbox())throw new HttpError(409,'Open this campaign in the environment where it was created.');
 if(input.action==='prepare'){
  if(c.status!=='draft'||input.revision!==c.revision)throw new HttpError(409,'Save and reload the current draft first.');
  const count=checked(await db.rpc('pwd_prepare_campaign',{cid:c.id,expected:c.revision}));return json({count,preview:campaignContent(c,'Student').html});
 }
 if(input.action==='send'){
  if(!c.prepared||input.revision!==c.revision)throw new HttpError(409,'Review recipients before sending.');
  const count=await db.from('pwd_lms_campaign_recipients').select('id',{count:'exact',head:true}).eq('campaign_id',c.id);checked(count);if(!count.count)throw new HttpError(400,'No recipients match this audience.');
  const updated=checked(await db.from('pwd_lms_campaigns').update({status:'sending'}).eq('id',c.id).eq('status','draft').eq('revision',input.revision).eq('prepared',true).select('id'));
  if(!updated?.length)throw new HttpError(409,'Campaign already sent or changed.');after(processCampaigns);return json({queued:true});
 }
 if(input.action==='test'){
  await rateLimit(request,`campaign-test:${auth.user.id}`,5);
  const provider_id=await sendCampaignMessage(c,auth.user.email!,'Preview',`pwd-campaign-test-${randomUUID()}`);return json({message:campaignSandbox()?'Test accepted by the sandbox inbox.':`Test sent to your admin email: ${auth.user.email}`,provider_id});
 }
 if(input.action==='cancel'){
  checked(await db.from('pwd_lms_campaigns').update({status:'cancelled'}).eq('id',c.id).in('status',['draft','sending']));return json({message:'Remaining deliveries cancelled. Emails already in flight may still arrive.'});
 }
 await refreshCampaignDelivery(c.id);return json({message:'Refreshed up to 20 provider receipts. Repeat to check more.'});
}catch(e){return apiError(e,'lms-campaigns:post');}}
