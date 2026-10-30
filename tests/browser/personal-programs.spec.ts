import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {personalOffers} from '../../src/lib/lms/personal-programs';
type Fixture={ref:string;users:{id:string;role:string;session:unknown}[];courses:{id:string;slug:string;title:string;amount:number}[];orders:{id:string;user_id:string;course_id:string;amount:number;currency:string;status:string}[]};
test.beforeEach(async({context,page,baseURL})=>{
 await page.route(/google-analytics\.com|googletagmanager\.com/,r=>r.abort());
 if(process.env.PERSONAL_STAGE_COOKIE){const{cookie}=JSON.parse(await readFile(process.env.PERSONAL_STAGE_COOKIE,'utf8')) as{cookie:string};await context.addCookies(cookie.split('; ').map(pair=>{const i=pair.indexOf('=');return{name:pair.slice(0,i),value:pair.slice(i+1),url:baseURL!,httpOnly:true,secure:true};}));}
});
test('three personal offers explain prices, structured teaching and separate mentorship',async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/training-center');for(const p of personalOffers){const card=page.locator('.lms-catalog-grid article').filter({hasText:p.title});await expect(card).toContainText(p.amount.toLocaleString('en-US'));await expect(card).toContainText('follow-up mentorship');}
 for(const p of personalOffers){
  await page.goto('/training-center/programs/'+p.slug);await expect(page.getByRole('heading',{name:p.title,exact:true,level:1})).toBeVisible();await expect(page.locator('.lms-program-price')).toContainText(p.amount.toLocaleString('en-US'));await expect(page.locator('.lms-personal-facts')).toContainText(`${p.sessions.length} lessons`);await expect(page.locator('.lms-personal-facts')).toContainText(`${p.sessions.length*1.5} hours`);await expect(page.locator('.lms-personal-facts')).toContainText('90 minutes');await expect(page.locator('.lms-personal-facts')).toContainText(`${p.mentorshipMonths} month`);
  await expect(page.locator('.lms-personal-comparison')).toContainText('three private sessions every week');await expect(page.locator('.lms-personal-comparison')).toContainText('about once a week');if(p.teachingWeeks===12)await expect(page.locator('.lms-personal-comparison')).toContainText('after both training phases');
  await expect(page.locator('.lms-personal-topic')).toHaveCount(p.topics.length);await expect(page.locator('.lms-personal-project')).toContainText(p.projectTitle);if(p.teachingWeeks===6&&p.amount===150000){for(const topic of ['Mastering Digi Assist AI','AI website building & ecommerce','Google listings & search visibility','Facebook & digital marketing','Affiliate marketing','Business creation & your digital agency'])await expect(page.locator('.lms-personal-topics')).toContainText(topic);}if(p.amount!==150000){await expect(page.locator('.lms-personal-agent')).toContainText('Meetings & next steps');await expect(page.locator('.lms-personal-project')).toContainText('software project of your choice');}for(const img of await page.locator('.lms-personal-topic-art img').all())await img.scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('.lms-personal-topic-art img').evaluateAll(imgs=>imgs.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
  await page.locator('.lms-personal-session-list summary').click();await expect(page.locator('.lms-personal-session-list li')).toHaveCount(p.sessions.length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`/tmp/personal-${p.slug}-${test.info().project.name}.png`,fullPage:true});
  await page.getByRole('link',{name:'Enrol in this programme',exact:true}).click();await expect(page).toHaveURL(new RegExp(`mode=signup&course=${p.slug}`));await expect(page.locator('.lms-notice')).toContainText(p.amount.toLocaleString('en-US'));
 }
 expect(errors).toEqual([]);
});
test('pending private student checkout retains the correct offer and price across reload',async({page,context,baseURL})=>{
 test.skip(!process.env.PERSONAL_QA_FIXTURE,'Requires temporary own-order fixtures');const f=JSON.parse(await readFile(process.env.PERSONAL_QA_FIXTURE!,'utf8')) as Fixture;const student=f.users.find(u=>u.role==='pending')!;
 await context.addInitScript(({origin,key,session})=>{if(location.origin===origin)localStorage.setItem(key,JSON.stringify(session));},{origin:new URL(baseURL!).origin,key:`sb-${f.ref}-auth-token`,session:student.session});
 // Legacy dashboard dispatches global email work. Supply only this QA student's
 // own dashboard; actual registration/course/checkout content uses real APIs.
 await page.route('**/api/lms/dashboard',r=>r.fulfill({json:{orders:f.orders.filter(o=>o.user_id===student.id),progress:[]}}));
 for(const p of personalOffers){await page.goto('/training-center/checkout?course='+p.slug);const box=page.locator('.lms-checkout-course');await expect(box).toContainText(p.title);await expect(box).toContainText(p.amount.toLocaleString('en-US'));await expect(box).toContainText(`${p.sessions.length} one-on-one lessons`);await expect(box).toContainText(`${p.mentorshipMonths} month`);await page.reload();await expect(box).toContainText(p.amount.toLocaleString('en-US'));await expect(box).toContainText('follow-up mentorship');}
});
test('enrolled student can leave and reopen only their own private lesson roadmap',async({page,context,baseURL})=>{
 test.skip(!process.env.PERSONAL_QA_FIXTURE,'Requires temporary own-order fixtures');const f=JSON.parse(await readFile(process.env.PERSONAL_QA_FIXTURE!,'utf8')) as Fixture;const student=f.users.find(u=>u.role==='learner')!;
 await context.addInitScript(({origin,key,session})=>{if(location.origin===origin)localStorage.setItem(key,JSON.stringify(session));},{origin:new URL(baseURL!).origin,key:`sb-${f.ref}-auth-token`,session:student.session});await page.route('**/api/lms/dashboard',r=>r.fulfill({json:{orders:f.orders.filter(o=>o.user_id===student.id),progress:[]}}));
 for(const p of personalOffers){const c=f.courses.find(c=>c.slug===p.slug)!;await page.goto('/training-center/course/'+c.id);await expect(page.getByRole('heading',{name:p.title,exact:true,level:1})).toBeVisible();await expect(page.getByText('YOUR ONE-ON-ONE LEARNING',{exact:true})).toBeVisible();await page.getByRole('complementary').getByRole('button',{name:/Week 1 1\./}).click();await expect(page.getByRole('heading',{name:'01 · '+p.sessions[0].title,exact:true})).toBeVisible();await expect(page.getByText('Your instructor will upload the video after the training.',{exact:false})).toBeVisible();await page.goto('/training-center');await page.goto('/training-center/course/'+c.id);await page.reload();await page.getByRole('complementary').getByRole('button',{name:/Week 1 1\./}).click();await expect(page.getByRole('heading',{name:'01 · '+p.sessions[0].title,exact:true})).toBeVisible();await expect(page.getByText('Your instructor will upload the video after the training.',{exact:false})).toBeVisible();}
});
