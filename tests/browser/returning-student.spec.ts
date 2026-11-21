import { test, expect, type Page } from '@playwright/test';

test.use({ navigationTimeout: 60000 });
const checkedExpect = expect.configure({ timeout: 25000 });

const slug = 'one-on-one-mentorship';
const course = { id: 'c3ac2a74-1775-409b-8c16-8b8109cc313c', slug, title: 'AI, Coding & Software Development — One-on-One', description: 'Private software training', amount: 250000, currency: 'VUV', published: true, enrollment_open: true, private_sessions: true };
const address = 'returning-student@example.com';
async function setup(page: Page, code = 'ACCOUNT_EXISTS') {
  const user = { id: '22222222-2222-4222-8222-222222222222', email: address, aud: 'authenticated', role: 'authenticated', created_at: new Date().toISOString(), app_metadata: { provider: 'email' }, user_metadata: {} };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600, role: 'authenticated' })}.fixture`;
  let signups = 0, signins = 0, recoveries = 0, enrolled = false;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', route => route.fulfill({ contentType: 'application/javascript', body: `window.turnstile={render:(_e,o)=>{setTimeout(()=>o.callback('test-token'),5);return 'fixture'},remove:()=>{},reset:()=>{}};` }));
  await page.route('**/auth/v1/**', async route => {
    if (route.request().url().includes('/token')) {
      signins++;
      const body = route.request().postDataJSON();
      if (body.password !== 'Existing-Password-123!') return route.fulfill({ status: 400, json: { error_code: 'invalid_credentials', msg: 'Invalid login credentials' } });
    }
    return route.fulfill({ json: route.request().url().includes('/user') ? user : { access_token: token, refresh_token: 'fixture-refresh', expires_in: 3600, token_type: 'bearer', user } });
  });
  await page.route('**/api/lms-*', route => route.fulfill({ json: { items: [], notifications: [], messages: [], unread: 0 } }));
  await page.route('**/api/lms-profile**', route => route.fulfill({ json: { profile: { full_name: 'Returning Student', avatar_url: '' } } }));
  await page.route('**/api/lms/**', async route => {
    const action = new URL(route.request().url()).pathname.split('/').at(-1);
    if (action === 'account') {
      if (route.request().postDataJSON().mode === 'recovery') { recoveries++; return route.fulfill({ json: { success: true } }); }
      signups++;
      return route.fulfill({ status: code === 'ACCOUNT_CREATED_SIGN_IN' ? 503 : 409, json: { success: false, code, error: code === 'ACCOUNT_EXISTS' ? 'An account already uses this email.' : 'Your account was created, but registration could not finish.' } });
    }
    if (action === 'registration_course') return route.fulfill({ json: { course } });
    if (action === 'catalog') return route.fulfill({ json: { courses: [course], banks: [], stripe: false, sandbox: false } });
    if (action === 'dashboard') return route.fulfill({ json: { orders: enrolled ? [{ id: '33333333-3333-4333-8333-333333333333', course_id: course.id, status: 'pending', amount: 250000, currency: 'VUV', name: 'Returning Student', phone: '+678 5551234', attendance: 'online' }] : [], progress: [] } });
    if (action === 'order') { enrolled = true; expect(route.request().postDataJSON().course_id).toBe(course.id); return route.fulfill({ json: { success: true } }); }
    return route.fulfill({ json: {} });
  });
  return { counts: () => ({ signups, signins, recoveries }), errors };
}
async function fillSignup(page: Page) {
  await page.getByLabel('Full name', { exact: true }).fill('Returning Student');
  await page.getByLabel('Phone / WhatsApp').fill('+678 5551234');
  await page.getByLabel('Location (town, island or country)').fill('Port Vila');
  await page.getByLabel('How would you like to attend?').selectOption('online');
  await page.getByLabel('Email address', { exact: true }).fill(address);
  await page.getByLabel('Password', { exact: true }).fill('New-Password-Not-Saved!');
  await page.locator('input[name=privacy]').check();
  await page.getByRole('button', { name: 'Register & continue to payment' }).click();
}

test('returning students can sign in above signup fields without human verification and retain the course after reload', async ({ page }) => {
  const fixture = await setup(page);
  await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', route => route.abort());
  await page.goto(`/training-center/account?mode=signup&course=${slug}`);
  const signin = page.getByRole('button', { name: 'Sign in to your existing account' });
  expect(await signin.evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector('input[name=name]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.getByLabel('Email address', { exact: true }).fill(address);
  await signin.click();
  await checkedExpect(page).toHaveURL(new RegExp(`mode=signin&course=${slug}`));
  await checkedExpect(page.getByLabel('Email address', { exact: true })).toHaveValue(address);
  await page.reload();
  await checkedExpect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByLabel('Email address', { exact: true }).fill(address);
  await page.getByLabel('Password', { exact: true }).fill('Existing-Password-123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await checkedExpect(page).toHaveURL(new RegExp(`/checkout\\?course=${slug}`));
  await checkedExpect(page.getByRole('heading', { name: 'Your registration details' })).toBeVisible();
  await page.getByLabel('Full name', { exact: true }).fill('Returning Student');
  await page.getByLabel('Phone / WhatsApp').fill('+678 5551234');
  await page.getByLabel('How will you attend?', { exact: true }).selectOption('online');
  await page.locator('input[type=checkbox]').check();
  await page.getByRole('button', { name: /Save.*registration/ }).click();
  await checkedExpect(page.getByRole('heading', { name: 'Your registration details' })).toHaveCount(0);
  await page.reload();
  await checkedExpect(page.getByRole('heading', { name: 'Your registration details' })).toHaveCount(0);
  expect(fixture.counts()).toEqual({ signups: 0, signins: 1, recoveries: 0 });
  expect(fixture.errors).toEqual([]);
});

for (const code of ['ACCOUNT_EXISTS', 'ACCOUNT_CREATED_SIGN_IN']) test(`${code} hands off to sign-in, keeps email/course, clears the new password and supports recovery`, async ({ page }) => {
  const fixture = await setup(page, code);
  await page.goto(`/training-center/account?mode=signup&course=${slug}`);
  await fillSignup(page);
  await checkedExpect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await checkedExpect(page).toHaveURL(new RegExp(`mode=signin&course=${slug}`));
  await checkedExpect(page.getByLabel('Email address', { exact: true })).toHaveValue(address);
  await checkedExpect(page.getByLabel('Password', { exact: true })).toHaveValue('');
  await checkedExpect(page.getByRole('status').filter({ hasText: code === 'ACCOUNT_EXISTS' ? 'You already have an account' : 'Your account is ready' })).toBeVisible();
  expect(fixture.counts().signins).toBe(0);
  await page.getByLabel('Password', { exact: true }).fill('Wrong-Password-123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await checkedExpect(page.locator('.lms-alert[role=alert]')).toContainText('Invalid login credentials');
  await page.getByRole('button', { name: 'Forgot password?' }).click();
  await checkedExpect(page.locator('.lms-alert[role=alert]')).toHaveCount(0);
  await checkedExpect(page.getByLabel('Email address', { exact: true })).toHaveValue(address);
  await page.getByRole('button', { name: 'Send reset email' }).click();
  await checkedExpect(page.getByRole('status')).toContainText('password reset email will arrive');
  await page.reload();
  await checkedExpect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
  await page.getByRole('button', { name: 'New here? Create an account' }).click();
  await page.getByRole('button', { name: 'Sign in to your existing account' }).click();
  await page.getByLabel('Email address', { exact: true }).fill(address);
  await page.getByLabel('Password', { exact: true }).fill('Existing-Password-123!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await checkedExpect(page).toHaveURL(new RegExp(`/checkout\\?course=${slug}`));
  expect(fixture.counts()).toEqual({ signups: 1, signins: 2, recoveries: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(fixture.errors).toEqual([]);
  await page.screenshot({ path: `/tmp/returning-student-${code}-${test.info().project.name}.png`, fullPage: true });
});

test('unrelated registration errors stay on signup and keep entered details', async ({ page }) => {
  const fixture = await setup(page, 'OTHER_ERROR');
  await page.goto(`/training-center/account?mode=signup&course=${slug}`);
  await fillSignup(page);
  await checkedExpect(page.locator('.lms-alert[role=alert]')).toContainText('Your account was created');
  await checkedExpect(page.getByRole('heading', { name: 'Create your student account' })).toBeVisible();
  await checkedExpect(page.getByLabel('Email address', { exact: true })).toHaveValue(address);
  expect(fixture.counts().signins).toBe(0);
});
