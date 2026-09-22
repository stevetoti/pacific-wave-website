import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST as submit } from '../src/app/api/submissions/route';
import { POST as invite } from '../src/app/api/admin/invite-user/route';
import { GET as listArticles, POST as createArticle } from '../src/app/api/help/articles/route';
import { PUT as updateArticle, DELETE as deleteArticle } from '../src/app/api/help/articles/[id]/route';
import { authorize } from '../src/lib/server/auth';
import { readJson } from '../src/lib/server/http';
import { z } from 'zod';

// Never contact real services: fail immediately if a test doesn't install its transport.
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-database.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.RESEND_API_KEY = 'test-email-key';
delete process.env.ERROR_NOTIFICATION_EMAILS;
const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });
const request = (body: unknown, token?: string) => new Request('http://localhost/api/test', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
});
const valid = { contact_name: 'Example Person', contact_email: 'person@example.com', project_type: 'website' };
function transport(options: { role?: string; active?: boolean; dbFailure?: boolean; emailFailure?: boolean; limited?: boolean; wrongSite?: boolean } = {}) {
  const calls: { url: URL; method: string; body: any }[] = [];
  globalThis.fetch = async (input, init) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const url = new URL(req.url);
    const body = req.method === 'GET' ? null : JSON.parse(await req.text() || 'null');
    calls.push({ url, method: req.method, body });
    let data: unknown = [];
    let status = 200;
    if (url.pathname === '/auth/v1/user') data = { id: '00000000-0000-4000-8000-000000000001', email: 'admin@example.com' };
    else if (url.pathname === '/rest/v1/admin_users') data = options.wrongSite ? null : { role: options.role || 'super_admin', is_active: options.active ?? true };
    else if (url.pathname === '/rest/v1/rpc/pwd_rate_limit') data = !options.limited;
    else if (url.pathname === '/rest/v1/project_submissions' && req.method === 'POST') {
      data = options.dbFailure ? { message: 'Database unavailable', code: 'XX000' } : { id: '00000000-0000-4000-8000-000000000002' };
      status = options.dbFailure ? 500 : 201;
    } else if (url.hostname === 'api.resend.com') { data = { id: 'test-mail' }; status = options.emailFailure ? 500 : 200; }
    else if (url.hostname !== 'test-database.invalid') throw new Error('Unexpected real service request');
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  };
  return calls;
}

test('privileged writes reject omitted authorization before parsing or database access', async () => {
  const calls = transport();
  const context = { params: Promise.resolve({ id: '00000000-0000-4000-8000-000000000002' }) };
  for (const response of [await invite(request({})), await createArticle(request({})), await updateArticle(request({}), context), await deleteArticle(request({}), context)]) assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
});
test('viewer, inactive and other-site identities cannot edit', async () => {
  for (const options of [{ role: 'viewer' }, { active: false }, { wrongSite: true }]) {
    transport(options);
    const result = await authorize(request({}, 'valid'));
    assert.equal(result.response?.status, 403);
  }
});
test('admin lookup is constrained to the PWD admin site', async () => {
  const calls = transport();
  const result = await authorize(request({}, 'valid'));
  assert.equal(result.response, undefined);
  assert.equal(calls.find(c => c.url.pathname.endsWith('/admin_users'))?.url.searchParams.get('site_id'), 'eq.pacific-wave-digital');
});
test('anonymous article listing cannot request drafts or another tenant', async () => {
  const calls = transport();
  assert.equal((await listArticles(new Request('http://localhost/api/help/articles?published=false'))).status, 200);
  const query = calls.find(c => c.url.pathname.endsWith('/help_articles'))!.url.searchParams;
  assert.equal(query.get('is_published'), 'eq.true');
  assert.equal(query.get('site_id'), 'eq.pwd');
  assert.equal((await listArticles(new Request('http://localhost/api/help/articles?siteId=other'))).status, 403);
});
test('article updates/deletes include the site filter', async () => {
  const calls = transport();
  const context = { params: Promise.resolve({ id: '00000000-0000-4000-8000-000000000002' }) };
  await updateArticle(request({ content: 'Updated' }, 'valid'), context);
  await deleteArticle(request({}, 'valid'), context);
  for (const call of calls.filter(c => ['PATCH', 'DELETE'].includes(c.method))) assert.equal(call.url.searchParams.get('site_id'), 'eq.pwd');
});
test('invalid inquiry cannot reach persistence or email', async () => {
  const calls = transport();
  assert.equal((await submit(request({ ...valid, contact_email: 'invalid' }))).status, 400);
  assert.equal(calls.length, 0);
});
test('database failure never returns success or sends an email', async () => {
  const calls = transport({ dbFailure: true });
  const response = await submit(request(valid));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).success, false);
  assert.equal(calls.some(c => c.url.hostname === 'api.resend.com'), false);
});
test('saved inquiries survive email failure and retain pending notification', async () => {
  const calls = transport({ emailFailure: true });
  const response = await submit(request(valid));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).notification, 'pending');
  assert.equal(calls.some(c => c.method === 'PATCH' && c.body?.notification_status === 'sent'), false);
});
test('successful submission saves first and sends escaped-as-text notification once', async () => {
  const calls = transport();
  const response = await submit(request({ ...valid, contact_name: '<img src=x>', status: 'converted', site_id: 'other' }));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).notification, 'sent');
  const insert = calls.find(c => c.url.pathname.endsWith('/project_submissions') && c.method === 'POST')!;
  assert.equal(insert.body.status, 'new');
  assert.equal(insert.body.site_id, 'pwd');
  const email = calls.find(c => c.url.hostname === 'api.resend.com')!;
  assert.equal('html' in email.body, false);
  assert.ok(calls.indexOf(insert) < calls.indexOf(email));
});
test('rate limit blocks storage and notifications', async () => {
  const calls = transport({ limited: true });
  assert.equal((await submit(request(valid))).status, 429);
  assert.equal(calls.some(c => c.url.pathname.endsWith('/project_submissions')), false);
});
test('chunked oversized request is rejected before parsing', async () => {
  const req = request({ value: 'a'.repeat(140000) });
  await assert.rejects(readJson(req, z.object({ value: z.string() })), /Request too large/);
});
