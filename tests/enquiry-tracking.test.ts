import { test } from 'node:test';
import assert from 'node:assert/strict';
import { businessContactEvent, isMarketingPath, trackSavedEnquiry, trackBusinessContact } from '../src/lib/analytics/enquiries';

test('only actual PWD phone and recipient-specific WhatsApp links are counted', () => {
  assert.equal(businessContactEvent('tel:+678 528 8141'), 'contact_phone_click');
  assert.equal(businessContactEvent('https://wa.me/6785288141?text=private-message'), 'contact_whatsapp_click');
  assert.equal(businessContactEvent('https://api.whatsapp.com/send?phone=6785288141'), 'contact_whatsapp_click');
  for (const href of ['https://wa.me/?text=share', 'https://wa.me/123', 'tel:+6787774567', '/contact', 'https://wa.me.fake/6785288141']) assert.equal(businessContactEvent(href), null);
  assert.equal(isMarketingPath('/training-center/account'), false);
  assert.equal(isMarketingPath('/admin/submissions'), false);
});
test('only saved receipts produce one lead; failures, honeypots and PII never become events', () => {
  const events: unknown[][] = [];
  const storage = new Map<string, string>();
  const location = { origin: 'https://pacificwavedigital.com', pathname: '/contact' };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location, gtag: (...args: unknown[]) => events.push(args), sessionStorage: { getItem: (k: string) => storage.get(k), setItem: (k: string,v: string) => storage.set(k,v) } } });
  const result = { success: true, submission_id: '00000000-0000-4000-8000-000000000002', contact_email: 'private@example.com', message: 'private content' };
  for (const status of [200,400,429,500]) trackSavedEnquiry(result, 'contact', status);
  trackSavedEnquiry({ success:true }, 'contact', 201);
  assert.equal(events.length,0);
  trackSavedEnquiry(result,'contact',201);
  trackSavedEnquiry(result,'contact',201);
  assert.equal(events.length,1);
  trackBusinessContact('https://wa.me/6785288141?text=private-message');
  trackBusinessContact('tel:+6785288141');
  assert.equal(events.length,3);
  assert.match(JSON.stringify(events), /generate_lead/);
  assert.doesNotMatch(JSON.stringify(events), /private|00000000|wa.me|5288141/);
  location.pathname='/admin';
  trackBusinessContact('tel:+6785288141');
  assert.equal(events.length,3);
  Reflect.deleteProperty(globalThis,'window');
});
