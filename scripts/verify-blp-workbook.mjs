import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {chromium,expect} from '@playwright/test';
import {PDFDocument} from 'pdf-lib';
const base=process.env.BLP_WORKBOOK_TEST_URL||'http://127.0.0.1:3107';
const dir='.deployment/blp-workbook-evidence';await fs.mkdir(dir,{recursive:true});
const dbUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;assert.equal(new URL(dbUrl).hostname,'rndegttgwtpkbjtvjgnc.supabase.co');
const db=createClient(dbUrl,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const checked=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const sql=async query=>{const r=await fetch('https://api.supabase.com/v1/projects/rndegttgwtpkbjtvjgnc/database/query',{method:'POST',headers:{Authorization:`Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({query})});if(!r.ok)throw Error(`Fixture SQL failed ${r.status}`);return r.json();};
const stateFile=process.env.BLP_WORKBOOK_STORAGE_STATE;const state=stateFile?JSON.parse(await fs.readFile(stateFile,'utf8')):{cookies:[],origins:[]};
const headers=state.cookies.length?{Cookie:state.cookies.map(c=>`${c.name}=${c.value}`).join('; ')}:{};
async function request(path,session,body){return fetch(base+path,{method:body?'POST':'GET',headers:{...headers,...(session?{Authorization:`Bearer ${session.access_token}`} :{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});}
async function api(path,session,body){const r=await request(path,session,body);return {status:r.status,data:await r.json()};}
const users=[],orders=[],report=[],stamp=randomUUID().slice(0,8);let browser,blp,oct;
try{
 blp=await checked(db.from('pwd_lms_courses').select('id,slug').eq('slug','blp-digital-skills-workshop').single());
 oct=await checked(db.from('pwd_lms_courses').select('id,slug').eq('slug','vanuatu-october-2026').single());
 const sessions=[];
 for(const role of ['A','B','Pending','Teacher','OtherTeacher']){
  const email=`qa-blp-workbook-${role.toLowerCase()}-${stamp}@example.test`,password=randomUUID()+'Aa1!';
  const {user}=await checked(db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:`Workbook QA ${role}`}}));users.push(user.id);
  const auth=createClient(dbUrl,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  sessions.push((await checked(auth.auth.signInWithPassword({email,password}))).session);
 }
 const [a,b,pending,teacher,otherTeacher]=sessions;
 await checked(db.from('pwd_lms_course_instructors').insert([{course_id:blp.id,user_id:teacher.user.id},{course_id:oct.id,user_id:otherTeacher.user.id}]));
 const values=[];
 for(const [s,c,status] of [[a,blp,'paid'],[b,blp,'granted'],[pending,blp,'pending'],[a,oct,'paid']]){const id=randomUUID();orders.push(id);values.push(`('${id}','${s.user.id}','${c.id}','${s.user.email}','Workbook QA ${s===a?'A':s===b?'B':'Pending'}','',0,'VUV','${status}','grant')`);}
 await sql(`begin;select set_config('pwd_lms.suppress_status_email','on',true);insert into public.pwd_lms_orders(id,user_id,course_id,email,name,phone,amount,currency,status,method) values ${values.join(',')};commit;`);
 const path=`/api/lms-workbook?course=${blp.id}`,review=`/api/lms-workbook/review?course=${blp.id}`;
 const body={courseId:blp.id,lessonKey:'blp-e1',revision:0,answers:{'blp-e1-f01':'A private saved business'}};
 assert.equal((await api(path,null)).status,401);
 for(const suffix of ['', '&pdf=blank','&pdf=completed'])assert.equal((await request(path+suffix,pending)).status,403);
 assert.equal((await api('/api/lms-workbook',pending,body)).status,403);
 assert.equal((await api(review,a)).status,403);assert.equal((await api(review,otherTeacher)).status,403);
 assert.equal((await api('/api/lms-workbook',a,body)).status,200);
 assert.equal((await api('/api/lms-workbook',a,body)).status,409);
 assert.equal((await api('/api/lms-workbook',a,{...body,revision:1,user_id:b.user.id})).status,400);
 assert.equal((await api('/api/lms-workbook',a,{...body,courseId:oct.id})).status,400);
 assert.deepEqual((await api(path+`&user_id=${a.user.id}`,b)).data.rows,[]);
 await api('/api/lms-workbook',b,{...body,answers:{'blp-e1-f01':'B private sentinel'}});
 await api('/api/lms-workbook',a,{courseId:oct.id,lessonKey:'lesson-01',revision:0,answers:{'l01-f01':'October private sentinel'}});
 for(let i=2;i<=6;i++)assert.equal((await api('/api/lms-workbook',a,{courseId:blp.id,lessonKey:`blp-e${i}`,revision:0,answers:{[`blp-e${i}-f01`]:`Exercise E${i} saved. Café — VT0`}})).status,200);
 const reviewed=await api(review+`&student=${a.user.id}`,teacher);assert.equal(reviewed.status,200);assert.equal(reviewed.data.rows.length,6);
 assert.doesNotMatch(JSON.stringify(reviewed.data),/B private sentinel|October private sentinel/);
 assert.equal((await api(review+`&student=${pending.user.id}`,teacher)).status,403);
 const anon=createClient(dbUrl,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});assert.ok((await anon.from('pwd_lms_workbook_answers').select('*')).error);
 const context=await api(`/api/lms-coach?course=${blp.id}`,a);assert.equal(context.status,200);assert.match(JSON.stringify(context.data.context.workbook),/A private saved business/);assert.doesNotMatch(JSON.stringify(context.data.context.workbook),/B private sentinel|October private sentinel/);assert.equal(context.data.context.learning_location.city,'Port Vila');assert.equal(context.data.context.learning_location.country,'Vanuatu');
 report.push('PASS verified-course access, pending/anonymous denial, six exercise writes, stale-write conflict, student/course isolation, assigned teacher review and own tutor context/location');
 for(const kind of ['blank','completed']){const r=await request(path+`&pdf=${kind}`,a);assert.equal(r.status,200);const bytes=new Uint8Array(await r.arrayBuffer());const pdf=await PDFDocument.load(bytes);assert.ok(kind==='blank'?pdf.getPageCount()===24:pdf.getPageCount()>24);await fs.writeFile(`${dir}/${kind}-export.pdf`,bytes);}
 for(const kind of ['workbook','outline','guide']){const r=await request(`/api/lms-workshop-resources?course=${blp.id}&resource=${kind}`,a);assert.equal(r.status,200,`resource ${kind}`);assert.match(r.headers.get('content-type'),/pdf/);}
 report.push('PASS authorised blank/completed PDF exports and all three v5 course resources');
 console.log('API and PDF checks passed; checking browser flows');browser=await chromium.launch({channel:'chrome'});
 const errors=[];
 for(const [index,viewport] of [{width:1440,height:1000},{width:390,height:844}].entries()){
  const ctx=await browser.newContext({viewport,storageState:state});
  await ctx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),a);
  ctx.setDefaultTimeout(20000);const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*google-analytics.com/**',r=>r.abort());await page.route('**/*googletagmanager.com/**',r=>r.abort());
  await page.goto(base+`/training-center/course/${blp.id}`);await page.getByRole('button',{name:'Open participant workbook',exact:true}).click();
  const picker=page.getByLabel('Choose a workbook section');await picker.selectOption('1');
  const field=page.locator('#blp-e1-f01'),value=`${index?'Mobile':'Desktop'} persistence ${stamp}`;
  console.log(`Checking ${index?'mobile':'desktop'} workbook`);await field.fill(value);await expect(page.getByText('All changes saved',{exact:true})).toBeVisible({timeout:20000});
  await picker.selectOption('3');await expect(page.locator('#blp-e3-f01')).toHaveValue('Exercise E3 saved. Café — VT0');await picker.selectOption('1');await expect(field).toHaveValue(value);
  await page.reload();await page.getByRole('button',{name:'Open participant workbook',exact:true}).click();await picker.selectOption('1');await expect(field).toHaveValue(value);
  // Failed save must retain the student's input, then retry without overwriting it.
  await page.route('**/api/lms-workbook',r=>r.request().method()==='POST'?r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic save interruption'})}):r.continue());
  await field.fill(value+' retry');await expect(page.getByText('Synthetic save interruption',{exact:true})).toBeVisible({timeout:15000});await expect(field).toHaveValue(value+' retry');
  await page.unroute('**/api/lms-workbook');await page.getByRole('button',{name:'Retry save',exact:true}).click();await expect(page.getByText('All changes saved',{exact:true})).toBeVisible();
  await page.getByLabel('Course language',{exact:true}).selectOption('bi');await expect(field).toHaveValue(value+' retry');await page.getByLabel('Course language',{exact:true}).selectOption('en');
  await page.goto(base+'/training-center/dashboard');await page.goto(base+`/training-center/course/${blp.id}`);await page.getByRole('button',{name:'Open participant workbook',exact:true}).click();await picker.selectOption('1');await expect(field).toHaveValue(value+' retry');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${dir}/${index?'mobile':'desktop'}-saved.png`,fullPage:true});await page.locator('[aria-label="Interactive participant workbook"]').screenshot({path:`${dir}/${index?'mobile':'desktop'}-workbook.png`});
  const fresh=await api(`/api/lms-coach?course=${blp.id}`,a);assert.match(JSON.stringify(fresh.data.context.workbook),new RegExp(value+' retry'));
  report.push(`PASS ${index?'mobile':'desktop'} actual student typing/autosave, section navigation, reload persistence, failed-save recovery, no horizontal overflow and refreshed tutor entries`);
  await ctx.close();
 }
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},storageState:state});await ctx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),teacher);
 ctx.setDefaultTimeout(20000);const page=await ctx.newPage();await page.goto(base+'/training-center/teach');await page.getByRole('button',{name:'Workbooks',exact:true}).click();await page.getByLabel('Workbook participant').selectOption(a.user.id);await page.getByLabel('Workbook class').selectOption('1');await expect(page.getByText(`Mobile persistence ${stamp} retry`,{exact:true})).toBeVisible();assert.equal(await page.locator('textarea').count(),0);await page.getByLabel('Workbook participant').selectOption(b.user.id);await expect(page.getByText('B private sentinel',{exact:true})).toBeVisible();await expect(page.getByText(`Mobile persistence ${stamp} retry`,{exact:true})).toHaveCount(0);await page.screenshot({path:dir+'/teacher-read-only.png',fullPage:true});await ctx.close();
 report.push('PASS actual assigned instructor read-only review and participant switching');
 assert.deepEqual(errors,[]);assert.equal((await checked(db.from('pwd_lms_emails').select('id').in('order_id',orders))).length,0);
 report.push('PASS no browser runtime exceptions and no fixture notification emails queued');
}finally{
 await browser?.close();
 if(users.length){await checked(db.from('pwd_lms_workbook_answers').delete().in('user_id',users));await checked(db.from('pwd_lms_course_instructors').delete().in('user_id',users));}
 if(orders.length){await checked(db.from('pwd_lms_emails').delete().in('order_id',orders));await checked(db.from('pwd_lms_orders').delete().in('id',orders));}
 for(const id of users)await checked(db.auth.admin.deleteUser(id));
 await fs.writeFile(`${dir}/${new URL(base).hostname}-acceptance.json`,JSON.stringify({base,report,synthetic_data_cleaned:true,timestamp:new Date().toISOString()},null,2));
}
console.log(JSON.stringify({base,report,synthetic_data_cleaned:true},null,2));
