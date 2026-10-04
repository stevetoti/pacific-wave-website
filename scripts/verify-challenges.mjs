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
 const challenge={course_id:c.id,title:'Week 1 · Your first affiliate income',description:'Earn your first genuine affiliate income. The earliest verified commission wins. Self-referrals and refunded sales are excluded.',proof_instructions:'Share a redacted receipt, earning date, platform and transaction reference.',prize:'VT 2,000 + 1 extra month of Digi Assist Pro',max_winners:1,opens_at:ago(72),closes_at:ago(-24),published:true};
 assert.equal((await api(teacher,{action:'save',challenge})).status,403);
 assert.equal((await api(admin,{action:'save',challenge})).status,200);
 await api(admin,{action:'save',challenge:{...challenge,title:'Hidden draft',published:false}});
 let records=await check(db.from('pwd_lms_challenges').select('*').eq('course_id',c.id));const ch=records.find(x=>x.published);
 assert.equal((await api(null,null,'?course='+c.id)).status,401);
 assert.equal((await api(outside,null,'?course='+c.id)).status,403);
 assert.equal((await api(teacher,null,'?manage=1&course='+other.id)).status,403);
 assert.equal((await api(a,null,'?course='+c.id)).data.challenges.length,1);
 assert.equal((await api(admin,{action:'save',challenge:{...challenge,id:ch.id,prize:'Changed rules'}})).status,409);
 const proof={challenge_id:ch.id,evidence:'First legitimate customer commission with redacted transaction proof.',evidence_url:'https://example.com/redacted-proof',achieved_at:ago(2)};
 assert.equal((await api(a,{action:'submit',claim:{...proof,achieved_at:ago(-2)}})).status,400);
 assert.equal((await api(a,{action:'submit',claim:{...proof,evidence_url:'javascript:alert(1)'}})).status,400);
 browser=await chromium.launch({headless:true});
 for(const [name,options]of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',devices['iPhone 13']]]){const ctx=await browser.newContext(options);await ctx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),a.session);const page=await ctx.newPage();await page.goto(base+'/training-center/course/'+c.id+'?view=challenges');await page.getByRole('heading',{name:challenge.title,exact:true}).waitFor();await page.getByRole('button',{name:'Submit my achievement'}).click();await page.getByLabel('When did you achieve it? (Vanuatu time)').fill(new Date(Date.parse(proof.achieved_at)+11*3600000).toISOString().slice(0,16));await page.getByLabel('Your achievement and proof').fill(proof.evidence);await page.getByLabel('Private proof or live page link (HTTPS)').fill(proof.evidence_url);await page.locator('input[type=checkbox]').check();await page.getByRole('heading',{name:challenge.title,exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/pwd-challenges-'+name+'.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(name==='mobile'){await page.getByRole('button',{name:'Send proof for review'}).click();await page.getByText('Proof under review',{exact:true}).waitFor();await page.reload();await page.getByText('Proof under review',{exact:true}).waitFor();}await ctx.close();}
 assert.equal((await api(a,{action:'submit',claim:proof})).status,409);
 assert.equal((await api(b,{action:'submit',claim:{...proof,achieved_at:ago(3)}})).status,200);
 const mine=(await api(a,null,'?course='+c.id)).data.claims;assert.equal(mine.length,1);assert.equal(mine[0].user_id,a.id);
 console.log('Student desktop/mobile submission and API privacy checks passed.');
 const review=(await api(teacher,null,'?manage=1&course='+c.id)).data;assert.equal(review.claims.length,2);
 const ac=review.claims.find(x=>x.user_id===a.id),bc=review.claims.find(x=>x.user_id===b.id);
 const adminCtx=await browser.newContext({viewport:{width:1440,height:1000}});await adminCtx.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),admin.session);const adminPage=await adminCtx.newPage();await adminPage.goto(base+'/admin/training-center');await adminPage.getByRole('button',{name:'Challenges',exact:true}).click();const manager=adminPage.getByRole('heading',{name:'Challenges & prizes',exact:true}).locator('..');await manager.getByLabel('Challenge course',{exact:true}).selectOption(c.id);await manager.getByText('Challenge QA StudentA',{exact:false}).first().waitFor();await manager.getByRole('button',{name:'Create a challenge',exact:true}).click();await manager.getByLabel('Title',{exact:true}).fill('Admin UI draft challenge');await manager.getByLabel('Challenge rules').fill('Publish a useful business page during the challenge window.');await manager.getByLabel('Proof required').fill('Share a live page URL and launch date.');await manager.getByLabel('Prize (include exact amount and currency for cash)').fill('1 extra month of Digi Assist Pro');await manager.getByLabel('Opens (Vanuatu time)').fill('2026-10-19T00:00');await manager.getByLabel('Closes (Vanuatu time)').fill('2026-10-26T00:00');await manager.getByRole('button',{name:'Save challenge',exact:true}).click();await manager.getByRole('heading',{name:'Admin UI draft challenge',exact:true}).waitFor();await adminPage.screenshot({path:'/private/tmp/pwd-challenges-admin.png'});await adminCtx.close();

 console.log('Admin draft creation passed.');
 const action=(id,status)=>({action:'review',id,status,note:'QA evidence checked; no real reward issued.'});
 assert.equal((await api(a,action(ac.id,'winner'))).status,403);
 assert.equal((await api(teacher,action(ac.id,'verified'))).status,200);
 assert.equal((await api(admin,action(ac.id,'winner'))).status,409);
 await check(db.from('pwd_lms_challenges').update({closes_at:ago(1)}).eq('id',ch.id));
 assert.equal((await api(admin,action(ac.id,'winner'))).status,409); // pending proof must be reviewed
 assert.equal((await api(teacher,action(bc.id,'verified'))).status,200);
 assert.equal((await api(teacher,action(bc.id,'winner'))).status,403);
 assert.equal((await api(admin,action(ac.id,'winner'))).status,409); // earlier verified earning wins
 const race=await Promise.all([api(admin,action(bc.id,'winner')),api(admin,action(bc.id,'winner'))]);assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);
 assert.equal((await api(admin,action(ac.id,'winner'))).status,409); // capacity
 assert.equal((await api(admin,action(bc.id,'delivered'))).status,200);
 assert.equal((await api(admin,action(bc.id,'rejected'))).status,409);
 assert.equal((await api(b,null,'?course='+c.id)).data.claims[0].status,'delivered');
 await check(db.from('pwd_lms_orders').update({status:'revoked'}).eq('course_id',c.id).eq('user_id',a.id));
 assert.equal((await api(a,null,'?course='+c.id)).status,403);
 const anon=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_ANON_KEY);assert.ok((await anon.from('pwd_lms_challenge_claims').select('*')).error);
 console.log('PASS: private evidence, draft filtering, enrolment/revocation, instructor scope, admin-only prizes, deadlines, duplicate claims, chronological awards, concurrency/capacity, delivery, desktop/mobile submission and reload.');
}finally{if(browser)await browser.close();for(const c of courses){await check(db.from('pwd_lms_orders').delete().eq('course_id',c.id));await check(db.from('pwd_lms_challenges').delete().eq('course_id',c.id));await check(db.from('pwd_lms_channels').delete().eq('course_id',c.id));await check(db.from('pwd_lms_courses').delete().eq('id',c.id));}for(const u of users){await check(db.from('admin_users').delete().eq('email',u.email));await check(db.auth.admin.deleteUser(u.id));}console.log('Challenge QA accounts, courses and submissions cleaned.');}
