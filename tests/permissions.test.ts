import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canAccess, getRequiredPermission } from '../src/lib/permissions';
import { submissionSchema } from '../src/lib/submission-schema';

test('nested admin routes use their specific permission', () => {
  assert.equal(getRequiredPermission('/admin/blog/edit/123'), 'blog');
  assert.equal(getRequiredPermission('/admin/help/manage'), 'help');
  assert.equal(getRequiredPermission('/admin/seo-hub'), 'seo');
  assert.equal(getRequiredPermission('/admin/submissions'), 'settings');
  assert.equal(canAccess('viewer', getRequiredPermission('/admin/blog/edit/123')!), false);
  assert.equal(canAccess('editor', getRequiredPermission('/admin/seo-hub')!), false);
});
test('inquiries require a real email and bounded contact fields', () => {
  const valid = { contact_name: 'Test Person', contact_email: 'test@example.com', project_type: 'website' };
  assert.equal(submissionSchema.safeParse(valid).success, true);
  assert.equal(submissionSchema.safeParse({ ...valid, contact_email: 'bad' }).success, false);
  assert.equal(submissionSchema.safeParse({ ...valid, contact_name: '' }).success, false);
  assert.equal(submissionSchema.safeParse({ ...valid, project_description: 'a'.repeat(20001) }).success, false);
  const parsed = submissionSchema.parse({ ...valid, status: 'converted', site_id: 'other', assigned_to: 'attacker' });
  assert.equal('status' in parsed, false);
  assert.equal('site_id' in parsed, false);
  assert.equal('assigned_to' in parsed, false);
});
