import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const base=process.env.BLP_TEST_URL || 'http://localhost:3103';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const ref=new URL(url).hostname.split('.')[0];assert.equal(ref,'rndegttgwtpkbjtvjgnc');
const users=[],orders=[],tempCourses=[];let browser,guard=false;
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const lit=v=>"'"+String(v).replaceAll("'","''")+"'";
async function sql(query){const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query})});if(!r.ok)throw Error(await r.text());return r.json();}
async function api(u,path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${u?.session.access_token||''}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:r.headers.get('content-type')?.includes('json')?await r.json():Buffer.from(await r.arrayBuffer())};}
async function pageFor(u,width=1440){const page=await browser.newPage({viewport:{width,height:1000},acceptDownloads:true});await page.addInitScript(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key:`sb-${ref}-auth-token`,session:u.session});return page;}
try{
 const blp=await check(db.from('pwd_lms_courses').select('*').eq('slug','blp-digital-skills-workshop').single());
 const publicCourses=await check(db.from('pwd_lms_courses').select('id').eq('is_private',false).eq('published',true).limit(2));assert.equal(publicCourses.length,2);
 for(const name of ['Applicant','Classmate','PublicA','PublicB','OtherPrivate','Admin']){
   const email=`blp-qa-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;
   const {user}=await check(db.auth.admin.createUser({email,password,email_confirm:true}));
   users.push({...user,name,password});
   await check(db.from('pwd_lms_profiles').insert({user_id:user.id,full_name:`BLP QA ${name}`,message_emails:false}));
   const client=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
   users.at(-1).session=(await check(client.auth.signInWithPassword({email,password}))).session;
 }
 const [applicant,classmate,pubA,pubB,other,admin]=users;
 // Suppress only this run's fixture enrollment emails at queue insertion, atomically.
 // All real students keep the production email behavior throughout the test.
 await sql(`create or replace function public.pwd_blp_qa_email_guard() returns trigger language plpgsql as $$ begin if exists(select 1 from public.pwd_lms_orders where id=new.order_id and user_id in (${users.map(u=>lit(u.id)).join(',')})) then return null; end if; return new; end $$; create trigger pwd_blp_qa_email_guard before insert on public.pwd_lms_emails for each row execute function public.pwd_blp_qa_email_guard();`);guard=true;
 await check(db.from('admin_users').insert({email:admin.email,name:'BLP QA Admin',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
 const otherCourse=await check(db.from('pwd_lms_courses').insert({slug:`blp-qa-${randomUUID()}`,title:'BLP QA unrelated private workshop',kind:'live',amount:0,published:false,is_private:true,requires_approval:true}).select('id').single());tempCourses.push(otherCourse.id);
 for(const [u,c,status] of [[applicant,blp.id,'pending'],[classmate,blp.id,'granted'],[pubA,publicCourses[0].id,'granted'],[pubB,publicCourses[1].id,'granted'],[other,otherCourse.id,'granted']]){
   orders.push(await check(db.from('pwd_lms_orders').insert({user_id:u.id,course_id:c,email:u.email,name:`BLP QA ${u.name}`,phone:'+6785550101',attendance:'in_person',amount:0,currency:'VUV',status,method:'grant',package_label:'BLP QA fixture'}).select('*').single()));
 }
 const ownOrder=orders[0];
 assert.equal((await api(applicant,'/api/lms-workshop-resources?resource=workbook')).status,403);
 assert.equal((await api(applicant,`/api/lms-community?course=${blp.id}`)).status,403);
 assert.equal((await api(applicant,`/api/lms-coach?course=${blp.id}`)).status,403);
 const pending=await api(applicant,`/api/lms/course?id=${blp.id}`);assert.equal(pending.status,200);assert.ok(pending.data.lessons.every(l=>!l.content&&!l.meeting_url&&!l.youtube_id));
 for(const [path,body] of [['/api/lms/checkout',{id:ownOrder.id}],['/api/lms/coupon',{id:ownOrder.id,code:'FREE'}],['/api/lms-manage',{action:'approve_workshop',id:ownOrder.id}]]) assert.equal((await api(applicant,path,body)).status,403,path);
 browser=await chromium.launch();
 const studentPage=await pageFor(applicant);
 await studentPage.goto(`${base}/training-center/course/${blp.id}`);await studentPage.getByText(/Awaiting approval\. Our team/).waitFor();
 const adminPage=await pageFor(admin);
 await adminPage.goto(base+'/admin/training-center');await adminPage.getByRole('button',{name:'Access',exact:true}).click();
 const row=adminPage.locator('article').filter({hasText:'BLP QA Applicant'});await row.getByRole('button',{name:'Approve participant'}).click();await adminPage.getByText('Saved successfully.',{exact:true}).waitFor();
 await adminPage.reload();await adminPage.getByRole('button',{name:'Access',exact:true}).click();assert.equal(await adminPage.getByRole('button',{name:'Approve participant'}).count(),0);
 assert.equal((await check(db.from('pwd_lms_orders').select('status').eq('id',ownOrder.id).single())).status,'granted');
 await studentPage.reload();await studentPage.getByRole('heading',{name:'Your workshop resources'}).waitFor();
 await studentPage.getByRole('button',{name:'View Facilitator and course guide',exact:true}).click();await studentPage.getByTitle('Facilitator and course guide',{exact:true}).waitFor();await studentPage.getByRole('button',{name:'Close preview'}).click();
 const download=studentPage.waitForEvent('download');await studentPage.getByRole('button',{name:'Download Participant workbook',exact:true}).click();assert.equal((await download).suggestedFilename(),'BLP-Participant-Workbook-v4.pdf');
 for(const resource of ['workbook','outline','guide'])assert.equal((await api(applicant,`/api/lms-workshop-resources?resource=${resource}`)).data.subarray(0,4).toString(),'%PDF');
 assert.equal((await api(applicant,`/api/lms-coach?course=${blp.id}`)).status,200);
 assert.equal((await api(applicant,`/api/lms-community?course=${blp.id}`)).status,200);
 for(const u of [pubA,other]){
   assert.equal((await api(u,'/api/lms-workshop-resources?resource=workbook')).status,403);
   assert.equal((await api(u,`/api/lms-community?course=${blp.id}`)).status,403);
 }
 for(const width of [1440,390]){
   const p=await pageFor(applicant,width);await p.goto(`${base}/training-center/course/${blp.id}`);await p.getByRole('heading',{name:'Your workshop resources'}).waitFor();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:`/tmp/blp-approved-${width}.png`,fullPage:true});await p.close();
 }
 const dir=await api(applicant,'/api/lms-messages?directory=1');assert.equal(dir.status,200);assert.ok(dir.data.people.some(p=>p.user_id===classmate.id));assert.ok(!dir.data.people.some(p=>[pubA.id,pubB.id,other.id].includes(p.user_id)));
 const publicDir=await api(pubA,'/api/lms-messages?directory=1');assert.ok(publicDir.data.people.some(p=>p.user_id===pubB.id));assert.ok(!publicDir.data.people.some(p=>[applicant.id,classmate.id,other.id].includes(p.user_id)));
 const dm='/api/lms-messages';
 assert.equal((await api(applicant,dm,{action:'request',user_id:pubA.id})).status,400);
 assert.equal((await api(applicant,dm,{action:'open',user_id:pubA.id})).status,403);
 assert.equal((await api(applicant,dm,{action:'request',user_id:classmate.id})).status,200);
 assert.equal((await api(classmate,dm,{action:'request',user_id:applicant.id})).status,200);
 const opened=await api(applicant,dm,{action:'open',user_id:classmate.id});assert.equal(opened.status,200);
 assert.equal((await api(applicant,dm,{action:'send',thread_id:opened.data.thread_id,body:'Synthetic BLP privacy test',client_id:randomUUID()})).status,200);
 assert.equal((await api(classmate,`${dm}?thread=${opened.data.thread_id}`)).status,200);
 assert.equal((await api(pubA,`${dm}?thread=${opened.data.thread_id}`)).status,404);
 // Existing cross-boundary history must not reveal data through thread reads or files.
 const [a,b]=[applicant.id,pubA.id].sort();
 const stale=await check(db.from('pwd_lms_dm_threads').insert({user_a:a,user_b:b,last_message_at:new Date().toISOString()}).select('id').single());
 const file=randomUUID();await check(db.from('pwd_lms_dm_files').insert({id:file,thread_id:stale.id,user_id:pubA.id,path:'qa/no-file',name:'private.pdf',mime:'application/pdf',size:4}));
 assert.equal((await api(applicant,`${dm}?thread=${stale.id}`)).status,404);assert.equal((await api(applicant,`${dm}?file=${file}`)).status,404);
 const overview=await api(applicant,dm);assert.ok(!overview.data.threads.some(t=>t.id===stale.id));
 assert.equal((await api(admin,'/api/lms-manage',{action:'revoke',id:ownOrder.id})).status,200);
 assert.equal((await api(applicant,'/api/lms-workshop-resources?resource=workbook')).status,403);
 assert.equal((await api(classmate,`${dm}?thread=${opened.data.thread_id}`)).status,404);
 console.log('PASS: approval via admin UI/reload, pending lesson/resource/coach/chat/payment guards, approved downloads/coach/community, desktop/mobile, public cross-course directory, BLP isolation, accepted DM, third-party/stale-thread/file denial, revocation.');
} finally {
 if(browser)await browser.close();
 for(const u of users){await check(db.from('pwd_lms_dm_reports').delete().eq('reporter',u.id));await check(db.from('pwd_lms_audit').delete().eq('actor_id',u.id));await check(db.from('admin_users').delete().eq('email',u.email));}
 for(const o of orders){await check(db.from('pwd_lms_lessons').delete().eq('order_id',o.id));await check(db.from('pwd_lms_emails').delete().eq('order_id',o.id));await check(db.from('pwd_lms_orders').delete().eq('id',o.id));}
 for(const id of tempCourses){await check(db.from('pwd_lms_channels').delete().eq('course_id',id));await check(db.from('pwd_lms_courses').delete().eq('id',id));}
 for(const u of users)await check(db.auth.admin.deleteUser(u.id));
 if(guard)await sql('drop trigger if exists pwd_blp_qa_email_guard on public.pwd_lms_emails; drop function if exists public.pwd_blp_qa_email_guard();');
 console.log('Removed synthetic users, orders, conversations, admin role, temporary course and QA email guard.');
}
