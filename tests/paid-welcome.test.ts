import test from "node:test";
import assert from "node:assert/strict";
import { paidWelcomeEmail } from "../src/lib/email/paid-welcome";
import { sendPaidWelcomes } from "../src/lib/server/paid-welcome";
import type { getSupabaseAdmin } from "../src/lib/server/clients";
import { novemberCohort } from "../src/lib/training/config";
const course={id:"course-1",title:"Build Your Business in 30 Days with AI",slug:"vanuatu-november-2026",cohort_id:"vanuatu-2026-11"};
test("welcome gives truthful pre-class dashboard guidance and escapes supplied names",()=>{
 const m=paidWelcomeEmail("Diana <script>",course,novemberCohort,new Date("2026-11-04T00:00:00Z"));
 for(const text of ["16 November 2026","19 December 2026","Onboarding Tutor","interactive workbook","same email","Forgot password","community","recordings","class to start"]) assert.ok(m.text.includes(text),text);
 assert.ok(m.html.includes("&lt;script&gt;"));assert.ok(!m.html.includes("Diana <script>"));
 assert.ok(m.text.includes("/training-center/dashboard"));assert.ok(m.text.includes("/training-center/course/course-1"));
 const personal=paidWelcomeEmail("Student",{...course,slug:"one-on-one-mentorship",private_sessions:true});
 assert.ok(!personal.text.includes("interactive workbook"));assert.ok(personal.text.includes("appointments"));
});
function fixture(options:{status?:string;recipient?:string;attempts?:number;firstAttempt?:string;providerStatus?:number}={}) {
 const updates:{state?:string;provider_id?:string;last_error?:string;payload?:unknown}[]=[],requests:{headers:HeadersInit|undefined;body:Record<string,string>}[]=[],calls:string[]=[];
 const job={id:"welcome-1",order_id:"order-1",attempts:options.attempts || 1,first_attempt_at:options.firstAttempt};
 const db={rpc:async(name:string)=>{calls.push(name);return{data:calls.length===1?[job]:[],error:null};},from:(table:string)=>{
  let patch:typeof updates[number]|undefined;
  const chain={select:()=>chain,eq:()=>patch?(updates.push(patch),Promise.resolve({error:null})):chain,
   update:(p:typeof patch)=>{patch=p;return chain;},single:async()=>({error:null,data:table==="pwd_lms_orders"?{name:"Student",email:options.recipient || "student@real.example",status:options.status || "paid",course_id:course.id}:table==="pwd_lms_courses"?course:{config:novemberCohort}})};
  return chain;
 }};
 return {updates,requests,calls,services:{enabled:true,database:()=>db as unknown as ReturnType<typeof getSupabaseAdmin>,request:async(_url:unknown,init?:RequestInit)=>{requests.push({headers:init?.headers,body:JSON.parse(String(init?.body))});return Response.json({id:"provider-1"},{status:options.providerStatus || 200});},report:async()=>{}}};
}
test("sender only claims welcome queue, saves provider receipt and uses stable idempotency key",async()=>{
 const f=fixture();const result=await sendPaidWelcomes(["order-1"],f.services);
 assert.equal(result.accepted,1);assert.ok(f.calls.length>=1 && f.calls.every(name=>name==="pwd_lms_claim_welcomes"));
 assert.equal(f.requests.length,1);assert.equal(f.requests[0].body.to,"student@real.example");
 assert.equal(new Headers(f.requests[0].headers).get("Idempotency-Key"),"pwd-welcome-welcome-1");
 assert.ok(f.updates.some(p=>p.state==="accepted"&&p.provider_id==="provider-1"));
});
test("failed delivery retries without claiming legacy jobs and eventually stops",async()=>{
 for(const attempts of [1,6]) {const f=fixture({attempts,providerStatus:503});assert.equal((await sendPaidWelcomes(["order-1"],f.services)).failed,1);assert.equal(f.updates.at(-1)?.state,attempts===6?"failed":"pending");}
});
test("reserved test and revoked recipients never reach the email provider",async()=>{
 for(const options of [{recipient:"qa@example.test"},{status:"refunded"}]) {const f=fixture(options);await sendPaidWelcomes(["order-1"],f.services);assert.equal(f.requests.length,0);assert.ok(f.updates.length);}
 const f=fixture();await sendPaidWelcomes([],f.services);assert.equal(f.calls.length,0);
});

test("welcome retry cron rejects unsigned requests before claiming jobs", async()=>{
 const {GET}=await import("../src/app/api/cron/training-welcomes/route");
 assert.equal((await GET(new Request("https://example.test/api/cron/training-welcomes"))).status,401);
 assert.equal((await GET(new Request("https://example.test/api/cron/training-welcomes",{headers:{authorization:"Bearer wrong"}}))).status,401);
 const f=fixture();await sendPaidWelcomes(undefined,{...f.services,enabled:false});assert.equal(f.calls.length,0);
});

test("ambiguous retry beyond the provider safety window is held for review without resending",async()=>{
 const f=fixture({attempts:2,firstAttempt:new Date(Date.now()-25*3600000).toISOString()});
 await sendPaidWelcomes(["order-1"],f.services);assert.equal(f.requests.length,0);assert.equal(f.updates.at(-1)?.state,"failed");
});
