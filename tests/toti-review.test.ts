import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewFingerprint } from '../src/lib/server/toti-blog-review';

test('approval fingerprint changes with reviewed content, image or keyword', () => {
  const post = { id: 'id', site_id: 'pwd', title: 'Title', content: '<p>Article</p>', excerpt: 'Excerpt', slug: 'slug', focus_keyword: 'Vanuatu', image_url: '/images/cover.webp', image_alt: 'Illustration', published: false, updated_at: null };
  const original = reviewFingerprint(post);
  assert.equal(original, reviewFingerprint({ ...post }));
  for (const key of ['title', 'content', 'excerpt', 'slug', 'focus_keyword', 'image_url', 'image_alt'] as const) assert.notEqual(original, reviewFingerprint({ ...post, [key]: 'changed' }));
  assert.notEqual(original, reviewFingerprint({ ...post, site_id: 'other' }));
});
