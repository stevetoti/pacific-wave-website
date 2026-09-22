import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';
test('owner notifications are private, deduplicated, leased and environment-isolated',async()=>{const db=new PGlite();try{await db.exec('CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;');const sql=await readFile('supabase/migrations/20260918_owner_notifications.sql','utf8');await db.exec(sql);await db.exec(sql);await db.exec("INSERT INTO pwd_owner_notifications(event_key,subject,body,sandbox) VALUES('test-event','Test','Summary',true)");await assert.rejects(()=>db.exec("INSERT INTO pwd_owner_notifications(event_key,subject,body) VALUES('test-event','Duplicate','No')"));assert.equal((await db.query('SELECT * FROM pwd_claim_owner_notification(false)')).rows.length,0);assert.equal((await db.query('SELECT * FROM pwd_claim_owner_notification(true)')).rows.length,1);assert.equal((await db.query('SELECT * FROM pwd_claim_owner_notification(true)')).rows.length,0);await db.exec('SET ROLE authenticated');await assert.rejects(()=>db.query('SELECT * FROM pwd_owner_notifications'));await assert.rejects(()=>db.query('SELECT * FROM pwd_claim_owner_notification(true)'));}finally{await db.close();}});
import {sendOwnerNotifications,queueOwnerNotification} from '../src/lib/server/owner-notifications';
test('owner sender routes live to Steve, sandbox to test inbox and persists provider receipts',async()=>{
 const original=globalThis.fetch, old={...process.env};const requests:{url:string;body:Record<string,unknown>}[]=[];
 try{process.env.NEXT_PUBLIC_SUPABASE_URL='https://notification-tests.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test';process.env.RESEND_API_KEY='test';
 for(const live of [false,true]){let claimed=false;requests.length=0;process.env.VERCEL_ENV=live?'production':'preview';process.env.TRAINING_EMAIL_MODE='live';
 globalThis.fetch=async(input,init)=>{const url=String(input),body=init?.body?JSON.parse(String(init.body)):{};requests.push({url,body});let data:unknown=[];
 if(url.includes('/rpc/pwd_claim_owner_notification')){data=claimed?[]:[{id:'test-notification',subject:'New account',body:'Student: test@example.com',first_attempt_at:new Date().toISOString()}];claimed=true;}
 else if(url==='https://api.resend.com/emails')data={id:'provider-receipt'};
 return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});};
 await queueOwnerNotification('event','Subject','Safe account summary');await sendOwnerNotifications();
 const email=requests.find(r=>r.url==='https://api.resend.com/emails');assert.equal(email?.body.to,live?'steve@pacificwavedigital.com':'delivered@resend.dev');assert.ok(requests.some(r=>r.body.provider_id==='provider-receipt'));assert.ok(requests.some(r=>r.body.sandbox===!live));
 }
 }finally{globalThis.fetch=original;for(const key of ['NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','RESEND_API_KEY','VERCEL_ENV','TRAINING_EMAIL_MODE']){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}}
});
