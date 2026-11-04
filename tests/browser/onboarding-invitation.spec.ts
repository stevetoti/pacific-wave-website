import {test,expect} from '@playwright/test';
const courseId='22222222-2222-4222-8222-222222222222',userId='44444444-4444-4444-8444-444444444444';
const course={id:courseId,slug:'onboarding-fixture',title:'Your business and AI training',published:true,private_sessions:false,introduction:'Prepare your practical business idea.',amount:35000,currency:'VUV',kind:'live'};
const order={id:'33333333-3333-4333-8333-333333333333',user_id:userId,course_id:courseId,status:'granted',name:'Amelia Student',email:'amelia@example.test',phone:'',attendance:'online',amount:35000,currency:'VUV',created_at:'2026-11-04T00:00:00Z'};
test('email tutor link preserves course across sign-in and requires explicit session/sharing choice',async({page})=>{
 const user={id:userId,email:order.email,aud:'authenticated',role:'authenticated'};
 const enc=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const session={access_token:enc({alg:'HS256',typ:'JWT'})+'.'+enc({sub:userId,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})+'.fixture',refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user};
 let starts=0;
 await page.route('**/auth/v1/**',r=>r.fulfill({json:{...session,user}}));
 await page.route('**/api/**',async r=>{
  const req=r.request(),path=new URL(req.url()).pathname;
  if(path==='/api/lms-coach'&&req.method()==='POST'){
   const body=req.postDataJSON();if(body.action==='start'){starts++;expect(body.role).toBe('onboarding');expect(body.share_onboarding).toBe(true);return r.fulfill({status:503,json:{error:'Synthetic connection stopped safely'}});}
  }
  const data=path==='/api/lms/dashboard'?{orders:[order],progress:[]}:path==='/api/lms/course'?{course,lessons:[]}:path==='/api/lms/catalog'?{courses:[],banks:[]}:path==='/api/lms-profile'?{profile:{full_name:order.name}}:path==='/api/lms-coach'?{available:{onboarding:true},consent_accepted:true,onboarding_completed:false,access:{active:true,ends_on:null},history:[],notes:'',context:{student:{name:order.name}}}:{items:[],unread:0,requests:0};
  return r.fulfill({json:data});
 });
 await page.goto(`/training-center/course/${courseId}?tutor=onboarding`);
 await page.getByRole('link',{name:'Student sign in',exact:true}).click();
 await expect(page).toHaveURL(new RegExp('account\\?mode=signin&onboarding='+courseId));
 await page.getByLabel('Email address',{exact:true}).fill(order.email);await page.getByLabel('Password',{exact:true}).fill('FixturePassword123!');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page).toHaveURL(new RegExp('/course/'+courseId+'\\?tutor=onboarding'));
 const intro=page.getByRole('region',{name:'Meet your Onboarding Tutor',exact:true});
 await expect(intro).toBeVisible();await expect(intro.locator('video')).toHaveAttribute('controls','');
 const start=intro.getByRole('button',{name:'Speak with your Onboarding Tutor',exact:true});await expect(start).toBeDisabled();expect(starts).toBe(0);
 await intro.getByRole('checkbox').check();await expect(start).toBeEnabled();await start.click();
 await expect(page.getByRole('alert').filter({hasText:'Synthetic connection stopped safely'})).toBeVisible();expect(starts).toBe(1);
 await expect(intro.getByRole('checkbox')).not.toBeChecked();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('teacher roster opens only the requested student onboarding conversation and shows empty/error states',async({page})=>{
 const user={id:'55555555-5555-4555-8555-555555555555',email:'admin-onboarding@example.test',aud:'authenticated',role:'authenticated'};
 await page.addInitScript(s=>localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(s)),{access_token:'qa.token.signature',refresh_token:'fixture',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user});
 await page.route('https://rndegttgwtpkbjtvjgnc.supabase.co/**',r=>r.fulfill({json:r.request().url().includes('admin_users')?{id:user.id,email:user.email,role:'admin',site_id:'pacific-wave-digital',is_active:true}:{user}}));
 let response='ready';
 await page.route('**/api/**',r=>{
  const url=new URL(r.request().url());
  if(url.pathname==='/api/lms-onboarding'){
   expect(url.searchParams.get('course')).toBe(courseId);expect(url.searchParams.get('student')).toBe(userId);
   return r.fulfill(response==='error'?{status:503,json:{error:'Onboarding review unavailable'}}:{json:{sessions:response==='empty'?[]:[{id:'conversation-1',created_at:'2026-11-04T00:00:00Z',summary:'Amelia wants to start a local service business.',transcript:[{role:'user',content:'I joined because I want to learn AI and build my business.'}]}]}});
  }
  const data=url.pathname==='/api/lms/admin'?{courses:[course],orders:[order],lessons:[],banks:[]}:url.pathname==='/api/lms-students'?{accounts:[]}:url.pathname==='/api/lms-contact'?{sms_enabled:false,live:false,latest:{}}:{};
  return r.fulfill({json:data});
 });
 await page.goto('/admin/training-center');await page.getByRole('button',{name:/Your business and AI training.*View students/}).click();
 const open=page.locator('.sr-row').getByRole('button',{name:'Onboarding',exact:true});await open.click();
 const dialog=page.getByRole('dialog');await expect(dialog).toContainText('Amelia wants to start a local service business.');await dialog.getByText('Read motivation, expectations and conversation').click();await expect(dialog).toContainText('I joined because');await dialog.getByRole('button',{name:'Close',exact:true}).click();
 response='empty';await open.click();await expect(dialog).toContainText('No shared onboarding conversation');await dialog.getByRole('button',{name:'Close',exact:true}).click();
 response='error';await open.click();await expect(dialog.getByRole('alert')).toContainText('Onboarding review unavailable');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
