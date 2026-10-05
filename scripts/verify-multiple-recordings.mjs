import {createClient} from '@supabase/supabase-js';
import nextEnv from '@next/env';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
nextEnv.loadEnvConfig(process.cwd());
const base=process.env.RECORDING_TEST_URL||'http://127.0.0.1:3147',env=process.env;
const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const users=[];let course,browser;
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
async function sql(query){const r=await fetch('https://api.supabase.com/v1/projects/rndegttgwtpkbjtvjgnc/database/query',{method:'POST',headers:{Authorization:'Bearer '+env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query})});if(!r.ok)throw Error(await r.text());return r.json();}
async function api(u,path,body){const r=await fetch(base+'/api/lms/'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+u.session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
try {
 for(const name of ['Student','Pending','Admin']){const email='recording-qa-'+randomUUID()+'@example.com',password='Qa-'+randomUUID()+'!';const {user}=await check(db.auth.admin.createUser({email,password,email_confirm:true}));users.push({...user,name});const auth=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});users.at(-1).session=(await check(auth.auth.signInWithPassword({email,password}))).session;}
 const [student,pending,admin]=users;
 await check(db.from('admin_users').insert({email:admin.email,name:'Recording QA Admin',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
 course=await check(db.from('pwd_lms_courses').insert({slug:'recording-qa-'+randomUUID(),title:'Recording QA course',kind:'live',amount:0,currency:'VUV',published:false,is_private:true,requires_approval:true}).select().single());
 for(const u of [student,pending]){const oid=randomUUID();await sql(`begin;insert into public.pwd_lms_orders(id,user_id,course_id,email,name,phone,attendance,amount,currency,status,method) values('${oid}','${u.id}','${course.id}','${u.email}','Recording QA ${u.name}','+6785550101','online',0,'VUV','${u===student?'granted':'pending'}','grant');delete from public.pwd_lms_emails where order_id='${oid}';commit;`);}
 const lesson=await check(db.from('pwd_lms_lessons').insert({course_id:course.id,title:'Recording QA lesson',position:1,published:true,youtube_id:'dQw4w9WgXcQ',meeting_url:'https://zoom.us/j/12345678901'}).select().single());
 browser=await chromium.launch({headless:true});
 for(const [name,options]of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',devices['iPhone 13']]]){
  console.log('Checking '+name+' admin and student workflow');
  const ctx=await browser.newContext(options);await ctx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),admin.session);const page=await ctx.newPage();
  await page.goto(base+'/admin/training-center');if(name==='mobile')await page.getByLabel(/Go to/).selectOption('lessons');else await page.getByRole('button',{name:'Lessons',exact:true}).click();await page.getByLabel(/Choose a course/).selectOption(course.id);await page.getByRole('button',{name:/1\. Recording QA lesson/}).click();
  assert.equal(await page.getByLabel('YouTube recording 1',{exact:true}).inputValue(),'dQw4w9WgXcQ');
  if(name==='desktop'){
   await page.getByRole('button',{name:'Add another video',exact:true}).click();await page.getByLabel('YouTube recording 2',{exact:true}).fill('https://www.youtube.com/watch?v=abcdefghijk&si=example');
   await page.getByRole('button',{name:'Save lesson',exact:true}).click();await page.getByText('Saved successfully.',{exact:true}).waitFor();
  }
  await page.reload();if(name==='mobile')await page.getByLabel(/Go to/).selectOption('lessons');else await page.getByRole('button',{name:'Lessons',exact:true}).click();await page.getByLabel(/Choose a course/).selectOption(course.id);await page.getByRole('button',{name:/1\. Recording QA lesson/}).click();assert.equal(await page.getByLabel('YouTube recording 2',{exact:true}).inputValue(),'abcdefghijk');
  await page.getByRole('button',{name:'Add another video',exact:true}).click();await page.getByLabel('YouTube recording 3',{exact:true}).fill('https://evil.test/watch?v=abcdefghijk');await page.getByRole('button',{name:'Save lesson',exact:true}).click();await page.getByText('Please enter a valid YouTube video link or 11-character video ID for each recording.').waitFor();await page.getByRole('button',{name:'Remove recording 3',exact:true}).click();
  await page.getByRole('group',{name:'YouTube recordings',exact:true}).screenshot({path:'/private/tmp/pwd-recordings-admin-'+name+'.png'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await ctx.close();
  const sc=await browser.newContext(options);await sc.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),student.session);const sp=await sc.newPage();
  await sp.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({contentType:'text/html',body:'<p>Video embed fixture</p>'}));
  await sp.goto(base+'/training-center/course/'+course.id);await sp.getByRole('button',{name:/1\. Recording QA lesson/}).click();
  await sp.getByRole('button',{name:'Watch Part 1',exact:true}).click();assert.equal(await sp.locator('iframe.lms-video').getAttribute('src'),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  await sp.getByRole('button',{name:'Watch Part 2',exact:true}).click();assert.equal(await sp.locator('iframe.lms-video').count(),1);assert.equal(await sp.locator('iframe.lms-video').getAttribute('src'),'https://www.youtube-nocookie.com/embed/abcdefghijk');
  await sp.getByRole('button',{name:'Mark lesson complete',exact:true}).waitFor();assert.ok(await sp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await sp.getByRole('region',{name:'Class recordings',exact:true}).screenshot({path:'/private/tmp/pwd-recordings-student-'+name+'.png'});await sc.close();
 }
 let data=await api(student,'course?id='+course.id);assert.deepEqual(data.data.lessons[0].youtube_ids,['dQw4w9WgXcQ','abcdefghijk']);
 data=await api(pending,'course?id='+course.id);assert.deepEqual(data.data.lessons[0].youtube_ids,[]);assert.equal(data.data.lessons[0].youtube_id,'');
 await check(db.from('pwd_lms_lessons').update({published:false}).eq('id',lesson.id));data=await api(student,'course?id='+course.id);assert.deepEqual(data.data.lessons[0].youtube_ids,[]);
 console.log('PASS: admin full links/add/remove/save/reload and student ordered single player desktop/mobile; pending and draft privacy.');
} catch(error) { console.error(error); throw error; } finally {
 if(browser)await browser.close();
 if(course){await check(db.from('pwd_lms_lessons').delete().eq('course_id',course.id));await check(db.from('pwd_lms_orders').delete().eq('course_id',course.id));await check(db.from('pwd_lms_channels').delete().eq('course_id',course.id));await check(db.from('pwd_lms_courses').delete().eq('id',course.id));}
 for(const u of users){await check(db.from('admin_users').delete().eq('email',u.email));await check(db.auth.admin.deleteUser(u.id));}
 console.log('Recording QA fixtures cleaned.');
}
