import { test, expect } from '@playwright/test';

const widgetScript = `window.turnstile = {
 render: (element, options) => {
   window.__verificationOptions = options;
   window.__verificationMounts = (window.__verificationMounts || 0) + 1;
   setTimeout(() => options.callback('isolated-browser-fixture'), 20);
   return 'fixture';
 },
 remove: () => {}, reset: () => {}
};`;

test('signup recovers a failed verification download without losing student details', async ({ page }) => {
 let downloads = 0;
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', async route => {
   downloads++;
   if (downloads === 1) return route.abort('failed');
   return route.fulfill({ contentType: 'application/javascript', body: widgetScript });
 });
 await page.goto('/training-center/account?mode=signup');
 await page.getByLabel('Full name', { exact: true }).fill('Recovery Test Student');
 const submit = page.getByRole('button', { name: 'Create my account', exact: true });
 await expect(submit).toBeDisabled();
 await expect(page.getByRole('status')).toContainText('Human verification could not finish');
 await page.getByRole('button', { name: 'Retry human verification' }).click();
 await expect(submit).toBeEnabled();
 await expect(page.getByRole('status')).toContainText('Human verification complete');
 await expect(page.getByLabel('Full name', { exact: true })).toHaveValue('Recovery Test Student');
 expect(downloads).toBe(2);
 // Exercise the provider's expiry callback; a fresh widget/token must recover.
 await page.evaluate(() => {
   const fixture = window as unknown as { __verificationOptions: { 'expired-callback': () => void } };
   fixture.__verificationOptions['expired-callback']();
 });
 await expect.poll(() => page.evaluate(() => (window as unknown as { __verificationMounts: number }).__verificationMounts)).toBe(2);
 await expect(submit).toBeEnabled();
 await expect(page.getByRole('status')).toContainText('Human verification complete');
 // Provider challenge failure after success must clear the old token and recover.
 await page.evaluate(() => {
   const fixture = window as unknown as { __verificationOptions: { 'error-callback': () => void } };
   fixture.__verificationOptions['error-callback']();
 });
 await expect(submit).toBeDisabled();
 await page.getByRole('button', { name: 'Retry human verification' }).click();
 await expect(submit).toBeEnabled();
 await page.getByRole('button', { name: 'Already a student? Sign in' }).click();
 await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
 await page.getByRole('button', { name: /New here/ }).click();
 await expect(submit).toBeEnabled();
 await submit.scrollIntoViewIfNeeded();
 await page.screenshot({ path: `/tmp/signup-verification-${test.info().project.name}.png` });
});

test('stalled verification displays a retry and never enables unverified registration', async ({ page }) => {
 await page.clock.install();
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', route => route.fulfill({ contentType: 'application/javascript', body: '/* Simulate stalled initialization. */' }));
 await page.goto('/training-center/account?mode=signup');
 await expect(page.getByRole('status')).toContainText('Loading human verification');
 await page.clock.fastForward(31_000);
 await expect(page.getByRole('status')).toContainText('Human verification could not finish');
 await expect(page.getByRole('button', { name: 'Create my account', exact: true })).toBeDisabled();
 await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', route => route.fulfill({ contentType: 'application/javascript', body: widgetScript }));
 await page.getByRole('button', { name: 'Retry human verification' }).click();
 await page.clock.resume();
 await expect(page.getByRole('button', { name: 'Create my account', exact: true })).toBeEnabled();
});


test('real provider automatically verifies an anonymous student signup', async ({ page }) => {
 test.skip(process.env.PWD_REAL_WIDGET_CHECK !== '1', 'Explicit read-only provider check');
 await page.goto('/training-center/account?mode=signup');
 await expect(page.getByRole('status')).toContainText('Human verification complete', { timeout: 45_000 });
 const submit = page.getByRole('button', { name: 'Create my account', exact: true });
 await expect(submit).toBeEnabled();
 await submit.scrollIntoViewIfNeeded();
 await page.screenshot({ path: `/tmp/signup-live-verification-${test.info().project.name}.png` });
});
