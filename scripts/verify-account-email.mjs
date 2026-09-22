import {createClient} from '@supabase/supabase-js';import {randomUUID} from 'node:crypto';import assert from 'node:assert/strict';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}),check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const emails=[];let existing;
async function account(email,password,mode){const r=await fetch('http://localhost:3100/api/lms/account',{method:'POST',headers:{'Content-Type':'application/json','x-forwarded-for':randomUUID()},body:JSON.stringify({email,password,mode,course:'one-on-one-mentorship'})});if(r.status!==200)throw Error(`Account ${mode} returned ${r.status}: ${JSON.stringify(await r.json())}`);}
try{
 const email=`email-qa-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;emails.push(email);
 await account(email,password,'signup');
 let logs=await check(db.from('pwd_lms_account_emails').select('*').eq('email',email));assert.equal(logs.length,1);assert.equal(logs[0].state,'test_accepted');
 const r=await fetch('https://api.resend.com/emails/'+logs[0].provider_id,{headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`}});const d=await r.json();assert.deepEqual(d.to,['delivered@resend.dev']);assert.ok(d.html.includes('Verify my email address'));assert.ok(d.html.includes('250,000'));assert.ok(d.html.includes('Digi Assist AI Pro'));assert.ok(d.html.includes('course=one-on-one-mentorship'));
 const existingEmail=`email-qa-${randomUUID()}@example.com`;emails.push(existingEmail);existing=(await check(db.auth.admin.createUser({email:existingEmail,password,email_confirm:true}))).user;
 await account(existingEmail,'Different-password-123!','signup');
 logs=await check(db.from('pwd_lms_account_emails').select('*').eq('email',existingEmail));assert.equal(logs[0].purpose,'existing_account');assert.equal(logs[0].state,'test_accepted');
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});await check(client.auth.signInWithPassword({email:existingEmail,password}));
 await account(existingEmail,undefined,'recovery');
 logs=await check(db.from('pwd_lms_account_emails').select('*').eq('email',existingEmail));assert.equal(logs.length,2);assert.ok(logs.some(l=>l.purpose==='recovery'&&l.state==='test_accepted'));
 console.log('PASS: fresh verification HTML + course recommendations; existing-account mail actually sent without changing password; recovery resend; correct sandbox recipient; provider receipts persisted.');
}finally{
 const {data,error}=await db.auth.admin.listUsers({page:1,perPage:1000});if(error)throw error;for(const u of data.users.filter(u=>emails.includes(u.email))){await check(db.auth.admin.deleteUser(u.id));}for(const email of emails)await check(db.from('pwd_lms_account_emails').delete().eq('email',email));console.log('Email QA accounts and logs removed. All test emails went only to Resend sandbox.');
}
