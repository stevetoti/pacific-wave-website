import { test } from 'node:test';
import assert from 'node:assert/strict';
import { articleImagePaths, attachSupportingImages } from '../src/lib/seo-article-images';
test('requires three distinct owned assets and rejects a missing/duplicate cover', () => {
 assert.equal(new Set(articleImagePaths('/images/blog/web-editorial.webp')).size, 3);
 assert.throws(() => articleImagePaths('https://external.example/image.png'));
 assert.throws(() => articleImagePaths('/images/blog/website-project-workflow.svg'));
});
test('places two accessible supporting images inside substantive content without duplicate attachment', () => {
 const html = attachSupportingImages('<h2>Plan</h2><p>One</p><h2>Prepare</h2><p>Two</p><h2>Test</h2><p>Three</p><h2>Review</h2><p>Four</p>');
 assert.equal((html.match(/<img /g) || []).length, 2);
 assert.equal((html.match(/alt="[^"\n]+"/g) || []).length, 2);
 assert.throws(() => attachSupportingImages(html));
 assert.throws(() => attachSupportingImages('<p>Outline</p>'));
});
