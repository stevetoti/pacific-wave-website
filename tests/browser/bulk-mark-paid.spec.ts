import { test, expect } from '@playwright/test';

test('paid status uses only individually checked registrations and survives leave and reload', async ({ page }) => {
  const courseA = '10000000-0000-4000-8000-000000000001', courseB = '10000000-0000-4000-8000-000000000002';
  const courses = [{ id: courseA, title: 'BLP bulk QA', amount: 0, currency: 'VUV', published: true }, { id: courseB, title: 'Other course QA', amount: 35000, currency: 'VUV', published: true }];
  const orders = ['pending','pending','pending','paid','rejected'].map((status,i) => ({ id: `20000000-0000-4000-8000-00000000000${i+1}`, user_id: `30000000-0000-4000-8000-00000000000${i+1}`, course_id: courseA, status, name: `QA Student ${i+1}`, email: `qa${i}@example.test`, phone: '', amount: 0, currency: 'VUV', method: 'grant', attendance: 'online', created_at: '2026-10-20T00:00:00Z' }));
  orders.push({ ...orders[0], id: '20000000-0000-4000-8000-000000000006', course_id: courseB, name: 'Other Student' });
  const user = { id: '40000000-0000-4000-8000-000000000001', email: 'bulk-qa@example.test', aud: 'authenticated', role: 'authenticated' };
  await page.addInitScript(session => localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token', JSON.stringify(session)), { access_token: 'qa.token.signature', refresh_token: 'qa-refresh', expires_at: Math.floor(Date.now()/1000)+3600, expires_in: 3600, token_type: 'bearer', user });
  await page.route('https://rndegttgwtpkbjtvjgnc.supabase.co/**', route => route.fulfill({ json: route.request().url().includes('admin_users') ? { id: user.id, email: user.email, name: 'Bulk QA', role: 'super_admin', site_id: 'pacific-wave-digital', is_active: true } : { user } }));
  let writes = 0, failPreview = false, expectedIds = [orders[0].id];
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.pathname === '/api/lms-bulk-paid') {
      if (req.method() === 'GET') {
        if (failPreview) return route.fulfill({ status: 503, json: { error: 'Could not load pending registrations.' } });
        const c = courses.find(c => c.id === url.searchParams.get('course'))!;
        const selected=url.searchParams.getAll('order_id');
        expect(selected.length).toBeGreaterThan(0);
        const list = orders.filter(o => o.course_id === c.id && o.status === 'pending' && selected.includes(o.id));
        return route.fulfill({ json: { course: c, order_ids: list.map(o => o.id), total: 0, registrations: list.map(o=>({id:o.id,name:o.name,email:o.email})) } });
      }
      const body = req.postDataJSON();
      expect(body.course_id).toBe(courseA); expect(body.order_ids).toEqual(expectedIds);
      writes++; body.order_ids.forEach((id: string) => { orders.find(o => o.id === id)!.status = 'paid'; });
      return route.fulfill({ json: { updated_count: body.order_ids.length, skipped_count: 0, welcome_queued_count: body.order_ids.length } });
    }
    if (req.method() !== 'GET') throw Error('Unexpected mutation');
    return route.fulfill({ json: url.pathname === '/api/lms/admin' ? { courses, orders, lessons: [], banks: [] } : url.pathname === '/api/lms-students' ? { accounts: [] } : url.pathname === '/api/lms-contact' ? { sms_enabled: false, live: false, latest: {} } : {} });
  });
  await page.goto('/admin/training-center');
  await page.getByRole('button', { name: /BLP bulk QA.*View students/ }).click();
  await expect(page.getByRole('button', { name: /Mark.*selected students as paid/ })).toBeDisabled();
  await page.locator('.sr-row').filter({hasText:'QA Student 1'}).getByRole('checkbox').check();
  // Searching for another student must never add them to the payment selection.
  await page.getByLabel('Search students').fill('QA Student 2');
  await page.getByRole('button', { name: 'Mark 1 selected student as paid', exact: true }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toContainText('1 selected pending registration');
  await expect(dialog).toContainText('BLP bulk QA'); await expect(dialog).not.toContainText('Other Student'); await expect(dialog).toContainText('QA Student 1'); await expect(dialog).not.toContainText('QA Student 2');
  await dialog.getByRole('button', { name: 'Cancel' }).click(); expect(writes).toBe(0);
  await page.getByRole('button', { name: 'Mark 1 selected student as paid', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Confirm 1 as paid' })).toBeDisabled();
  await dialog.getByLabel('Reason for the audit record').fill('BLP owner approval');
  await dialog.getByRole('button', { name: 'Confirm 1 as paid' }).click();
  await expect(page.getByRole('status')).toContainText('Marked 1 registration as paid'); expect(writes).toBe(1);
  await expect(page.getByRole('status')).toContainText('1 welcome email queued');
  await page.getByRole('button', { name: '← Back to courses' }).click();
  await page.getByRole('button', { name: /BLP bulk QA.*View students/ }).click();
  await expect(page.locator('.sr-row').filter({ hasText: 'Enrolled (paid)' })).toHaveCount(2);
  await page.reload(); await page.getByRole('button', { name: /BLP bulk QA.*View students/ }).click();
  await expect(page.locator('.sr-row').filter({ hasText: 'Enrolled (paid)' })).toHaveCount(2);
  await page.getByLabel('Course', { exact: true }).selectOption(courseB);
  await expect(page.locator('.sr-row')).toContainText('Not paid yet');
  await page.locator('.sr-row').getByRole('checkbox').check();
  failPreview = true;
  await page.getByRole('button', { name: 'Mark 1 selected student as paid', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Could not load' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0); expect(writes).toBe(1);
  failPreview = false;
  await page.getByLabel('Course', { exact: true }).selectOption(courseA);
  await expect(page.getByRole('button', { name: 'Mark selected students as paid', exact:true })).toBeDisabled();
  await page.locator('.sr-row').filter({hasText:'QA Student 4'}).getByRole('checkbox').check();
  await expect(page.getByRole('button', { name: 'Mark selected students as paid', exact:true })).toBeDisabled();
  await page.getByRole('tab', {name:/Not paid yet/}).click();
  await page.getByLabel('Select all shown').check();
  expectedIds = [orders[1].id, orders[2].id];
  await page.getByRole('button', {name:'Mark 2 selected students as paid',exact:true}).click();
  await expect(dialog).toContainText('QA Student 2'); await expect(dialog).toContainText('QA Student 3');
  await expect(dialog).not.toContainText('QA Student 5');
  await dialog.getByLabel('Reason for the audit record').fill('Selected students paid');
  await dialog.getByRole('button', {name:'Confirm 2 as paid'}).click();
  await expect(page.getByRole('status')).toContainText('Marked 2 registrations as paid');
  expect(writes).toBe(2);
  expect(orders[4].status).toBe('rejected');
  expect(orders[5].status).toBe('pending');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
