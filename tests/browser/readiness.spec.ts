import { test, expect } from '@playwright/test';

// Browser transport fixtures keep verification from sending messages or creating real leads.
test('contact preserves input on failure and only shows success after acceptance', async ({ page }) => {
  let succeed = false;
  await page.route('**/api/submissions', route => route.fulfill({ status: succeed ? 201 : 503, contentType: 'application/json', body: JSON.stringify(succeed ? { success: true } : { success: false, error: 'Unable to save your inquiry' }) }));
  await page.goto('/contact');
  await page.getByLabel('Full Name').fill('Example Person');
  await page.getByLabel('Email Address').fill('person@example.com');
  await page.locator('textarea').fill('A test inquiry; never delivered.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('form').getByRole('alert')).toHaveText('Unable to save your inquiry');
  await expect(page.getByLabel('Full Name')).toHaveValue('Example Person');
  succeed = true;
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('button', { name: 'Send another message' })).toBeVisible();
});

test('main pages render without hydration errors or horizontal overflow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/services', '/products', '/about', '/portfolio', '/blog', '/contact', '/get-started', '/admin']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toHaveText('');
    await expect(page.locator('h1').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${path} overflows`).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test('all privileged APIs reject anonymous requests', async ({ request }) => {
  const paths = ['/api/admin/invite-user', '/api/admin/google-credentials', '/api/help/embeddings', '/api/help/ask-ai', '/api/help/articles', '/api/help/feedback', '/api/seo/generate-article', '/api/seo/dataforseo', '/api/auth/google', '/api/auth/google/disconnect', '/api/notify-submission'];
  for (const path of paths) {
    const response = await request.post(path, { data: {} });
    expect(response.status(), path).toBe(401);
  }
  for (const path of ['/api/analytics/ga4','/api/analytics/search-console','/api/analytics/connection-status','/api/admin/google-credentials']) {
    expect((await request.get(path)).status(), path).toBe(401);
  }
  expect((await request.put('/api/help/articles/00000000-0000-4000-8000-000000000002', { data: {} })).status()).toBe(401);
  expect((await request.delete('/api/help/articles/00000000-0000-4000-8000-000000000002')).status()).toBe(401);
});

test('malformed public submissions are rejected without persistence', async ({ request }) => {
  expect((await request.post('/api/submissions', { data: { contact_name: 'Test', contact_email: 'bad', project_type: 'website' } })).status()).toBe(400);
  expect((await request.post('/api/newsletter', { data: { email: 'bad' } })).status()).toBe(400);
});

test('newsletter reports saved subscriptions only after API acceptance', async ({ page }) => {
  await page.route('**/api/newsletter', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"success":false}' }));
  await page.goto('/blog/web-development-vanuatu-business-growth');
  await page.getByPlaceholder('Enter your email').fill('person@example.com');
  await page.getByRole('button', { name: 'Subscribe', exact: true }).click();
  await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible();
  await expect(page.getByText('Thanks! Your subscription has been saved.')).not.toBeVisible();
});

test('project wizard preserves details after a failed save and accepts a retry', async ({ page }) => {
  let succeed = false;
  let payload: Record<string, unknown> = {};
  await page.route('**/api/submissions', route => {
    payload = route.request().postDataJSON();
    return route.fulfill({ status: succeed ? 201 : 503, contentType: 'application/json', body: JSON.stringify(succeed ? { success: true } : { error: 'Inquiry could not be saved' }) });
  });
  await page.goto('/get-started', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Website.*Business website/ }).click();
  for (let step = 1; step <= 4; step++) await page.getByRole('button', { name: 'Continue →' }).click();
  await page.getByRole('button', { name: '$1,000 - $3,000', exact: true }).click();
  await page.getByRole('button', { name: 'Flexible', exact: true }).click();
  await page.getByRole('button', { name: 'Continue →' }).click();
  await page.getByPlaceholder('John Smith').fill('Example Person');
  await page.getByPlaceholder('john@company.com').fill('person@example.com');
  await page.getByRole('button', { name: 'Submit Project →' }).click();
  await expect(page.getByText('Inquiry could not be saved', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('John Smith')).toHaveValue('Example Person');
  expect(payload.contact_email).toBe('person@example.com');
  expect(payload.budget_range).toBe('1000-3000');
  succeed = true;
  await page.getByRole('button', { name: 'Submit Project →' }).click();
  await expect(page.getByRole('heading', { name: 'Thank You, Example Person!' })).toBeVisible();
});
