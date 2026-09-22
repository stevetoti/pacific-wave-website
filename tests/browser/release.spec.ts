import { test, expect } from '@playwright/test';

// Read-only regression coverage for the September 2026 partial-source deployment.
test('SEO service pages and training navigation coexist in the release', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Toggle menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation').getByRole('link', { name: 'Training', exact: true }).click();
  await expect(page).toHaveURL(/\/training-center$/);
  await expect(page.getByRole('heading', { name: 'Build Your Online Business in 30 Days' })).toBeVisible();
  for (const slug of ['web-design', 'web-development', 'software-development', 'digital-marketing', 'seo', 'ecommerce', 'mobile-apps']) {
    const response = await page.goto(`/services/${slug}`);
    expect(response?.status(), slug).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), slug).toBe(true);
  }
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const path of ['/training-center', '/vanuatu-training', '/services/web-design', '/services/seo']) expect(xml).toContain(`https://pacificwavedigital.com${path}</loc>`);
  expect(errors).toEqual([]);
});
