import test from 'node:test';
import assert from 'node:assert/strict';
import { signupSchema } from '../src/lib/lms/signup';
import { HttpError, apiError } from '../src/lib/server/http';
import { createTrainingAccount } from '../src/lib/server/lms-signup';
const input = { mode: 'signup' as const, email: 'student@example.com', password: 'Safe-Example-123!', name: 'Example Student', phone: '+678 5551234', location: 'Port Vila', attendance: 'online' as const, acknowledged: true as const, course: 'example-course' };
test('signup requires contact information, attendance and explicit consent', () => {
 assert.equal(signupSchema.safeParse(input).success,true);
 for (const patch of [{phone:'+678 '},{location:''},{name:''},{attendance:'invalid'},{acknowledged:false},{password:'short'}]) assert.equal(signupSchema.safeParse({...input,...patch}).success,false);
});
test('new training signup uses server fee, creates a pending order and never mutates existing accounts', async () => {
 const original=globalThis.fetch;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://signup-tests.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test';
 let existing=false,closed=false,approval=false;
 const calls:{url:string,method:string,body:Record<string,unknown>}[]=[];
 globalThis.fetch=async (url,init)=>{
  const path=String(url), body=init?.body?JSON.parse(String(init.body)):{};calls.push({url:path,method:init?.method||'GET',body});
  let data:unknown=[];
  if(path.includes('/pwd_lms_courses'))data={id:'11111111-1111-4111-8111-111111111111',enrollment_open:!closed,published:true,requires_approval:approval,amount:approval?0:250000,currency:'VUV'};
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
  approval=true;calls.length=0;
  await createTrainingAccount(input);
  const workshop=calls.find(c=>c.url.includes('/pwd_lms_orders'))!.body;
  assert.equal(workshop.amount,0);assert.equal(workshop.status,'pending');assert.equal(workshop.method,'grant');
  assert.equal(workshop.package_label,'Awaiting workshop approval');
  existing=true;calls.length=0;
  await assert.rejects(createTrainingAccount(input), (error: unknown) => error instanceof HttpError && error.status === 409 && error.code === 'ACCOUNT_EXISTS');
  assert.ok(!calls.some(c=>c.url.includes('/pwd_lms_profiles')||c.url.includes('/pwd_lms_orders')||['PUT','PATCH','DELETE'].includes(c.method)));
  closed=true;calls.length=0;
  await assert.rejects(createTrainingAccount(input),/not accepting registrations/);
  assert.ok(!calls.some(c=>c.url.includes('/auth/')));
 } finally {globalThis.fetch=original;}
});

test('account recovery hints survive the HTTP boundary while other errors remain unchanged', async () => {
 const response = await apiError(new HttpError(409, 'Please sign in.', 'ACCOUNT_EXISTS'), '/test');
 assert.equal(response.status,409);
 assert.deepEqual(await response.json(), { success: false, error: 'Please sign in.', code: 'ACCOUNT_EXISTS' });
 const other = await apiError(new HttpError(409,'Registration closed.'),'/test');
 assert.deepEqual(await other.json(),{success:false,error:'Registration closed.'});
});

test('a partially completed signup directs recovery to sign-in without changing or deleting the account', async () => {
 const original=globalThis.fetch;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://signup-tests.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test';
 const methods:string[]=[];
 globalThis.fetch=async (url,init)=>{
  const path=String(url);methods.push(init?.method||'GET');
  const data=path.includes('/pwd_lms_courses')?{id:'11111111-1111-4111-8111-111111111111',published:true,enrollment_open:true,amount:250000,currency:'VUV'}:{id:'22222222-2222-4222-8222-222222222222',email:input.email};
  return new Response(JSON.stringify(path.includes('/pwd_lms_profiles')?{message:'Temporary profile failure'}:data),{status:path.includes('/pwd_lms_profiles')?500:200,headers:{'Content-Type':'application/json'}});
 };
 try {
  await assert.rejects(createTrainingAccount(input),(error:unknown)=>error instanceof HttpError&&error.status===503&&error.code==='ACCOUNT_CREATED_SIGN_IN');
  assert.ok(!methods.some(method=>['PUT','PATCH','DELETE'].includes(method)));
 }finally{globalThis.fetch=original;}
});
