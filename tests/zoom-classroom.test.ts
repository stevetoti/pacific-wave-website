import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { zoomMeetingNumber } from "../src/lib/lms/zoom";
import { zoomAttendeeSignature } from "../src/lib/server/zoom";
test("Zoom parser rejects lookalike hosts, non-meeting routes and credentials", () => {
  assert.equal(zoomMeetingNumber("https://us02web.zoom.us/j/12345678901?pwd=encrypted"),"12345678901");
  assert.equal(zoomMeetingNumber("https://zoom.us/wc/join/1234567890"),"1234567890");
  for (const link of ["https://zoom.us.evil.com/j/12345678901","https://evilzoom.us/j/12345678901","http://zoom.us/j/12345678901","https://user@zoom.us/j/12345678901","https://zoom.us/meeting/12345678901","https://zoom.us/j/1234","https://zoom.us:444/j/12345678901","not a link"])
    assert.equal(zoomMeetingNumber(link),null,link);
});
test("signature is attendee-only, expires in 30 minutes and uses server HMAC", () => {
  process.env.ZOOM_MEETING_SDK_CLIENT_ID="fixture-client"; process.env.ZOOM_MEETING_SDK_CLIENT_SECRET="fixture-secret";
  const {signature}=zoomAttendeeSignature("12345678901",1800000000000);
  const [head,body,mac]=signature.split(".");
  const payload=JSON.parse(Buffer.from(body,"base64url").toString());
  assert.equal(payload.role,0);assert.equal(payload.mn,"12345678901");
  assert.equal(payload.exp-payload.iat,1800);assert.equal(payload.tokenExp,payload.exp);
  assert.equal(mac,createHmac("sha256","fixture-secret").update(head+"."+body).digest("base64url"));
});
test("join API enforces verified user, approved enrolment, publication and private-session ownership",async()=>{
 process.env.NEXT_PUBLIC_SUPABASE_URL="https://zoom-fixture.supabase.co";process.env.SUPABASE_SERVICE_ROLE_KEY="fixture";
 const {POST}=await import("../src/app/api/lms-zoom/route");
 const original=globalThis.fetch;
 const lessonId="11111111-1111-4111-8111-111111111111",courseId="22222222-2222-4222-8222-222222222222",orderId="33333333-3333-4333-8333-333333333333";
 let granted=true,published=true,privateSessions=false,owner:string|null=null,passcode="654321",meetingUrl="https://us02web.zoom.us/j/12345678901?pwd=encrypted";
 globalThis.fetch=async(input)=>{
  const u=new URL(String(input));let data:unknown;
  if(u.pathname==="/auth/v1/user")data={id:"44444444-4444-4444-8444-444444444444",email:"qa@example.com",email_confirmed_at:"2026-10-04T00:00:00Z"};
  else if(u.pathname.endsWith("/pwd_lms_lessons")){assert.equal(u.searchParams.get("id"),"eq."+lessonId);data={id:lessonId,course_id:courseId,order_id:owner,published,meeting_url:meetingUrl,zoom_passcode:passcode};}
  else if(u.pathname.endsWith("/pwd_lms_orders")){assert.equal(u.searchParams.get("status"),"in.(paid,granted)");assert.equal(u.searchParams.get("user_id"),"eq.44444444-4444-4444-8444-444444444444");data=granted?{id:orderId,name:"QA Student"}:null;}
  else if(u.pathname.endsWith("/pwd_lms_courses"))data={private_sessions:privateSessions};
  else throw new Error("Unexpected fixture request");
  return new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json"}});
 };
 const request=(body:unknown={lessonId},auth=true)=>new Request("https://example.com/api/lms-zoom",{method:"POST",headers:{"Content-Type":"application/json",...(auth?{authorization:"Bearer fixture"}:{})},body:JSON.stringify(body)});
 try{
  assert.equal((await POST(request(undefined,false))).status,401);
  assert.equal((await POST(request({lessonId,role:1}))).status,400);
  assert.equal((await POST(request({lessonId,meetingNumber:"55555555555"}))).status,400);
  let response=await POST(request());assert.equal(response.status,200);assert.match(response.headers.get("cache-control")||"",/no-store/);
  const data=await response.json();assert.equal(data.passWord,"654321");assert.equal(data.userName,"QA Student");assert.ok(!JSON.stringify(data).includes("fixture-secret"));
  granted=false;assert.equal((await POST(request())).status,403);granted=true;
  published=false;assert.equal((await POST(request())).status,404);published=true;
  owner="55555555-5555-4555-8555-555555555555";assert.equal((await POST(request())).status,403);
  owner=null;privateSessions=true;assert.equal((await POST(request())).status,403);
  owner=orderId;assert.equal((await POST(request())).status,200);
  privateSessions=false;owner=null;passcode="";assert.equal((await POST(request())).status,409);
  meetingUrl="https://zoom.us.evil.com/j/12345678901";assert.equal((await POST(request())).status,400);
  meetingUrl="https://zoom.us/j/12345678901";delete process.env.ZOOM_MEETING_SDK_CLIENT_SECRET;assert.equal((await POST(request())).status,503);
 }finally{globalThis.fetch=original;delete process.env.ZOOM_MEETING_SDK_CLIENT_ID;delete process.env.ZOOM_MEETING_SDK_CLIENT_SECRET;}
});
