import { test, expect, type Page } from '@playwright/test';

async function analyticsFixture(page: Page) {
  await page.route(/^https:\/\/([^/]+\.)?googletagmanager\.com\//, route => route.fulfill({ status: 200, body: '' }));
  await page.route(/^https:\/\/([^/]+\.)?google-analytics\.com\//, route => route.abort());
}
async function captchaFixture(page: Page) {
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', route => route.fulfill({ contentType:'application/javascript', body:"window.turnstile={render:function(el,o){queueMicrotask(function(){o.callback('fixture-token')});return 'fixture'},remove:function(){},reset:function(){}};" }));
}
async function events(page: Page) {
  return page.evaluate(() => ((window as Window & { dataLayer?: Array<ArrayLike<unknown>> }).dataLayer || []).map(item => Array.from(item)).filter(item => item[0] === 'event' && ['generate_lead','contact_phone_click','contact_whatsapp_click'].includes(String(item[1]))));
}
async function contact(page: Page, name = 'Example Person') {
  await page.goto('/contact');
  await page.getByLabel('Full Name').fill(name);
  await page.getByLabel('Email Address').fill('steve@pacificwavedigital.com');
  await page.locator('textarea').fill('This is a clearly labelled PWD delivery verification enquiry. Please ignore this QA message.');
  await page.getByLabel('Service Needed').selectOption('web-development');
}
async function quote(page: Page, name = 'Example Person') {
  await page.goto('/get-started');
  await page.getByRole('button', { name: /Website.*Business website/ }).click();
  await page.getByPlaceholder("Tell us a bit about what you're looking to build...").fill('PWD delivery verification only. This is a QA project enquiry, not a customer request.');
  for (let step=1;step<=4;step++) await page.getByRole('button',{name:'Continue →'}).click();
  await page.getByRole('button',{name:'$1,000 - $3,000',exact:true}).click();
  await page.getByRole('button',{name:'Flexible',exact:true}).click();
  await page.getByRole('button',{name:'Continue →'}).click();
  await page.getByPlaceholder('John Smith').fill(name);
  await page.getByPlaceholder('john@company.com').fill('steve@pacificwavedigital.com');
}

test('contact counts only a saved enquiry, preserves failed input and deduplicates receipts',async({page})=>{
  await analyticsFixture(page); await captchaFixture(page);
  let status=503;
  await page.route('**/api/submissions',route=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===201?{success:true,submission_id:'11111111-1111-4111-8111-111111111111'}:{success:false,error:'Not saved'})}));
  await contact(page);
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.locator('form').getByRole('alert')).toHaveText('Not saved');
  expect(await events(page)).toHaveLength(0);
  await expect(page.getByLabel('Full Name')).toHaveValue('Example Person');
  status=201;
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.getByText('Message Sent!',{exact:true})).toBeVisible();
  const recorded=await events(page);
  expect(recorded.filter(x=>x[1]==='generate_lead')).toHaveLength(1);
  expect(recorded[0][2]).toMatchObject({form_id:'contact'});
  expect(JSON.stringify(recorded)).not.toMatch(/steve@|Example|QA message|11111111/);
  await page.getByRole('button',{name:'Send another message'}).click();
  await page.getByLabel('Full Name').fill('Example Person');
  await page.getByLabel('Email Address').fill('steve@pacificwavedigital.com');
  await page.locator('textarea').fill('Same receipt fixture, never delivered.');
  await page.getByRole('button',{name:'Send Message',exact:true}).click();
  await expect(page.getByText('Message Sent!',{exact:true})).toBeVisible();
  expect((await events(page)).filter(x=>x[1]==='generate_lead')).toHaveLength(1);
});

test('project wizard emits a lead only after saved acceptance',async({page})=>{
  await analyticsFixture(page); await captchaFixture(page);
  await page.route('**/api/submissions',route=>route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({success:true,submission_id:'22222222-2222-4222-8222-222222222222',notification:'pending'})}));
  await quote(page);
  expect(await events(page)).toHaveLength(0);
  await page.getByRole('button',{name:'Submit Project →'}).click();
  await expect(page.getByRole('heading',{name:'Thank You, Example Person!'})).toBeVisible();
  const recorded=await events(page);
  expect(recorded.filter(x=>x[1]==='generate_lead')).toHaveLength(1);
  expect(recorded[0][2]).toMatchObject({form_id:'project_quote'});
});

test('phone and WhatsApp contact clicks count once without leaking destination or message',async({page})=>{
  await analyticsFixture(page);
  await page.goto('/contact');
  // Prevent opening phone/WhatsApp apps during verification. The real click still bubbles.
  await page.evaluate(()=>document.addEventListener('click',e=>{if((e.target as Element).closest('a[href^="tel:"],a[href^="https://wa.me/"]'))e.preventDefault();},true));
  await page.locator('a[href="tel:+6785288141"]').first().click();
  await page.getByRole('link',{name:/WhatsApp Message us on WhatsApp/}).click();
  const recorded=await events(page);
  expect(recorded.map(x=>x[1])).toEqual(['contact_phone_click','contact_whatsapp_click']);
  expect(JSON.stringify(recorded)).not.toMatch(/5288141|wa.me|steve@/);
  expect(await page.locator('a[href="https://wa.me/6785288141"]').count()).toBe(1);
});


test('contact cannot lose an enquiry through native submission before JavaScript is ready', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/contact`);
  await expect(page.getByLabel('Full Name')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Send Message', exact: true })).toBeDisabled();
  await expect(page.getByText('Enable JavaScript to send this form, or use the email, phone or WhatsApp links to contact us.')).toBeVisible();
  await context.close();
});
