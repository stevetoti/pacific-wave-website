import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

type Fixture={courseId:string;ref:string;users:{id:string;role:string;session:unknown}[]};
test.beforeEach(async({context,page,baseURL})=>{
 await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
 if(process.env.NOVEMBER_STAGE_COOKIE){
  const {cookie}=JSON.parse(await readFile(process.env.NOVEMBER_STAGE_COOKIE,'utf8')) as {cookie:string};
  await context.addCookies(cookie.split('; ').map(pair=>{const i=pair.indexOf('=');return {name:pair.slice(0,i),value:pair.slice(i+1),url:baseURL!,httpOnly:true,secure:true};}));
 }
});
test('new cohort is first, with correct dates, fee and a course-specific signup',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/training-center');
 const card=page.locator('article').filter({hasText:'Build Your Online Business — November–December 2026'});
 await expect(card).toBeVisible();
 await expect(page.locator('article').first()).toContainText('November–December 2026');
 await expect(card).toContainText('16 November–19 December');
 await expect(card).toContainText('15 live sessions');
 await expect(card).toContainText('35,000');
 await card.getByRole('link',{name:'Register',exact:true}).click();
 await expect(page).toHaveURL(/course=vanuatu-november-2026/);
 await expect(page.getByRole('heading',{name:'Create your student account',exact:true})).toBeVisible();
 await expect(page.getByLabel('Phone / WhatsApp')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`/tmp/november-signup-${test.info().project.name}.png`,fullPage:true});
 await page.goto('/vanuatu-training');
 await expect(page.locator('h1')).toContainText('Build Your Online Business');
 await expect(page.getByText('15',{exact:true})).toBeVisible();
 await expect(page.getByText(/revision on 14, 17 and 19 December/)).toBeVisible();
 await expect(page.getByRole('link',{name:/Join class/})).toHaveAttribute('href',/course=vanuatu-november-2026/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`/tmp/november-landing-${test.info().project.name}.png`,fullPage:true});
 expect(errors).toEqual([]);
});

test('enrolled student saves a revision, leaves, returns and reloads with the correct dates',async({page,context,baseURL})=>{
 test.skip(!process.env.NOVEMBER_QA_FIXTURE,'Requires isolated synthetic enrolment fixture.');
 const fixture=JSON.parse(await readFile(process.env.NOVEMBER_QA_FIXTURE!,'utf8')) as Fixture;
 const student=fixture.users.find(u=>u.role==='enrolled')!;
 await context.addInitScript(({origin,key,session})=>{if(location.origin===origin)localStorage.setItem(key,JSON.stringify(session));},{origin:new URL(baseURL!).origin,key:`sb-${fixture.ref}-auth-token`,session:student.session});
 // This legacy dashboard endpoint also dispatches the global email queue. Supply
 // only this QA student's dashboard locally; course/workbook/save/export use real APIs.
 await page.route('**/api/lms/dashboard',r=>r.fulfill({json:{orders:[{id:'synthetic-dashboard-only',course_id:fixture.courseId,user_id:student.id,status:'granted',name:'November QA enrolled'}],progress:[]}}));
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/training-center/course/${fixture.courseId}`);
 await expect(page.getByRole('heading',{name:'Build Your Online Business — November–December 2026',exact:true})).toBeVisible();
 await expect(page.getByText(/Follow 15 dated sessions/)).toBeVisible();
 await page.getByRole('button',{name:'Open workbook',exact:true}).click();
 const select=page.getByLabel('Choose a class',{exact:true});
 await expect(select.locator('option')).toHaveCount(15);
 await expect(select.locator('option').first()).toContainText('16 Nov');
 await expect(select.locator('option').last()).toContainText('19 Dec');
 await select.selectOption('14');
 await expect(page.getByRole('heading',{name:'Final revision, project showcase and next steps',exact:true})).toBeVisible();
 const answer=`QA ${test.info().project.name}: my improved business project`;
 await page.locator('#nov-l15-f01').fill(answer);
 await expect(page.getByText('All changes saved',{exact:true})).toBeVisible();
 await page.goto('/training-center');
 await page.goto(`/training-center/course/${fixture.courseId}`);
 await page.getByRole('button',{name:'Open workbook',exact:true}).click();
 await page.getByLabel('Choose a class',{exact:true}).selectOption('14');
 await expect(page.locator('#nov-l15-f01')).toHaveValue(answer);
 await page.reload();
 await page.getByRole('button',{name:'Open workbook',exact:true}).click();
 await page.getByLabel('Choose a class',{exact:true}).selectOption('14');
 await expect(page.locator('#nov-l15-f01')).toHaveValue(answer);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.getByRole('heading',{name:'Final revision, project showcase and next steps',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:`/tmp/november-workbook-${test.info().project.name}.png`});
 expect(errors).toEqual([]);
});

// A signed-in applicant bypasses signup and sees the course summary directly.
test('pending student checkout shows the selected cohort schedule',async({page,context,baseURL})=>{
 test.skip(!process.env.NOVEMBER_QA_FIXTURE,'Requires isolated synthetic enrolment fixture.');
 const fixture=JSON.parse(await readFile(process.env.NOVEMBER_QA_FIXTURE!,'utf8')) as Fixture;
 const student=fixture.users.find(u=>u.role==='pending')!;
 await context.addInitScript(({origin,key,session})=>{if(location.origin===origin)localStorage.setItem(key,JSON.stringify(session));},{origin:new URL(baseURL!).origin,key:`sb-${fixture.ref}-auth-token`,session:student.session});
 await page.route('**/api/lms/dashboard',r=>r.fulfill({json:{orders:[],progress:[]}}));
 await page.goto('/training-center/checkout?course=vanuatu-november-2026');
 const summary=page.locator('.lms-checkout-course');
 await expect(summary).toContainText('15 live classes · 30 teaching hours');
 await expect(summary).toContainText('16 November–19 December · Mon, Thu & Sat');
 await expect(summary).toContainText('3–5 pm Vanuatu time');
 await expect(summary).not.toContainText('October');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:`/tmp/november-checkout-${test.info().project.name}.png`,fullPage:true});
 await page.goto('/training-center/checkout?course=vanuatu-october-2026');
 await expect(summary).toContainText('12 live classes · 24 teaching hours');
 await expect(summary).toContainText('5 October–31 October · Mon, Thu & Sat');
});
