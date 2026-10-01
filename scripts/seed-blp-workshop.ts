// Run only AFTER deploying privacy-aware catalogue/API code. Never overwrite instructor edits.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { blpSlug, blpModules } from '../src/lib/lms/blp-workshop';
import { workshopResources } from '../src/lib/lms/workshop-resources';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
if(new URL(url).hostname!=='rndegttgwtpkbjtvjgnc.supabase.co') throw Error('Wrong project');
const db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY!);
function checked<T>({data,error}:{data:T;error:unknown}):T{if(error)throw error;return data;}
async function main(){
  const existing=checked(await db.from('pwd_lms_courses').select('id').eq('slug',blpSlug).maybeSingle());
  const course=existing || checked(await db.from('pwd_lms_courses').insert({
    slug:blpSlug,title:'Bring your business online — BLP Workshop',kind:'live',amount:0,currency:'VUV',is_private:true,requires_approval:true,private_sessions:false,published:false,enrollment_open:true,
    description:'A practical Business Link Pacific workshop in Digitisation, AI and Cyber Security for Ni-Vanuatu business owners. Wednesday 21 October 2026, 9 am–4 pm, Yumiwork Conference Room (Vanuatu time).',
    introduction:'Welcome to your Business Link Pacific workshop. Register for free; our team confirms participant eligibility before opening your lessons, workbook, AI faculty and private community. The workshop runs Wednesday 21 October 2026, 9 am–4 pm at Yumiwork Conference Room, Vanuatu time. Morning tea is 10:15–10:30, lunch 12–1 pm and afternoon tea 2–2:15 pm. Work through the activities in your workbook, revisit recordings when published and use your 30-day action plan to keep learning. Google verification and official registration may continue after the workshop. Third-party subscriptions are separate. Do not share passwords, codes or private customer information in exercises or chat.',
  }).select('id').single());
  for(let i=0;i<blpModules.length;i++){
    const m=blpModules[i];
    const old=checked(await db.from('pwd_lms_lessons').select('id').eq('course_id',course!.id).eq('position',i+1).maybeSingle());
    if(!old)checked(await db.from('pwd_lms_lessons').insert({course_id:course!.id,title:m.title,position:i+1,starts_at:`2026-10-21T${m.time}:00+11:00`,section_title:'21 October · Live workshop',content:`${m.body}\n\nWorkbook activity\n${m.task}\n\nYour session replay will be added here after your instructor publishes the recording.`,published:true}));
  }
  const source=process.env.BLP_RESOURCES_DIR;
  if(!source)throw Error('Set BLP_RESOURCES_DIR to the approved output/pdf folder. Course stays unpublished until resources are ready.');
  for(const resource of Object.values(workshopResources))checked(await db.storage.from('pwd-workshop-resources').upload(`${blpSlug}/${resource.file}`,await readFile(`${source}/${resource.file}`),{contentType:'application/pdf',upsert:true}));
  // Reuse Stephen's existing instructor identity, never create an account or send an invite.
  const staff=checked(await db.from('pwd_lms_course_instructors').select('user_id').limit(100));
  for(const id of Array.from(new Set((staff||[]).map(s=>s.user_id)))){
    const u=await db.auth.admin.getUserById(id);
    if(u.data.user?.email?.toLowerCase()==='steve@pacificwavedigital.com') checked(await db.from('pwd_lms_course_instructors').upsert({course_id:course!.id,user_id:id},{onConflict:'course_id,user_id',ignoreDuplicates:true}));
  }
  // Explicit switch: default is a safe, unpublished draft.
  if(process.argv.includes('--publish')) checked(await db.from('pwd_lms_courses').update({published:true}).eq('id',course!.id).eq('is_private',true).eq('requires_approval',true));
  console.log({course_id:course!.id,slug:blpSlug,modules:blpModules.length,published:process.argv.includes('--publish')});
}
main().catch(e=>{console.error(e);process.exitCode=1;});
