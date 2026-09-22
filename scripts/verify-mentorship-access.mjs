import {createClient} from '@supabase/supabase-js';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;};
const users=[],orders=[];let recordingPath;
async function api(action,token,body){const r=await fetch(`http://localhost:3100/api/lms/${action}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
try {
 const course=await check(db.from('pwd_lms_courses').select('*').eq('slug','one-on-one-mentorship').single());
 for(let i=0;i<2;i++){
  const email=`mentorship-qa-${randomUUID()}@example.com`,password=`QA-${randomUUID()}!`;
  const u=await check(db.auth.admin.createUser({email,password,email_confirm:true}));users.push({id:u.user.id,email});
  const client=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
  const auth=await check(client.auth.signInWithPassword({email,password}));users[i].token=auth.session.access_token;users[i].client=client;
  const order=await check(db.from('pwd_lms_orders').insert({course_id:course.id,user_id:u.user.id,name:'Mentorship QA',email,phone:'1234567',amount:25000,currency:'VUV',status:'paid'}).select().single());orders.push(order.id);
  // Direct fixture insertion only: never dispatch transactional emails during this test.
  await check(db.from('pwd_lms_emails').delete().eq('order_id',order.id));
 }
 const journey=await api(`course?id=${course.id}`,users[0].token);
 assert.equal(journey.status,200);assert.equal(journey.data.lessons.length,3);
 assert.ok(journey.data.lessons.every(l=>l.order_id===orders[0]));
 const lesson=journey.data.lessons[0];
 await check(db.from('admin_users').insert({email:users[1].email,name:'Mentorship QA admin',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
 assert.equal((await api('admin',users[0].token,{action:'recording_upload',order_id:orders[0],extension:'mp4'})).status,403);
 const upload=await api('admin',users[1].token,{action:'recording_upload',order_id:orders[0],extension:'mp4'});assert.equal(upload.status,200);recordingPath=upload.data.path;
 await check(users[1].client.storage.from('pwd-mentorship-recordings').uploadToSignedUrl(recordingPath,upload.data.token,await readFile('/tmp/pwd-private-test.mp4'),{contentType:'video/mp4'}));
 await check(db.from('pwd_lms_lessons').update({published:true,content:'QA private project notes',recording_path:recordingPath}).eq('id',lesson.id));
 assert.equal((await api(`recording?id=${lesson.id}`,users[1].token)).status,403);
 assert.equal((await api('progress',users[1].token,{lesson_id:lesson.id,answers:[]})).status,403);
 const own=await api(`recording?id=${lesson.id}`,users[0].token);assert.equal(own.status,200);assert.equal((await fetch(own.data.url)).status,200);
 const raw=await users[0].client.storage.from('pwd-mentorship-recordings').download(recordingPath);assert.ok(raw.error,'Direct storage access must be blocked');
 const other=await api(`course?id=${course.id}`,users[1].token);assert.ok(other.data.lessons.every(l=>l.order_id===orders[1]));assert.ok(!JSON.stringify(other.data).includes('QA private project notes'));
 await check(db.from('pwd_lms_orders').update({status:'refunded'}).eq('id',orders[0]));assert.equal((await api(`recording?id=${lesson.id}`,users[0].token)).status,403);
 console.log('PASS: three personal placeholders; admin-only signed upload; student-owned playback; cross-student recording and progress denied; direct storage denied; refunded access denied.');
} finally {
 if(recordingPath)await check(db.storage.from('pwd-mentorship-recordings').remove([recordingPath]));
 for(const id of orders){await check(db.from('pwd_lms_emails').delete().eq('order_id',id));await check(db.from('pwd_lms_lessons').delete().eq('order_id',id));await check(db.from('pwd_lms_orders').delete().eq('id',id));}
 for(const u of users){await check(db.from('admin_users').delete().eq('email',u.email));await check(db.auth.admin.deleteUser(u.id));}
 console.log('Synthetic enrolments, lessons, recording and accounts cleaned up. No email or payment sent.');
}
