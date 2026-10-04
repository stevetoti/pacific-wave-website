import {createClient} from '@supabase/supabase-js';
import nextEnv from '@next/env';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';
nextEnv.loadEnvConfig(process.cwd());
const base=process.env.CHALLENGE_TEST_URL||'http://127.0.0.1:3147',env=process.env;
const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const users=[],courses=[];let browser;
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
async function sql(query){const r=await fetch('https://api.supabase.com/v1/projects/rndegttgwtpkbjtvjgnc/database/query',{method:'POST',headers:{Authorization:'Bearer '+env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query})});if(!r.ok)throw Error(await r.text());return r.json();}
async function api(u,body,query=''){const r=await fetch(base+'/api/lms-challenges'+query,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+(u?.session.access_token||''),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
const ago=hours=>new Date(Date.now()-hours*3600000).toISOString();
try{
 for(const name of ['StudentA','StudentB','Outsider','Teacher','Admin']){const email='challenge-qa-'+randomUUID()+'@example.com',password='Qa-'+randomUUID()+'!';const {user}=await check(db.auth.admin.createUser({email,password,email_confirm:true}));users.push({...user,name});const auth=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});users.at(-1).session=(await check(auth.auth.signInWithPassword({email,password}))).session;}
 console.log('Temporary users ready.');
 const [a,b,outside,teacher,admin]=users;
 await check(db.from('admin_users').insert({email:admin.email,name:'Challenge QA Admin',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
 for(let i=0;i<2;i++)courses.push(await check(db.from('pwd_lms_courses').insert({slug:'challenge-qa-'+randomUUID(),title:'Challenge QA course',kind:'live',amount:0,currency:'VUV',published:false,is_private:true,requires_approval:true}).select().single()));
 const c=courses[0],other=courses[1];
 await check(db.from('pwd_lms_course_instructors').insert({course_id:c.id,user_id:teacher.id}));
 for(const u of [a,b]){const oid=randomUUID();await sql(`begin;insert into public.pwd_lms_orders(id,user_id,course_id,email,name,phone,attendance,amount,currency,status,method) values('${oid}','${u.id}','${c.id}','${u.email}','Challenge QA ${u.name}','+6785550101','online',0,'VUV','granted','grant');delete from public.pwd_lms_emails where order_id='${oid}';commit;`);}

 const challenge={course_id:c.id,selection_mode:'participation',title:'Week 1 · Participation Champion',description:'Participate thoughtfully through live classes, written discussion or recording reflections. One participation award per student per course.',proof_instructions:'Share your practical activity, useful contributions, recording reflections and help for classmates.',prize:'1 free month of Storian AI',max_winners:1,opens_at:ago(72),closes_at:ago(-24),published:true};
 for(const title of [challenge.title,'Week 2 · Participation Champion','Week 3 · Participation Champion'])assert.equal((await api(admin,{action:'save',challenge:{...challenge,title}})).status,200);
 const records=await check(db.from('pwd_lms_challenges').select('*').eq('course_id',c.id).order('title'));const [ch,next,third]=records;
 browser=await chromium.launch({headless:true});
 for(const [name,options]of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',devices['iPhone 13']]]){const ctx=await browser.newContext(options);await ctx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),a.session);const page=await ctx.newPage();await page.goto(base+'/training-center/course/'+c.id+'?view=challenges');await page.getByRole('heading',{name:challenge.title,exact:true}).waitFor();const card=page.getByRole('heading',{name:challenge.title,exact:true}).locator('..');await card.getByRole('button',{name:'Submit my weekly reflection'}).click();assert.equal(await card.locator('input[type=datetime-local]').count(),0);await card.getByLabel('Your weekly reflection and examples').fill('I completed all three class reflections, built my page, shared a useful question and helped a classmate improve their offer.');await card.locator('input[type=checkbox]').check();await card.screenshot({path:'/private/tmp/pwd-participation-'+name+'.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(name==='mobile'){await card.getByRole('button',{name:'Send proof for review'}).click();await card.getByText('Proof under review',{exact:true}).waitFor();}await ctx.close();}
 const proof={evidence:'I completed the weekly work and supported classmates with practical and useful advice.',evidence_url:'',achieved_at:ago(2)};
 assert.equal((await api(b,{action:'submit',claim:{...proof,challenge_id:ch.id}})).status,200);
 for(const u of [a,b])assert.equal((await api(u,{action:'submit',claim:{...proof,challenge_id:next.id}})).status,200);
 let claims=(await api(teacher,null,'?manage=1&course='+c.id)).data.claims;
 const ca=claims.find(r=>r.challenge_id===ch.id&&r.user_id===a.id),cb=claims.find(r=>r.challenge_id===ch.id&&r.user_id===b.id),na=claims.find(r=>r.challenge_id===next.id&&r.user_id===a.id),nb=claims.find(r=>r.challenge_id===next.id&&r.user_id===b.id);
 const action=(id,status,scores,note='QA rubric review')=>({action:'review',id,status,note,scores});
 assert.equal((await api(teacher,action(ca.id,'verified'))).status,409);
 assert.equal((await api(teacher,action(ca.id,'verified',[6,0,0,0]))).status,400);
 for(const r of [ca,cb])assert.equal((await api(teacher,action(r.id,'verified',[0,0,0,0]))).status,200);
 await check(db.from('pwd_lms_challenges').update({closes_at:ago(1)}).in('id',[ch.id,next.id]));
 assert.equal((await api(admin,action(ca.id,'winner'))).status,409);
 assert.equal((await api(teacher,action(ca.id,'verified',[3,4,3,3]))).status,200);
 assert.equal((await api(teacher,action(cb.id,'verified',[4,5,5,5]))).status,200);
 assert.equal((await api(admin,action(ca.id,'winner'))).status,409);
 // Score via actual staff UI, not only the API.
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}});await ctx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),admin.session);const page=await ctx.newPage();await page.goto(base+'/admin/training-center');await page.getByRole('button',{name:'Challenges',exact:true}).click();await page.getByLabel('Challenge course',{exact:true}).selectOption(c.id);const card=page.getByRole('heading',{name:challenge.title,exact:true}).locator('..');const form=card.locator('form').filter({has:page.getByRole('heading',{name:/Challenge QA StudentA/})});const fields=form.locator('input[type=number]');for(let i=0;i<4;i++)await fields.nth(i).fill(String([5,5,5,4][i]));await form.getByLabel('Note visible to student').fill('Rubric checked against weekly practical work and contributions.');await form.getByRole('button',{name:'Save decision'}).click();await form.getByText('Verified score: 19 / 20',{exact:true}).waitFor();await form.screenshot({path:'/private/tmp/pwd-participation-admin.png'});await ctx.close();
 assert.equal((await api(admin,action(ca.id,'winner',undefined,'Tied'))).status,409);
 assert.equal((await api(admin,action(ca.id,'winner',undefined,'Exact tie resolved after reviewing both projects: this reflection showed stronger practical application and supported improvement.'))).status,200);
 for(const [r,scores]of [[na,[5,5,5,5]],[nb,[3,3,3,3]]])assert.equal((await api(teacher,action(r.id,'verified',scores))).status,200);
 assert.equal((await api(admin,action(na.id,'winner'))).status,409);
 assert.equal((await api(admin,action(nb.id,'winner'))).status,200); // higher score is ineligible after prior win
 assert.equal((await api(a,{action:'submit',claim:{...proof,challenge_id:third.id}})).status,409);
 const mine=(await api(a,null,'?course='+c.id)).data.claims;assert.deepEqual(mine.find(r=>r.id===ca.id).scores,[5,5,5,4]);assert.ok(mine.every(r=>r.user_id===a.id));
 // Existing first-achievement competitions remain chronological and independent of participation wins.
 assert.equal((await api(admin,{action:'save',challenge:{...challenge,title:'First-achievement regression',selection_mode:'first'}})).status,200);
 const first=await check(db.from('pwd_lms_challenges').select('*').eq('course_id',c.id).eq('title','First-achievement regression').single());
 for(const [u,h]of [[a,3],[b,2]])assert.equal((await api(u,{action:'submit',claim:{...proof,challenge_id:first.id,achieved_at:ago(h)}})).status,200);
 const firstClaims=await check(db.from('pwd_lms_challenge_claims').select('*').eq('challenge_id',first.id));
 for(const r of firstClaims)assert.equal((await api(teacher,action(r.id,'verified'))).status,200);
 await check(db.from('pwd_lms_challenges').update({closes_at:ago(1)}).eq('id',first.id));
 assert.equal((await api(admin,action(firstClaims.find(r=>r.user_id===b.id).id,'winner'))).status,409);
 assert.equal((await api(admin,action(firstClaims.find(r=>r.user_id===a.id).id,'winner'))).status,200);
 console.log('PASS: participation reflection desktop/mobile, real staff rubric scoring, score bounds, positive score, highest eligible score, explained exact ties, private feedback and one participation win per course.');
}finally{if(browser)await browser.close();for(const c of courses){await check(db.from('pwd_lms_orders').delete().eq('course_id',c.id));await check(db.from('pwd_lms_challenges').delete().eq('course_id',c.id));await check(db.from('pwd_lms_channels').delete().eq('course_id',c.id));await check(db.from('pwd_lms_courses').delete().eq('id',c.id));}for(const u of users){await check(db.from('admin_users').delete().eq('email',u.email));await check(db.auth.admin.deleteUser(u.id));}console.log('Challenge QA accounts, courses and submissions cleaned.');}
