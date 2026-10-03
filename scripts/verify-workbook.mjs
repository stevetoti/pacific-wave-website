import {createClient} from '@supabase/supabase-js';
import {chromium} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.WORKBOOK_QA_URL||'http://localhost:3104',url=process.env.NEXT_PUBLIC_SUPABASE_URL,ref=new URL(url).hostname.split('.')[0];
assert.equal(ref,'rndegttgwtpkbjtvjgnc');
const db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}),users=[],orders=[];let guard=false,browser;
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const sql=async query=>{const r=await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query})});if(!r.ok)throw Error(`SQL ${r.status}`);return r.json();};
const api=async(u,path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${u.session.access_token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};};
try{
 const course=await check(db.from('pwd_lms_courses').select('id').eq('slug','vanuatu-october-2026').single());
 for(const name of ['A','B','Outside']){
  const email=`workbook-qa-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;
  const {user}=await check(db.auth.admin.createUser({email,password,email_confirm:true}));users.push({...user,name});
  await check(db.from('pwd_lms_profiles').insert({user_id:user.id,full_name:`Workbook QA ${name}`,message_emails:false}));
  const auth=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});users.at(-1).session=(await check(auth.auth.signInWithPassword({email,password}))).session;
 }
 await sql(`create function public.pwd_workbook_qa_email_guard() returns trigger language plpgsql as $$ begin if exists(select 1 from public.pwd_lms_orders where id=new.order_id and user_id in ('${users[0].id}','${users[1].id}')) then return null; end if; return new; end $$;create trigger pwd_workbook_qa_email_guard before insert on public.pwd_lms_emails for each row execute function public.pwd_workbook_qa_email_guard();`);guard=true;
 for(const u of users.slice(0,2))orders.push(await check(db.from('pwd_lms_orders').insert({course_id:course.id,user_id:u.id,email:u.email,name:'Workbook QA',phone:'+6785550101',attendance:'online',amount:0,currency:'VUV',status:'granted',method:'grant'}).select('id').single()));
 const [a,b,out]=users,path=`/api/lms-workbook?course=${course.id}`;
 assert.equal((await fetch(base+path)).status,401);assert.equal((await api(out,path)).status,403);
 const payload={courseId:course.id,lessonKey:'lesson-01',revision:0,answers:{'l01-f01':'Private A café — 0','lesson-01-check-0':false}};
 assert.equal((await api(a,'/api/lms-workbook',payload)).status,200);
 assert.equal((await api(a,'/api/lms-workbook',payload)).status,409);
 assert.equal((await api(b,path+`&user_id=${a.id}`)).data.rows.length,0);
 assert.equal((await api(b,'/api/lms-workbook',{...payload,user_id:a.id})).status,400);
 const anonClient=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{global:{headers:{Authorization:`Bearer ${b.session.access_token}`}},auth:{persistSession:false}});
 assert.ok((await anonClient.from('pwd_lms_workbook_answers').select('*')).error);
 browser=await chromium.launch();
 for(const [label,width]of [['desktop',1440],['mobile',390]]){
  const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:`sb-${ref}-auth-token`,value:a.session});
  await page.goto(base+`/training-center/course/${course.id}`);await page.getByRole('button',{name:'Open workbook',exact:true}).click();
  await page.getByLabel('My customer, offer and location',{exact:true}).waitFor().catch(async e=>{await page.screenshot({path:'/tmp/workbook-load-failure.png',fullPage:true});console.log((await page.locator('body').innerText()).slice(0,6000));throw e;});
  const response=`${label}: Mi wantem statem bisnis. Café — 0`;
  await page.getByLabel('My customer, offer and location',{exact:true}).fill(response);
  await page.getByText('All changes saved',{exact:true}).waitFor();
  await page.reload();await page.getByRole('button',{name:'Open workbook',exact:true}).click();
  await page.getByLabel('My customer, offer and location',{exact:true}).waitFor();assert.equal(await page.getByLabel('My customer, offer and location',{exact:true}).inputValue(),response);
  await page.getByLabel('Choose a class',{exact:true}).selectOption('3');await page.getByRole('heading',{name:'Your Facebook Page and first advertisement',exact:true}).waitFor();
  await page.getByLabel('Ad copy and destination',{exact:true}).fill('My own business ad draft, no spend.');await page.getByText('All changes saved',{exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.getByRole('heading',{name:'Your Facebook Page and first advertisement',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/workbook-${label}.png`});
  await page.getByLabel('Ad copy and destination',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/workbook-fields-${label}.png`});
  // A real save failure must preserve text and offer recovery.
  await page.route('**/api/lms-workbook',route=>route.request().method()==='POST'?route.fulfill({status:503,json:{error:'Simulated save failure'}}):route.continue());
  await page.getByLabel('Ad copy and destination',{exact:true}).fill('Keep my unsaved draft');await page.getByText('Simulated save failure',{exact:true}).waitFor();assert.equal(await page.getByLabel('Ad copy and destination',{exact:true}).inputValue(),'Keep my unsaved draft');
  await page.unroute('**/api/lms-workbook');await page.getByRole('button',{name:'Retry save',exact:true}).click();await page.getByText('All changes saved',{exact:true}).waitFor();
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download workbook with my answers',exact:true}).click()]);await download.saveAs(`/tmp/workbook-completed-${label}.pdf`);
  assert.deepEqual(errors,[]);await context.close();
 }
 // Revoke and verify both read and export gates; no real student records are touched.
 await check(db.from('pwd_lms_orders').update({status:'revoked'}).eq('id',orders[0].id));
 assert.equal((await api(a,path)).status,403);assert.equal((await api(a,'/api/lms-workbook',{...payload,revision:2})).status,403);
 assert.equal((await fetch(base+path+'&pdf=completed',{headers:{Authorization:`Bearer ${a.session.access_token}`}})).status,403);
 console.log('PASS: real auth/enrolment, private persistence, stale conflict, forged identity denial, RLS, desktop/mobile save/reload, save-failure recovery, PDF downloads and revoked access.');
}finally{
 if(browser)await browser.close();
 for(const o of orders){await check(db.from('pwd_lms_emails').delete().eq('order_id',o.id));await check(db.from('pwd_lms_orders').delete().eq('id',o.id));}
 for(const u of users){await check(db.from('pwd_lms_audit').delete().eq('actor_id',u.id));await check(db.auth.admin.deleteUser(u.id));}
 if(guard)await sql('drop trigger if exists pwd_workbook_qa_email_guard on public.pwd_lms_emails;drop function if exists public.pwd_workbook_qa_email_guard();');
 console.log('Removed temporary QA accounts, enrolments, answers and email guard.');
}
