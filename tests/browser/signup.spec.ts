import { test, expect } from '@playwright/test';

test('one signup form opens payment with contact and attendance already saved', async ({ page, request }) => {
 const catalog=await (await request.get('/api/lms/catalog')).json();
 const course=catalog.courses.find((c:{slug:string})=>c.slug==='vanuatu-october-2026');
 const user={id:'22222222-2222-4222-8222-222222222222',email:'signup-ui@example.com',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{}};
 const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const token=`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})}.fixture`;
 let payload:Record<string,unknown>={};
 await page.route('**/auth/v1/**',r=>r.fulfill({json:{access_token:token,refresh_token:'fixture-refresh',expires_in:3600,token_type:'bearer',user}}));
 await page.route('**/api/lms-profile**',r=>r.fulfill({json:{profile:{full_name:'Test Student',avatar_url:''}}}));
 await page.route('**/api/lms/**', async r=>{
  const action=new URL(r.request().url()).pathname.split('/').at(-1);
  if(action==='account') {payload=r.request().postDataJSON();return r.fulfill({json:{success:true,courseId:course.id}});}
  if(action==='catalog')return r.fulfill({json:catalog});
  if(action==='dashboard')return r.fulfill({json:{orders:[{id:'33333333-3333-4333-8333-333333333333',course_id:course.id,status:'pending',amount:35000,currency:'VUV',name:'Test Student',phone:'+678 5551234',attendance:'online'}],progress:[]}});
  return r.fulfill({status:400,json:{error:'Unexpected operation in read-only test'}});
 });
 await page.goto('/training-center/account?mode=signup&course=vanuatu-october-2026');
 await expect(page.getByRole('heading',{name:'Create your student account'})).toBeVisible();
 await page.getByLabel('Full name',{exact:true}).fill('Test Student');
 await page.getByLabel('Phone / WhatsApp').fill('+678 5551234');
 await page.getByLabel('Location (town, island or country)').fill('Port Vila');
 await page.getByLabel('How would you like to attend?').selectOption('online');
 await page.getByLabel('Email address',{exact:true}).fill(user.email);
 await page.getByLabel('Password',{exact:true}).fill('Test-Password-123!');
 await page.locator('input[name=privacy]').check();
 await page.getByRole('button',{name:'Register & continue to payment'}).click();
 await expect(page).toHaveURL(/\/checkout\?course=vanuatu-october-2026/);
 await expect(page.getByRole('button',{name:'Pay securely by card'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Your registration details'})).toHaveCount(0);
 expect(payload).toMatchObject({name:'Test Student',phone:'+678 5551234',location:'Port Vila',attendance:'online',acknowledged:true,mode:'signup'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('October registration stays visible while reading the course details', async ({page}) => {
 await page.goto('/vanuatu-training');
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight/2));
 const join=page.getByRole('link',{name:'Join class',exact:true});
 await expect(join).toBeInViewport();
 await join.click();
 await expect(page.getByRole('heading',{name:'Create your student account'})).toBeVisible();
 await expect(page.getByLabel('Phone / WhatsApp')).toBeVisible();
 await page.screenshot({path:`/tmp/signup-final-${test.info().project.name}.png`,fullPage:true});
});
