import { test, expect } from "@playwright/test";
test("embedded class opens, exchanges only join data, handles errors and returns on desktop/mobile",async({page})=>{
 page.on("pageerror", e=>console.error("Classroom browser error:",e.message));
 const courseId="22222222-2222-4222-8222-222222222222",lessonId="11111111-1111-4111-8111-111111111111";
 const user={id:"44444444-4444-4444-8444-444444444444",email:"zoom-qa@example.com",aud:"authenticated",role:"authenticated"};
 const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString("base64url");
 const token=encode({alg:"HS256",typ:"JWT"})+"."+encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:"authenticated"})+".fixture";
 const session={access_token:token,refresh_token:"test-refresh",expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:"bearer",user};
 await page.addInitScript(s=>localStorage.setItem("sb-rndegttgwtpkbjtvjgnc-auth-token",JSON.stringify(s)),session);
 await page.route("**/auth/v1/**",r=>r.fulfill({json:{...session,user}}));
 const course={id:courseId,slug:"zoom-fixture",title:"Zoom classroom QA",published:true,private_sessions:false,introduction:"Join your class",amount:35000,currency:"VUV"};
 const order={id:"33333333-3333-4333-8333-333333333333",course_id:courseId,status:"granted"};
 const lesson={id:lessonId,course_id:courseId,title:"Live website workshop",position:1,published:true,starts_at:null,content:"Practice after class",youtube_id:"",meeting_url:"https://us02web.zoom.us/j/12345678901?pwd=fixture",quiz:[]};
 let fail=false;
 await page.route("**/api/**",r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==="/api/lms-zoom"){
   expect(r.request().postDataJSON()).toEqual({lessonId});
   return r.fulfill(fail?{status:503,json:{error:"The embedded classroom is not ready yet. Please use Open in Zoom."}}:{json:{signature:"fixture.signature",sdkKey:"fixture-client",meetingNumber:"12345678901",passWord:"fixture-passcode",userName:"QA Student"}});
  }
  const data=path==="/api/lms/dashboard"?{orders:[order],progress:[]}:path==="/api/lms/course"?{course,lessons:[lesson]}:path==="/api/lms/catalog"?{courses:[],banks:[]}:path==="/api/lms-profile"?{profile:{full_name:"QA Student"}}:path==="/api/lms-coach"?{available:{},consent_accepted:false,onboarding_completed:false,access:{active:true,ends_on:null},history:[],notes:"",context:{}}:{items:[],unread:0,requests:0};
  return r.fulfill({json:data});
 });
 // Stub Zoom's external media service, not the actual application, for deterministic lifecycle checks.
 await page.route("**/zoom-classroom/frame.html",r=>r.fulfill({contentType:"text/html",body:`<!doctype html><html><body><h1>Zoom fixture</h1><button id="leave">Leave meeting</button><script>
 window.addEventListener("message",e=>{if(e.origin!==location.origin||e.source!==parent)return; if(e.data.type==="pwd-zoom-join"){document.body.dataset.joined=e.data.payload.userName;document.body.dataset.meeting=e.data.payload.meetingNumber;}});
 document.getElementById("leave").onclick=()=>parent.postMessage({type:"pwd-zoom-left"},location.origin);
 parent.postMessage({type:"pwd-zoom-ready"},location.origin);
 </script></body></html>`}));
 await page.goto("/training-center/course/"+courseId);
 await page.getByRole("button",{name:/Live website workshop/}).click();
 const join=page.getByRole("button",{name:"Join inside dashboard"});
 await expect(join).toBeVisible();
 await expect(page.getByRole("link",{name:"Open in Zoom",exact:true})).toHaveAttribute("href",lesson.meeting_url);
 fail=true;await join.click();await expect(page.getByRole("region",{name:"Live classroom"}).getByRole("alert")).toContainText("not ready");
 fail=false;await join.click();
 const dialog=page.getByRole("dialog");
 await expect(dialog).toBeVisible();
 const embedded=page.frameLocator('iframe[title="Zoom live classroom"]');
 await expect(embedded.locator("body")).toHaveAttribute("data-joined","QA Student");
 await expect(embedded.locator("body")).toHaveAttribute("data-meeting","12345678901");
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:"/tmp/zoom-classroom-"+test.info().project.name+".png"});
 await embedded.getByRole("button",{name:"Leave meeting"}).click();await expect(dialog).toHaveCount(0);
 await join.click();await expect(dialog).toBeVisible();
 await page.getByRole("button",{name:"Leave classroom and return to course"}).click();await expect(dialog).toHaveCount(0);
 await expect(join).toBeFocused();
});
