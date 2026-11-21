import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NEXT_PUBLIC_SUPABASE_URL='https://returning-tests.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='fixture';
const user='22222222-2222-4222-8222-222222222222', course='c3ac2a74-1775-409b-8c16-8b8109cc313c', order='33333333-3333-4333-8333-333333333333';
const request=(body:unknown)=>new Request('https://example.com/api/lms/order',{method:'POST',headers:{authorization:'Bearer fixture','Content-Type':'application/json'},body:JSON.stringify(body)});
test('saved-contact registration is user scoped, server priced and idempotent; incomplete/changed-account/closed-course requests cannot write',async()=>{
 const {POST,GET}=await import('../src/app/api/lms/[action]/route');const original=globalThis.fetch;
 let closed=false,missing=false;let saved:Record<string,unknown>|null=null;
 const writes:{url:URL,body:Record<string,unknown>,prefer:string|null}[]=[];const reads:URL[]=[];
 globalThis.fetch=async(input,init)=>{
  const req=input instanceof Request?input:new Request(input,init),url=new URL(req.url);reads.push(url);let data:unknown={};
  if(url.pathname==='/auth/v1/user')data={id:user,email:'student@example.com',email_confirmed_at:new Date().toISOString(),app_metadata:{lms_qa_no_email:true},user_metadata:{full_name:'Account Name'}};
  else if(url.pathname.endsWith('/rpc/pwd_rate_limit'))data=true;
  else if(url.pathname.endsWith('/pwd_lms_courses'))data={id:course,published:true,enrollment_open:!closed,amount:250000,currency:'VUV',requires_approval:false};
  else if(url.pathname.endsWith('/pwd_lms_profiles'))data={full_name:missing?'':'Aron Toa',phone:missing?'':'+678 5551234'};
  else if(url.pathname.endsWith('/pwd_lms_progress'))data=[];
  else if(url.pathname.endsWith('/pwd_lms_orders')){
   assert.equal(url.searchParams.get('user_id')||'eq.'+user,'eq.'+user);
   if(req.method==='POST'){const body=await req.json();writes.push({url,body,prefer:req.headers.get('prefer')});saved ||= {id:order,status:'pending',...body};data=[];}
   else if(url.searchParams.get('select')?.includes('pwd_lms_courses'))data={pwd_lms_courses:{is_private:false}};
   else if(url.searchParams.get('select')==='name,phone,attendance')data=missing?[]:[{name:'Old Name',phone:'+678 5559999',attendance:'online'}];
   else if(url.searchParams.get('course_id'))data=saved;
   else data=saved?[saved]:[];
  }else throw Error('Unexpected external request '+url.origin+url.pathname);
  return Response.json(data);
 };
 try{
  const body={course_id:course,use_saved_details:true,expected_user_id:user,name:'Untrusted Name',amount:1};
  for(let i=0;i<2;i++)assert.equal((await POST(request(body),{params:Promise.resolve({action:'order'})})).status,200);
  assert.equal(saved?.['name'],'Aron Toa');assert.equal(saved?.['amount'],250000);assert.equal(saved?.['status'],'pending');assert.equal(writes[0].body.phone,'+678 5551234');assert.match(writes[0].prefer||'',/resolution=ignore-duplicates/);
  const dashboard=await GET(new Request('https://example.com/api/lms/dashboard',{headers:{authorization:'Bearer fixture'}}),{params:Promise.resolve({action:'dashboard'})});assert.equal(dashboard.status,200);assert.equal((await dashboard.json()).registration.name,'Aron Toa');
  const count=writes.length;
  assert.equal((await POST(request({...body,expected_user_id:'44444444-4444-4444-8444-444444444444'}),{params:Promise.resolve({action:'order'})})).status,409);
  missing=true;assert.equal((await POST(request(body),{params:Promise.resolve({action:'order'})})).status,422);missing=false;closed=true;
  assert.equal((await POST(request(body),{params:Promise.resolve({action:'order'})})).status,409);assert.equal(writes.length,count);
  for(const read of reads.filter(url=>url.pathname.endsWith('/pwd_lms_profiles')))assert.equal(read.searchParams.get('user_id'),'eq.'+user);
 }finally{globalThis.fetch=original;}
});
