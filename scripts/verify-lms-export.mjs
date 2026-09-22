import {createClient} from '@supabase/supabase-js';import {randomUUID} from 'node:crypto';import assert from 'node:assert/strict';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,db=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}),check=async p=>{const r=await p;if(r.error)throw r.error;return r.data;},users=[];let course;
try {
 for(let i=0;i<2;i++){const email=`export-qa-${randomUUID()}@example.com`,password=randomUUID()+'Ab1!';const {user}=await check(db.auth.admin.createUser({email,password,email_confirm:true}));users.push(user);const c=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});user.token=(await check(c.auth.signInWithPassword({email,password}))).session.access_token;}
 await check(db.from('admin_users').insert({email:users[1].email,name:'Export QA admin',role:'admin',site_id:'pacific-wave-digital',is_active:true}));
 course=await check(db.from('pwd_lms_courses').insert({slug:`export-qa-${randomUUID()}`,title:'Export QA course',kind:'live',amount:100,currency:'VUV',published:false}).select().single());
 await check(db.from('pwd_lms_orders').insert({user_id:users[0].id,course_id:course.id,email:users[0].email,name:'=Unsafe, "Name"',phone:'+6785550101',amount:100,currency:'VUV',status:'pending'}));
 const get=(token,extra='')=>fetch(`http://localhost:3100/api/lms/students_export?course=${course.id}${extra}`,{headers:{Authorization:`Bearer ${token||''}`}});
 assert.equal((await get()).status,401);assert.equal((await get(users[0].token)).status,403);
 const response=await get(users[1].token);assert.equal(response.status,200);const csv=await response.text();assert.ok(csv.includes(users[0].email));assert.ok(csv.includes("'=Unsafe"));assert.ok(csv.includes('""Name""'));assert.ok(csv.includes('+6785550101'));assert.ok(csv.includes('Export QA course'));assert.equal(csv.trim().split('\r\n').length,2);
 assert.equal((await (await get(users[1].token,'&status=paid')).text()).trim().split('\r\n').length,1);
 assert.equal((await get(users[1].token,'&status=invalid')).status,400);
 console.log('PASS: admin-only CSV, course/status filters, contact fields and safe CSV quoting.');
} finally {
 if(course){const rows=await check(db.from('pwd_lms_orders').select('id').eq('course_id',course.id));for(const o of rows)await check(db.from('pwd_lms_emails').delete().eq('order_id',o.id));await check(db.from('pwd_lms_orders').delete().eq('course_id',course.id));await check(db.from('pwd_lms_channels').delete().eq('course_id',course.id));await check(db.from('pwd_lms_courses').delete().eq('id',course.id));}
 for(const u of users){await check(db.from('admin_users').delete().eq('email',u.email));await check(db.auth.admin.deleteUser(u.id));}console.log('Removed export QA fixtures.');
}
