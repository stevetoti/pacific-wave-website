import { test, expect } from "@playwright/test";
test('recording previews show ready videos, switch one inline player and send YouTube origin referrer',async({page,baseURL})=>{
 const courseId="22222222-2222-4222-8222-222222222222",lessonId="11111111-1111-4111-8111-111111111111";
 const user={id:"44444444-4444-4444-8444-444444444444",email:"zoom-qa@example.com",aud:"authenticated",role:"authenticated"};
 const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString("base64url");
 const token=encode({alg:"HS256",typ:"JWT"})+"."+encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:"authenticated"})+".fixture";
 const session={access_token:token,refresh_token:"test-refresh",expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:"bearer",user};
 await page.addInitScript(s=>localStorage.setItem("sb-rndegttgwtpkbjtvjgnc-auth-token",JSON.stringify(s)),session);
 await page.route("**/auth/v1/**",r=>r.fulfill({json:{...session,user}}));
 const course={id:courseId,slug:"zoom-fixture",title:"Build Your Online Business in 30 Days",published:true,private_sessions:false,introduction:"Join your class",amount:35000,currency:"VUV"};
 const order={id:"33333333-3333-4333-8333-333333333333",course_id:courseId,status:"granted"};
 const lesson={id:lessonId,course_id:courseId,title:"Live website workshop",position:1,published:true,has_recording:false,starts_at:"2026-10-05T04:00:00Z",content:"Practice after class",youtube_id:"s2lW7zT2ipo",youtube_ids:["s2lW7zT2ipo","qpVPyN-VIJQ"],meeting_url:"https://us02web.zoom.us/j/12345678901?pwd=fixture",quiz:[]};

 await page.route("**/api/**",r=>{
  const path=new URL(r.request().url()).pathname;
  const data=path==="/api/lms/dashboard"?{orders:[order],progress:[]}:path==="/api/lms/course"?{course,lessons:[lesson]}:path==="/api/lms/catalog"?{courses:[],banks:[]}:path==="/api/lms-profile"?{profile:{full_name:"QA Student"}}:path==="/api/lms-coach"?{available:{},consent_accepted:false,onboarding_completed:false,access:{active:true,ends_on:null},history:[],notes:"",context:{}}:{items:[],unread:0,requests:0};
  return r.fulfill({json:data});
 });
 const referrers:string[]=[];
 await page.route("https://www.youtube-nocookie.com/embed/**",async r=>{
   referrers.push((await r.request().allHeaders()).referer);
   await r.fulfill({contentType:'text/html',body:'<p>YouTube player test</p>'});
 });
 await page.goto('/training-center/course/'+courseId);
 await page.getByRole('button',{name:/Live website workshop/}).click();
 const recordings=page.getByRole('region',{name:'Class recordings',exact:true});
 await expect(recordings.locator('iframe')).toHaveCount(0);
 await expect(recordings.getByText('Recording ready',{exact:true})).toHaveCount(2);
 for(const img of await recordings.locator('img').all()) {
   await expect.poll(()=>img.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   await expect(img).toHaveAttribute('src',/i.ytimg.com/);
 }
 await recordings.screenshot({path:'/private/tmp/pwd-replay-previews-'+test.info().project.name+'.png'});
 await recordings.getByRole('button',{name:'Watch Part 1',exact:true}).click();
 await expect(recordings.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/s2lW7zT2ipo?playsinline=1');
 await expect.poll(()=>referrers.length).toBe(1);
 expect(referrers[0]).toBe(new URL(baseURL!).origin+'/');
 await recordings.getByRole('button',{name:'Watch Part 2',exact:true}).click();
 await expect(recordings.locator('iframe')).toHaveCount(1);
 await expect(recordings.locator('iframe')).toHaveAttribute('src',/qpVPyN-VIJQ/);
 await expect(recordings.getByRole('link',{name:'Open Part 2 on YouTube'})).toHaveAttribute('href','https://www.youtube.com/watch?v=qpVPyN-VIJQ');
 const box=await recordings.locator('iframe').boundingBox();expect(box!.height).toBeGreaterThanOrEqual(200);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
