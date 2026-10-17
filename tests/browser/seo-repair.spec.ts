import { test, expect } from '@playwright/test';

const origin = 'https://pacificwavedigital.com';
const paths = ['/', '/services/web-development', '/services/seo', '/services/ecommerce', '/services/ai-automation', '/services/cloud-hosting'];

test('commercial pages return canonical HTML for visitors and crawlers', async ({ request }) => {
  for (const path of paths) {
    for (const userAgent of ['Mozilla/5.0', 'Googlebot/2.1 (+http://www.google.com/bot.html)']) {
      const response = await request.get(path, { headers: { 'User-Agent': userAgent } });
      expect(response.status(), `${path} ${userAgent}`).toBe(200);
      const html = await response.text();
      const head = html.split('</head>')[0];
      const canonicals = head.match(/<link[^>]+rel="canonical"[^>]*>/g) || [];
      expect(canonicals, path).toHaveLength(1);
      const href = canonicals[0]?.match(/href="([^"]+)"/)?.[1];
      expect(new URL(href || 'about:blank').href, path).toBe(new URL(path, origin).href);
      expect(html.toLowerCase()).not.toContain('747live.bet');
      expect(head).not.toMatch(/name="robots"[^>]+content="[^"]*noindex/);
      expect(response.headers()['x-robots-tag'] || '').not.toContain('noindex');
    }
  }
});

test('contact links, structured data and Analytics use the confirmed PWD details', async ({ page }) => {
  // Observe installation without sending synthetic analytics events to production.
  await page.route(/^https:\/\/([^/]+\.)?googletagmanager\.com\//, route => route.fulfill({ status: 200, body: '' }));
  await page.route(/^https:\/\/([^/]+\.)?google-analytics\.com\//, route => route.abort());
  await page.goto('/contact');
  await expect(page.locator('a[href="tel:+6785288141"]').first()).toBeVisible();
  await expect(page.locator('a[href="tel:+6787774567"]')).toHaveCount(0);
  await expect(page.locator('script[src*="googletagmanager.com/gtag/js"]')).toHaveAttribute('src', /id=G-6SF5VLD82W$/);
  const businesses = await page.locator('script[type="application/ld+json"]').allTextContents();
  const business = businesses.map(value => JSON.parse(value)).find((value: { '@type': string }) => value['@type'] === 'LocalBusiness');
  expect(business.telephone).toBe('+678-528-8141');
  expect(business.address.streetAddress).toBe('Lot 42, Peacock Estate');
});


test('homepage connects Vanuatu and Pacific visitors to all service pages', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Web Design, Apps & AI in Vanuatu | Pacific Wave Digital');
  await expect(page.locator('h1')).toContainText('for Vanuatu and the Pacific');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  for (const name of ['Web Design', 'Web Development', 'Custom Software', 'AI & Automation', 'SEO Services', 'Digital Marketing', 'E-commerce', 'Mobile Apps', 'Hosting & Maintenance']) {
    await expect(page.getByRole('link', { name: `Explore ${name}`, exact: true })).toHaveCount(1);
  }
  await page.getByRole('link', { name: 'Explore AI & Automation', exact: true }).click();
  await expect(page).toHaveURL(/\/services\/ai-automation$/);
  for (const slug of ['ai-automation', 'cloud-hosting']) {
    const response = await page.goto(`/services/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Vanuatu');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/services/${slug}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const slug of ['ai-automation', 'cloud-hosting']) expect(xml).toContain(`${origin}/services/${slug}</loc>`);
});


test('service menu links remain reachable on desktop and mobile', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Toggle menu', exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole('button', { name: 'Toggle services menu', exact: true }).click();
  } else {
    await page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true }).hover();
  }
  await page.getByRole('navigation').getByRole('link', { name: 'Hosting & Maintenance', exact: true }).click();
  await expect(page).toHaveURL(/\/services\/cloud-hosting$/);
});
