import test from 'node:test';
import assert from 'node:assert/strict';
import { signupSchema } from '../src/lib/lms/signup';
import { createTrainingAccount } from '../src/lib/server/lms-signup';
const input = { mode: 'signup' as const, email: 'student@example.com', password: 'Safe-Example-123!', name: 'Example Student', phone: '+678 5551234', location: 'Port Vila', attendance: 'online' as const, acknowledged: true as const, course: 'example-course' };
test('signup requires contact information, attendance and explicit consent', () => {
 assert.equal(signupSchema.safeParse(input).success,true);
 for (const patch of [{phone:'+678 '},{location:''},{name:''},{attendance:'invalid'},{acknowledged:false},{password:'short'}]) assert.equal(signupSchema.safeParse({...input,...patch}).success,false);
});
test('new training signup uses server fee, creates a pending order and never mutates existing accounts', async () => {
 const original=globalThis.fetch;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://signup-tests.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test';
 let existing=false,closed=false;
 const calls:{url:string,method:string,body:Record<string,unknown>}[]=[];
 globalThis.fetch=async (url,init)=>{
  const path=String(url), body=init?.body?JSON.parse(String(init.body)):{};calls.push({url:path,method:init?.method||'GET',body});
  let data:unknown=[];
  if(path.includes('/pwd_lms_courses'))data={id:'11111111-1111-4111-8111-111111111111',enrollment_open:!closed,published:true,amount:250000,currency:'VUV'};
  if(path.includes('/auth/v1/admin/users')){
   if(existing)return new Response(JSON.stringify({error_code:'email_exists',msg:'Already registered'}),{status:422,headers:{'Content-Type':'application/json'}});
   data={id:'22222222-2222-4222-8222-222222222222',email:input.email};
  }
  return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
 };
 try {
  await createTrainingAccount(input);
  assert.equal(calls.find(c=>c.url.includes('/auth/v1/admin/users'))?.body.email_confirm,true);
  assert.equal(calls.find(c=>c.url.includes('/pwd_lms_profiles'))?.body.city,'Port Vila');
  const order=calls.find(c=>c.url.includes('/pwd_lms_orders'))!.body;
  assert.equal(order.amount,250000);assert.equal(order.status,undefined);assert.equal(order.attendance,'online');
  existing=true;calls.length=0;
  await assert.rejects(createTrainingAccount(input),/already uses this email/);
  assert.ok(!calls.some(c=>c.url.includes('/pwd_lms_profiles')||c.url.includes('/pwd_lms_orders')||['PUT','PATCH','DELETE'].includes(c.method)));
  closed=true;calls.length=0;
  await assert.rejects(createTrainingAccount(input),/not accepting registrations/);
  assert.ok(!calls.some(c=>c.url.includes('/auth/')));
 } finally {globalThis.fetch=original;}
});
