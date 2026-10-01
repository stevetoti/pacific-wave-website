// Local QA only: run server with TRAINING_EMAIL_MODE=disabled, VERCEL_ENV=preview.
import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base='http://localhost:3103',url=process.env.NEXT_PUBLIC_SUPABASE_URL,ref=new URL(url).hostname.split('.')[0];
assert.equal(ref,'rndegttgwtpkbjtvjgnc');
const db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const users=[];let course,lesson,order,recording,guard=false,browser;
const sql=async query=>{const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query})});if(!r.ok)throw Error(await r.text());return r.json();};
const api=async(u,path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${u.session.access_token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};};
const pageFor=async u=>{const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(30000);await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:`sb-${ref}-auth-token`,value:u.session});return page;};
try{
  for(const name of ['Instructor','Student','Outsider']){
    const email=`blp-upload-qa-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;
    const {user}=await check(db.auth.admin.createUser({email,password,email_confirm:true}));users.push({...user,name});
    await check(db.from('pwd_lms_profiles').insert({user_id:user.id,full_name:`BLP Upload QA ${name}`,message_emails:false}));
    const auth=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
    users.at(-1).session=(await check(auth.auth.signInWithPassword({email,password}))).session;
  }
  const [teacher,student,outsider]=users;
  await sql(`create function public.pwd_upload_qa_email_guard() returns trigger language plpgsql as $$ begin if exists(select 1 from public.pwd_lms_orders where id=new.order_id and user_id='${student.id}') then return null; end if; return new; end $$;create trigger pwd_upload_qa_email_guard before insert on public.pwd_lms_emails for each row execute function public.pwd_upload_qa_email_guard();`);guard=true;
  course=await check(db.from('pwd_lms_courses').insert({slug:`blp-upload-qa-${randomUUID()}`,title:'BLP Upload QA Course',kind:'live',amount:0,is_private:true,requires_approval:true,published:false,private_sessions:false}).select('*').single());
  lesson=await check(db.from('pwd_lms_lessons').insert({course_id:course.id,title:'QA upload session',position:1,content:'Private QA recording test',published:false}).select('*').single());
  order=await check(db.from('pwd_lms_orders').insert({course_id:course.id,user_id:student.id,email:student.email,name:'BLP Upload QA Student',phone:'+6785550101',attendance:'in_person',amount:0,currency:'VUV',status:'granted',method:'grant'}).select('id').single());
  await check(db.from('pwd_lms_course_instructors').insert({course_id:course.id,user_id:teacher.id}));
  assert.equal((await api(student,'/api/lms/admin',{action:'recording_upload',course_id:course.id,order_id:null,extension:'webm'})).status,403);
  browser=await chromium.launch();
  const maker=await browser.newPage();
  const bytes=await maker.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#233c6f';ctx.fillRect(0,0,320,180);ctx.fillStyle='white';ctx.font='20px sans-serif';ctx.fillText('Temporary upload test',35,90);
    const stream=canvas.captureStream(5),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
    const done=new Promise(resolve=>recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer()))));
    recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();await new Promise(resolve=>setTimeout(resolve,500));recorder.stop();stream.getTracks().forEach(t=>t.stop());return done;
  });await writeFile('/tmp/blp-upload-qa.webm',Buffer.from(bytes));await maker.close();
  const teach=await pageFor(teacher);await teach.goto(base+'/training-center/teach');
  await teach.getByRole('button',{name:/QA upload session/}).click();
  await teach.getByLabel('Upload class recording',{exact:true}).setInputFiles('/tmp/blp-upload-qa.webm');
  await teach.getByText('Recording uploaded privately. Save the lesson to attach it.',{exact:true}).waitFor();
  assert.ok(!(await check(db.from('pwd_lms_lessons').select('recording_path').eq('id',lesson.id).single())).recording_path);
  await teach.locator('input[name=published]').check();await teach.getByRole('button',{name:'Save lesson',exact:true}).click();await teach.getByText('Saved successfully.',{exact:true}).waitFor();
  const saved=await check(db.from('pwd_lms_lessons').select('*').eq('id',lesson.id).single());recording=saved.recording_path;assert.ok(recording.startsWith(course.id+'/'));assert.equal(saved.published,true);
  await teach.reload();await teach.getByRole('button',{name:/QA upload session/}).click();await teach.getByText('Private recording attached.',{exact:false}).waitFor();
  assert.equal((await api(outsider,`/api/lms/recording?id=${lesson.id}`)).status,403);
  const watch=await pageFor(student);await watch.goto(`${base}/training-center/course/${course.id}`);await watch.getByRole('button',{name:/QA upload session/}).click();await watch.getByRole('button',{name:'Play your private recording',exact:true}).click();
  await watch.locator('video').evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.onloadedmetadata=resolve;v.onerror=()=>reject(Error('Playback failed'));}));
  assert.equal(await watch.locator('video').evaluate(v=>v.videoWidth),320);
  await watch.screenshot({path:'/tmp/blp-upload-playback.png',fullPage:true});
  await check(db.from('pwd_lms_lessons').update({published:false}).eq('id',lesson.id));assert.equal((await api(student,`/api/lms/recording?id=${lesson.id}`)).status,404);
  // Verify the actual BLP editor read-only; never attach synthetic media to real sessions.
  const actualBlp=await check(db.from('pwd_lms_courses').select('id').eq('slug','blp-digital-skills-workshop').single());
  assert.equal((await api(teacher,'/api/lms/admin',{action:'recording_upload',course_id:actualBlp.id,order_id:null,extension:'webm'})).status,403);
  await check(db.from('admin_users').insert({email:teacher.email,name:'BLP Upload QA Admin',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
  const blp=await check(db.from('pwd_lms_courses').select('id').eq('slug','blp-digital-skills-workshop').single());
  await teach.goto(base+'/admin/training-center');await teach.getByRole('button',{name:'Lessons',exact:true}).click();await teach.getByLabel('Choose a course').selectOption(blp.id);
  await teach.getByRole('heading',{name:'BLP session recordings'}).waitFor();assert.equal(await teach.getByRole('button').filter({hasText:'Awaiting recording · Student preview locked'}).count(),9);
  await teach.getByRole('button',{name:/Welcome and your business goals/}).click();await teach.getByLabel('Upload class recording',{exact:true}).waitFor();assert.equal(await teach.locator('select[name=order_id]').inputValue(),'');
  await teach.screenshot({path:'/tmp/blp-admin-upload-ready.png',fullPage:true});
  console.log('PASS: real instructor UI upload/save/reload, private storage, enrolled student video metadata/playback, outsider denial and unpublish denial. Actual BLP admin shows nine prepared shared sessions and the upload guide.');
}finally{
  if(browser)await browser.close();
  if(course){const files=await check(db.storage.from('pwd-mentorship-recordings').list(course.id));if(files?.length)await check(db.storage.from('pwd-mentorship-recordings').remove(files.map(f=>course.id+'/'+f.name)));await check(db.from('pwd_lms_lessons').delete().eq('course_id',course.id));await check(db.from('pwd_lms_orders').delete().eq('course_id',course.id));await check(db.from('pwd_lms_channels').delete().eq('course_id',course.id));await check(db.from('pwd_lms_courses').delete().eq('id',course.id));}
  for(const user of users){await check(db.from('pwd_lms_audit').delete().eq('actor_id',user.id));await check(db.from('admin_users').delete().eq('email',user.email));await check(db.auth.admin.deleteUser(user.id));}
  if(guard)await sql('drop trigger if exists pwd_upload_qa_email_guard on public.pwd_lms_emails;drop function if exists public.pwd_upload_qa_email_guard();');
  console.log('Removed temporary recording, lesson, course, enrollment, accounts and email guard.');
}
