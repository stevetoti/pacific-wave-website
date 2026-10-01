import { test, expect } from '@playwright/test';
import { blpModules } from '../../src/lib/lms/blp-workshop';

test('BLP topics show locked previews until the instructor publishes a recording', async ({page,request}) => {
  const {course}=await (await request.get('/api/lms/registration_course?course=blp-digital-skills-workshop')).json();
  const user={id:'22222222-2222-4222-8222-222222222222',email:'blp-preview@example.com',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString(),app_metadata:{provider:'email'},user_metadata:{}};
  const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const token=`${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})}.fixture`;
  let recorded=false;
  const lessons=()=>blpModules.map((m,i)=>({id:`lesson-${i}`,course_id:course.id,title:m.title,position:i+1,starts_at:'2026-10-20T22:00:00Z',published:true,content:'Workbook activity fixture',quiz:[],youtube_id:'',meeting_url:'',has_recording:recorded&&i===0}));
  await page.route('**/auth/v1/**',r=>r.fulfill({json:{access_token:token,refresh_token:'fixture-refresh',expires_in:3600,token_type:'bearer',user}}));
  await page.route('**/api/lms-coach**',r=>r.fulfill({json:{available:{},consent_accepted:false,onboarding_completed:false,access:{active:true,ends_on:null},history:[],notes:'',context:{}}}));
  await page.route('**/api/lms-profile**',r=>r.fulfill({json:{profile:{full_name:'Preview Student',avatar_url:''}}}));
  await page.route('**/api/lms/**',r=>{
    const action=new URL(r.request().url()).pathname.split('/').at(-1);
    if(action==='registration_course')return r.fulfill({json:{course}});
    if(action==='catalog')return r.fulfill({json:{courses:[],banks:[],stripe:false}});
    if(action==='dashboard')return r.fulfill({json:{orders:[{id:'fixture-order',course_id:course.id,status:'granted'}],progress:[]}});
    if(action==='course')return r.fulfill({json:{course,lessons:lessons()}});
    return r.fulfill({status:400,json:{error:'Unexpected fixture operation'}});
  });
  await page.goto('/training-center/account?mode=signin&course=blp-digital-skills-workshop');
  await page.getByLabel('Email address',{exact:true}).fill(user.email);
  await page.getByLabel('Password',{exact:true}).fill('Preview-Password-123!');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  for(const module of blpModules){
    await page.getByRole('button',{name:new RegExp(module.title)}).click();
    await expect(page.getByRole('heading',{name:'Video available after training'})).toBeVisible();
    await expect(page.getByText('Recording coming after training',{exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Mark lesson complete'})).toHaveCount(0);
  }
  await page.getByRole('button',{name:/Welcome and your business goals/}).click();
  await page.locator('.lms-lesson-cover').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.locator('.lms-content').screenshot({path:`/tmp/blp-locked-preview-${test.info().project.name}.png`});
  recorded=true;await page.reload();
  await page.getByRole('button',{name:/Welcome and your business goals/}).click();
  await expect(page.getByRole('button',{name:'Play your private recording'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Mark lesson complete'})).toBeVisible();
  await expect(page.getByText('Recording coming after training',{exact:true})).toHaveCount(0);
});
