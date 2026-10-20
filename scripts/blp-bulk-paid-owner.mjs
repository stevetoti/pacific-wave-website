import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// Owner-authorised one-time maintenance. Credentials are supplied by the existing environment.
const ref = 'rndegttgwtpkbjtvjgnc';
const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(new URL(base).hostname, `${ref}.supabase.co`);
const headers = { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' };
async function rest(path, options = {}) {
  const response = await fetch(`${base}/rest/v1/${path}`, { ...options, headers });
  if (!response.ok) throw Error(`Database request failed (${response.status}): ${(await response.text()).slice(0,400)}`);
  return response.status === 204 ? null : response.json();
}
async function sql(query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  if (!response.ok) throw Error(`Database management request failed (${response.status}): ${(await response.text()).slice(0,400)}`);
  return response.json();
}
const mode = process.argv[2];
if (mode === 'migrate') {
  await sql(await fs.readFile('supabase/migrations/20261020_bulk_mark_paid.sql', 'utf8'));
  console.log('Bulk payment-status function and scoped email suppression installed. No students changed.');
} else if (mode === 'mark-blp') {
  const courses = await rest('pwd_lms_courses?slug=eq.blp-digital-skills-workshop&select=id,slug,amount,requires_approval');
  assert.equal(courses.length, 1); const course = courses[0]; assert.equal(course.amount, 0); assert.equal(course.requires_approval, true);
  const actors = await sql("select u.id from auth.users u join public.admin_users a on a.email=u.email where lower(u.email)='steve@pacificwavedigital.com' and a.site_id='pacific-wave-digital' and a.is_active and a.role in ('admin','super_admin')");
  assert.equal(actors.length, 1, 'Owner admin identity must match');
  const before = await rest('pwd_lms_orders?select=id,course_id,status,amount,method&order=id&limit=10000');
  assert.ok(before.length < 10000, 'Inventory must not be truncated');
  const pending = before.filter(o => o.course_id === course.id && o.status === 'pending');
  assert.ok(pending.length > 0 && pending.length <= 1000, 'Expected a non-empty bounded BLP batch');
  assert.ok(pending.every(o => o.amount === 0 && o.method === 'grant'), 'No-fee workshop only');
  const beforeJobs = await rest(`pwd_lms_emails?order_id=in.(${pending.map(o => o.id).join(',')})&select=id&limit=10000`);
  await fs.mkdir('.deployment/blp-bulk-evidence', { recursive: true });
  const receipt = { authorised: 'Stephen requested all pending BLP students marked paid; future course-scoped bulk button', course_id: course.id, before: pending, timestamp: new Date().toISOString() };
  await fs.writeFile('.deployment/blp-bulk-evidence/blp-payment-before.json', JSON.stringify(receipt, null, 2), { mode: 0o600 });
  const result = await rest('rpc/pwd_lms_bulk_mark_paid', { method: 'POST', body: JSON.stringify({ p_course: course.id, p_orders: pending.map(o => o.id), p_actor: actors[0].id, p_note: 'Stephen approved pending BLP participants on 20 October 2026. No participant fee.' }) });
  assert.equal(result.updated_count, pending.length); assert.equal(result.skipped_count, 0);
  const after = await rest('pwd_lms_orders?select=id,course_id,status,amount,method&order=id&limit=10000');
  const ids = new Set(pending.map(o => o.id));
  for (const old of before) {
    const row = after.find(o => o.id === old.id); assert.ok(row, 'Existing registration retained');
    assert.deepEqual(row, ids.has(old.id) ? { ...old, status: 'paid' } : old, 'Only approved pending BLP statuses may change');
  }
  const jobs = await rest(`pwd_lms_emails?order_id=in.(${pending.map(o => o.id).join(',')})&select=id&limit=10000`);
  assert.deepEqual(jobs.map(o => o.id).sort(), beforeJobs.map(o => o.id).sort(), 'No status email queued');
  const audit = await rest(`pwd_lms_audit?action=eq.bulk_mark_paid&target_id=in.(${pending.map(o => o.id).join(',')})&select=target_id,actor_id&limit=1000`);
  assert.equal(audit.length, pending.length); assert.ok(audit.every(a => a.actor_id === actors[0].id));
  receipt.result = result; receipt.audit_count = audit.length; receipt.no_email_jobs = true; receipt.other_registrations_unchanged = true;
  await fs.writeFile('.deployment/blp-bulk-evidence/blp-payment-receipt.json', JSON.stringify(receipt, null, 2), { mode: 0o600 });
  console.log(JSON.stringify({ marked_paid: result.updated_count, skipped: result.skipped_count, emails_queued: 0, other_registrations_unchanged: true, remaining_blp_pending: after.filter(o => o.course_id === course.id && o.status === 'pending').length }));
} else throw Error('Use migrate or mark-blp');
