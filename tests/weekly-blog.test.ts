import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { vanuatuWeek, nextWeeklyRun, chooseBrief, checkArticle, articleSchema, EDITORIAL_BRIEFS } from '../src/lib/seo-editorial';
import { mayClaim, type WeeklyRun } from '../src/lib/server/weekly-blog';
import { GET as cron } from '../src/app/api/cron/weekly-blog/route';
import { GET as health } from '../src/app/api/seo/weekly-blog/route';

test('Vanuatu Monday boundary, year boundary and weekly slot are timezone aware', () => {
  assert.equal(vanuatuWeek(new Date('2026-10-18T12:59:59Z')), '2026-10-12');
  assert.equal(vanuatuWeek(new Date('2026-10-18T13:00:00Z')), '2026-10-19');
  assert.equal(vanuatuWeek(new Date('2027-01-01T00:00:00Z')), '2026-12-28');
  assert.equal(nextWeeklyRun(new Date('2026-10-18T00:00:00Z')), '2026-10-18T22:00:00.000Z');
  assert.equal(nextWeeklyRun(new Date('2026-10-18T22:01:00Z')), '2026-10-25T22:00:00.000Z');
});
test('weekly leases refuse active, completed and exhausted runs, permit bounded stale recovery', () => {
  const now = new Date('2026-10-18T01:00:00Z');
  const running: WeeklyRun = { week: '2026-10-12', state: 'running', attempt: 1, token: 'test', startedAt: now.toISOString(), updatedAt: now.toISOString() };
  assert.equal(mayClaim(undefined, now), true);
  assert.equal(mayClaim(running, now), false);
  assert.equal(mayClaim({...running, updatedAt: '2026-10-18T00:00:00Z'}, now), true);
  assert.equal(mayClaim({...running, state:'ready'}, now), false);
  assert.equal(mayClaim({...running, attempt:3, state:'failed', updatedAt:'2026-10-18T00:00:00Z'}, now), false);
});
test('editorial queue never restarts used intents or repeats existing draft titles', () => {
  const first = EDITORIAL_BRIEFS[0];
  assert.notEqual(chooseBrief([{title:'Different title',keywords:[`pwd-brief:${first.id}`]}])?.id, first.id);
  assert.notEqual(chooseBrief([{title:first.title}])?.id, first.id);
  assert.equal(chooseBrief(EDITORIAL_BRIEFS.map(b=>({title:b.title}))), undefined);
});
test('editorial checks block generic, duplicate, unsafe and unverified linked content', () => {
  const b = EDITORIAL_BRIEFS[0];
  const article = {title:b.title,excerpt:'A practical readiness checklist for Vanuatu business owners choosing online payment workflows and checking provider eligibility before integration.',content: '<h2>Vanuatu readiness</h2><p>'+('Useful local workflow planning and checking responsibilities. '.repeat(130))+'</p><h2>Account ownership</h2><h2>Checking integration</h2><h2>Next steps</h2><a href="'+b.target+'">Payment integration</a><a href="https://pacificwavedigital.com/contact">Contact PWD</a>',tags:['Vanuatu','payments']};
  assert.equal(articleSchema.safeParse(article).success,true);
  assert.deepEqual(checkArticle(article,b,[]),[]);
  assert.ok(checkArticle({...article,content:article.content+'<script>alert(1)</script>'},b,[]).length);
  assert.ok(checkArticle({...article,content:article.content+'<a href="https://unverified.example/">source</a>'},b,[]).length);
  assert.ok(checkArticle(article,b,[{title:article.title}]).length);
  assert.ok(checkArticle({...article,content:'<p>Generic brief</p>'},b,[]).length);
});
test('every brief has a real local image and a specific canonical service owner', () => {
  for(const b of EDITORIAL_BRIEFS){ assert.ok(fs.existsSync('public'+b.image)); assert.match(b.target,/^https:\/\/pacificwavedigital\.com\/services\/[a-z-]+$/); }
});
test('cron and health reject missing/wrong authentication before any data or generation', async () => {
  assert.equal((await cron(new Request('https://example.test/api/cron/weekly-blog'))).status,401);
  assert.equal((await cron(new Request('https://example.test/api/cron/weekly-blog',{headers:{authorization:'Bearer wrong'}}))).status,401);
  assert.equal((await health(new Request('https://example.test/api/seo/weekly-blog'))).status,401);
});
