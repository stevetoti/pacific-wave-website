import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { chromium } from '@playwright/test';

const base = process.env.BULK_PAID_TEST_URL || 'http://127.0.0.1:3107';
const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(new URL(dbUrl).hostname, 'rndegttgwtpkbjtvjgnc.supabase.co');
const db = createClient(dbUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const checked = async promise => { const r = await promise; if (r.error) throw r.error; return r.data; };
async function sql(query) {
  const r = await fetch('https://api.supabase.com/v1/projects/rndegttgwtpkbjtvjgnc/database/query', { method: 'POST', headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  if (!r.ok) throw Error(`SQL fixture request failed ${r.status}: ${(await r.text()).slice(0,300)}`);
  return r.json();
}
const stamp = randomUUID().slice(0,8), userIds = [], courses = [], orderIds = [], report = [];
const headers = {};
if (process.env.BULK_PAID_STORAGE_STATE) {
  const state = JSON.parse(await fs.readFile(process.env.BULK_PAID_STORAGE_STATE, 'utf8'));
  headers.Cookie = (state.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');
}
async function api(path, token, body) {
  const r = await fetch(base + path, { method: body ? 'POST' : 'GET', headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  let data; try { data = await r.json(); } catch { throw Error(`Non-JSON response ${r.status} from ${path}`); }
  return { status: r.status, data };
}
let browser;
await fs.mkdir('.deployment/blp-bulk-evidence',{recursive:true});
try {
  const sessions = [];
  for (const role of ['admin','student','instructor']) {
    const email = `qa-bulk-${role}-${stamp}@example.test`, password = randomUUID() + 'Aa1!';
    const { user } = await checked(db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `Bulk QA ${role}` } }));
    userIds.push(user.id);
    const auth = createClient(dbUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { session } = await checked(auth.auth.signInWithPassword({ email, password })); sessions.push(session);
  }
  const [admin, student, instructor] = sessions;
  await checked(db.from('admin_users').insert({ id: admin.user.id, email: admin.user.email, name: 'Bulk QA admin', role: 'admin', site_id: 'pacific-wave-digital', is_active: true }));
  for (const name of ['Main','Other']) {
    const course = await checked(db.from('pwd_lms_courses').insert({ slug: `bulk-qa-${name.toLowerCase()}-${stamp}`, title: `Bulk QA ${name} ${stamp}`, kind: 'live', amount: 0, currency: 'VUV', requires_approval: true, is_private: true, published: false }).select('id,title').single()); courses.push(course);
  }
  await checked(db.from('pwd_lms_course_instructors').insert({ course_id: courses[0].id, user_id: instructor.user.id }));
  const ids = [randomUUID(), randomUUID(), randomUUID()]; orderIds.push(...ids);
  // Fixture orders and suppressed notifications commit together. No email can escape.
  await sql(`begin; select set_config('pwd_lms.suppress_status_email','on',true);
    insert into public.pwd_lms_orders(id,user_id,course_id,email,name,phone,amount,currency,status,method)
    values('${ids[0]}','${student.user.id}','${courses[0].id}','${student.user.email}','Bulk QA student','',0,'VUV','pending','grant'),
    ('${ids[1]}','${instructor.user.id}','${courses[0].id}','${instructor.user.email}','Bulk QA instructor','',0,'VUV','pending','grant'),
    ('${ids[2]}','${student.user.id}','${courses[1].id}','${student.user.email}','Bulk QA other','',0,'VUV','pending','grant');commit;`);
  for (const session of [null, student, instructor]) {
    const r = await api(`/api/lms-bulk-paid?course=${courses[0].id}`, session?.access_token);
    assert.equal(r.status, session ? 403 : 401);
    const write = await api('/api/lms-bulk-paid', session?.access_token, { course_id: courses[0].id, order_ids: [ids[0]], note: 'Forbidden test' });
    assert.equal(write.status, session ? 403 : 401);
  }
  report.push('PASS anonymous/student/assigned-instructor GET and POST denied');
  const crossed = await api('/api/lms-bulk-paid', admin.access_token, { course_id: courses[0].id, order_ids: [ids[0],ids[2]], note: 'Cross-course test' });
  assert.equal(crossed.status, 409);
  const preview = await api(`/api/lms-bulk-paid?course=${courses[0].id}`, admin.access_token);
  assert.equal(preview.status,200); assert.equal(preview.data.order_ids.length,2);
  const invalid = await api('/api/lms-bulk-paid',admin.access_token,{course_id:courses[0].id,order_ids:[ids[0]],note:''}); assert.equal(invalid.status,400);
  report.push('PASS admin preview, validation and atomic cross-course refusal');
  browser = await chromium.launch({ channel: 'chrome' });
  for (const [index, viewport] of [{width:1440,height:1000},{width:390,height:844}].entries()) {
    const context = await browser.newContext({ viewport, ...(process.env.BULK_PAID_STORAGE_STATE ? { storageState: process.env.BULK_PAID_STORAGE_STATE } : {}) });
    await context.addInitScript(session => localStorage.setItem('sb-rndegttgwtpkbjtvjgnc-auth-token',JSON.stringify(session)), admin);
    const page = await context.newPage();
    await page.route('**/*google-analytics.com/**',r=>r.abort());await page.route('**/*googletagmanager.com/**',r=>r.abort());
    await page.goto(base+'/admin/training-center');
    await page.getByRole('button',{name:new RegExp(`${courses[0].title}.*View students`)}).click();
    if (index===0) {
      await page.getByRole('button',{name:'Mark pending students as paid',exact:true}).click();
      const dialog=page.getByRole('dialog');await dialog.waitFor();
      assert.match(await dialog.innerText(),/2 pending registrations/);
      await dialog.getByLabel('Reason for the audit record').fill('Synthetic acceptance: owner-approved no-fee participants');
      await fs.mkdir('.deployment/blp-bulk-evidence',{recursive:true});
      await page.screenshot({path:'.deployment/blp-bulk-evidence/desktop-confirmation.png',fullPage:true});
      await dialog.getByRole('button',{name:'Confirm 2 as paid'}).click();
      await page.getByText('Marked 2 registrations as paid.',{exact:false}).waitFor();
    }
    await page.getByRole('button',{name:'← Back to courses'}).click();
    await page.getByRole('button',{name:new RegExp(`${courses[0].title}.*View students`)}).click();
    await page.reload();
    await page.getByRole('button',{name:new RegExp(`${courses[0].title}.*View students`)}).click();
    await page.locator('.sr-row').filter({hasText:'Enrolled (paid)'}).first().waitFor();
    assert.equal(await page.locator('.sr-row').filter({hasText:'Enrolled (paid)'}).count(),2);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`.deployment/blp-bulk-evidence/${index?'mobile':'desktop'}-persisted.png`,fullPage:true});
    report.push(`PASS ${index?'mobile':'desktop'} actual admin roster after leave/reopen/hard reload`);
    await context.close();
  }
  const rows = await checked(db.from('pwd_lms_orders').select('id,status,amount,method,reviewed_by').in('id',ids));
  assert.ok(rows.filter(o=>o.id!==ids[2]).every(o=>o.status==='paid'&&o.amount===0&&o.method==='grant'&&o.reviewed_by===admin.user.id));
  assert.equal(rows.find(o=>o.id===ids[2]).status,'pending');
  assert.equal((await checked(db.from('pwd_lms_emails').select('id').in('order_id',ids))).length,0);
  assert.equal((await checked(db.from('pwd_lms_audit').select('id').eq('action','bulk_mark_paid').in('target_id',ids))).length,2);
  const retry = await api('/api/lms-bulk-paid',admin.access_token,{course_id:courses[0].id,order_ids:ids.slice(0,2),note:'Retry acceptance'});
  assert.equal(retry.status,200);assert.equal(retry.data.updated_count,0);
  report.push('PASS persisted amounts/methods/audits, other course unchanged, no emails queued, idempotent retry');
} catch (error) {
  console.log(JSON.stringify({failed:true,completed:report,error:error instanceof Error?error.message:String(error)}));
  throw error;
} finally {
  await browser?.close();
  if (orderIds.length) {
    await checked(db.from('pwd_lms_audit').delete().in('target_id',orderIds));
    await checked(db.from('pwd_lms_emails').delete().in('order_id',orderIds));
    await checked(db.from('pwd_lms_orders').delete().in('id',orderIds));
  }
  if (courses.length) {
    await checked(db.from('pwd_lms_channels').delete().in('course_id',courses.map(c=>c.id)));
    await checked(db.from('pwd_lms_course_instructors').delete().in('course_id',courses.map(c=>c.id)));
    await checked(db.from('pwd_lms_courses').delete().in('id',courses.map(c=>c.id)));
  }
  if (userIds.length) await checked(db.from('admin_users').delete().in('id',userIds));
  for (const id of userIds) await checked(db.auth.admin.deleteUser(id));
  await fs.mkdir('.deployment/blp-bulk-evidence',{recursive:true});
  await fs.writeFile('.deployment/blp-bulk-evidence/'+(process.env.BULK_PAID_TEST_URL?'deployed':'local')+'-acceptance.json',JSON.stringify({base,report,synthetic_data_cleaned:true,timestamp:new Date().toISOString()},null,2));
}
console.log(JSON.stringify({base,report,synthetic_data_cleaned:true}));
