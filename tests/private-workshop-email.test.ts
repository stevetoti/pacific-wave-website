import test from 'node:test';
import assert from 'node:assert/strict';
import { privateWorkshopAccountEmail, privateWorkshopUpdateEmail } from '../src/lib/email/private-workshop';
import { trainingTemplate } from '../src/lib/email/training-template';
import type { Course } from '../src/lib/lms/types';
const course = { title: 'Bring your business online — BLP Workshop', slug: 'blp-digital-skills-workshop', requires_approval: true };
function noUpsell(message: { html: string; text: string }) {
  for (const body of [message.html, message.text]) {
    assert.doesNotMatch(body, /Your next learning opportunity|Explore this course|If your course has a fee|complete payment|checkout|VUV|mentorship/i);
  }
}
test('private BLP welcome is free, approval-based, branded and contains no course promotions', () => {
  const mail = privateWorkshopAccountEmail(course, 'welcome', false, 'https://example.com/account?course=blp');
  noUpsell(mail);
  assert.match(mail.subject, /BLP workshop/);
  assert.match(mail.html, /Business Link Pacific/);
  assert.match(mail.text, /Awaiting approval/);
  assert.match(mail.text, /21 October 2026/);
  assert.match(mail.text, /participant workbook, facilitator guide/);
  assert.match(mail.text, /Open my workshop dashboard/);
  for (const mode of ['signup', 'recovery'] as const) noUpsell(privateWorkshopAccountEmail(course, mode, false, 'https://example.com/secure'));
  noUpsell(privateWorkshopAccountEmail(course, 'signup', true, 'https://example.com/signin'));
});
test('BLP pending, approved and revoked notices do not confuse access with payment', () => {
  for (const status of ['pending', 'granted', 'revoked']) noUpsell(privateWorkshopUpdateEmail(course, status, 'Student', 'https://example.com/course'));
  const approved = privateWorkshopUpdateEmail(course, 'granted', 'Student', 'https://example.com/course');
  assert.match(approved.subject, /access is approved/);
  assert.doesNotMatch(approved.text, /awaiting|subject to|payment/i);
  assert.match(privateWorkshopUpdateEmail(course, 'revoked', 'Student', 'https://example.com/course').text, /no longer active/);
});
test('other private workshops have no BLP schedule or resources; public recommendations are retained', () => {
  const other = privateWorkshopAccountEmail({title:'Partner workshop',slug:'another-private-course',requires_approval:true}, 'welcome', false, 'https://example.com');
  noUpsell(other); assert.doesNotMatch(other.text, /BLP|21 October|facilitator guide/);
  const publicEmail = trainingTemplate({title:'Welcome',intro:'Hello',action:'Dashboard',url:'https://example.com',courses:[{title:'Public course',slug:'public-course',description:'Learn business',amount:100,currency:'VUV',enrollment_open:true} as Course]});
  assert.match(publicEmail.html, /Explore this course/);
});
