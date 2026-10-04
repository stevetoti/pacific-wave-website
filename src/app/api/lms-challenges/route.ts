import { NextResponse } from 'next/server';
import { z } from 'zod';
import { student,checked } from '@/lib/server/lms';
import { teachingAccess } from '@/lib/server/teaching';
import { readJson,apiError,HttpError } from '@/lib/server/http';
import { challengeSchema,claimSchema } from '@/lib/lms/challenges';
export const dynamic='force-dynamic';
const json=(data:unknown)=>NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});
async function enrolled(db:Awaited<ReturnType<typeof student>>['db'],userId:string,courseId:string){
 const row=checked(await db.from('pwd_lms_orders').select('id').eq('user_id',userId).eq('course_id',courseId).in('status',['paid','granted']).maybeSingle());
 if(!row)throw new HttpError(403,'Approved course access required.');
}
export async function GET(request:Request){try{
 const url=new URL(request.url),parsed=z.uuid().safeParse(url.searchParams.get('course'));if(!parsed.success)throw new HttpError(400,'Choose a valid course.');const courseId=parsed.data;
 const manage=url.searchParams.get('manage')==='1';
 const teacher=manage?await teachingAccess(request):null;
 const access=teacher||await student(request);
 if(teacher)teacher.assertCourse(courseId);else await enrolled(access.db,access.user.id,courseId);
 let query=access.db.from('pwd_lms_challenges').select('*').eq('course_id',courseId).order('opens_at');if(!manage)query=query.eq('published',true);
 const challenges=checked(await query)||[];const ids=challenges.map(c=>c.id);
 let claimsQuery=access.db.from('pwd_lms_challenge_claims').select('*').in('challenge_id',ids).order('achieved_at').order('submitted_at');if(!manage)claimsQuery=claimsQuery.eq('user_id',access.user.id);
 const claims=ids.length?checked(await claimsQuery)||[]:[];
 const contacts=manage&&claims.length?checked(await access.db.from('pwd_lms_orders').select('user_id,name,email').eq('course_id',courseId).in('user_id',claims.map(c=>c.user_id)))||[]:[];
 return json({challenges,claims:claims.map(c=>manage?{...c,student_name:contacts.find(o=>o.user_id===c.user_id)?.name,student_email:contacts.find(o=>o.user_id===c.user_id)?.email}:c),admin:teacher?.admin||false});
}catch(e){return apiError(e,'lms-challenges/get');}}
export async function POST(request:Request){try{
 const input=await readJson(request,z.discriminatedUnion('action',[
 z.object({action:z.literal('save'),challenge:challengeSchema}),
 z.object({action:z.literal('submit'),claim:claimSchema}),
 z.object({action:z.literal('review'),id:z.uuid(),status:z.enum(['verified','rejected','winner','delivered']),note:z.string().trim().min(4).max(1500)}),
 ]));
 if(input.action==='submit'){
 const {db,user}=await student(request),v=input.claim;
 const c=checked(await db.from('pwd_lms_challenges').select('*').eq('id',v.challenge_id).eq('published',true).maybeSingle());if(!c)throw new HttpError(404,'Challenge not found.');
 await enrolled(db,user.id,c.course_id);
 const now=Date.now(),achieved=Date.parse(v.achieved_at);
 if(now<Date.parse(c.opens_at)||now>=Date.parse(c.closes_at))throw new HttpError(409,'Submissions are only accepted while the challenge is open.');
 if(achieved<Date.parse(c.opens_at)||achieved>=Date.parse(c.closes_at)||achieved>now)throw new HttpError(400,'Achievement must be within the challenge dates and cannot be in the future.');
 const {error}=await db.from('pwd_lms_challenge_claims').insert({...v,user_id:user.id});if(error?.code==='23505')throw new HttpError(409,'You have already submitted proof for this challenge.');if(error?.code==='P0001')throw new HttpError(409,error.message);if(error)throw error;
 return json({success:true});
 }
 const access=await teachingAccess(request),{db}=access;
 if(input.action==='save'){
 if(!access.admin)throw new HttpError(403,'Only administrators can set or publish prize commitments.');
 const {id,...values}=input.challenge;access.assertCourse(values.course_id);
 if(id){const old=checked(await db.from('pwd_lms_challenges').select('course_id,published').eq('id',id).single());if(!old)throw new HttpError(404,'Challenge not found.');if(old.course_id!==values.course_id||old.published)throw new HttpError(409,'Published challenge rules are fixed. Create a new challenge for new terms.');const updated=checked(await db.from('pwd_lms_challenges').update(values).eq('id',id).eq('published',false).select('id').maybeSingle());if(!updated)throw new HttpError(409,'Challenge changed. Reload before editing.');}
 else checked(await db.from('pwd_lms_challenges').insert(values));
 return json({success:true});
 }
 const claim=checked(await db.from('pwd_lms_challenge_claims').select('challenge_id').eq('id',input.id).single());
 if(!claim)throw new HttpError(404,'Submission not found.');
 const c=checked(await db.from('pwd_lms_challenges').select('course_id').eq('id',claim.challenge_id).single());if(!c)throw new HttpError(404,'Challenge not found.');access.assertCourse(c.course_id);
 if(['winner','delivered'].includes(input.status)&&!access.admin)throw new HttpError(403,'An administrator awards and fulfils prizes.');
 const {error}=await db.rpc('pwd_challenge_review',{p_claim:input.id,p_status:input.status,p_note:input.note,p_reviewer:access.user.id});if(error?.code==='P0001')throw new HttpError(409,error.message);if(error)throw error;
 return json({success:true});
}catch(e){return apiError(e,'lms-challenges/post');}}
