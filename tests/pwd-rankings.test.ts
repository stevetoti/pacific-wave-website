import test from 'node:test';
import assert from 'node:assert/strict';
import { belongsToDomain, parseRankResponse, trackedStatus } from '../src/lib/rank-measurement';
import { rankDay, rankRowId } from '../src/lib/server/pwd-rankings';
const fixture = (items: unknown[], status = 20000, location = 2548) => ({ status_code: 20000, tasks: [{ id: 'task-id', status_code: status, cost: 0.02, result: [{ keyword: 'web design Vanuatu', location_code: location, language_code: 'en', datetime: '2026-10-18 10:00:00 +00:00', items }] }] });
test('uses organic group position, not array order, paid placements or absolute rank', () => {
 const rank = parseRankResponse(fixture([{ type: 'paid', rank_group: 1, url: 'https://pacificwavedigital.com/' }, { type: 'organic', rank_group: 7, rank_absolute: 12, url: 'https://www.pacificwavedigital.com/services/web-design' }]), 'web design Vanuatu');
 assert.equal(rank.position, 7); assert.equal(rank.metadata.rankAbsolute, 12); assert.equal(rank.metadata.organicCount, 1);
});
test('domain matching rejects lookalikes and query-string mentions', () => {
 for (const url of ['https://pacificwavedigital.com.evil.test/', 'https://evil.test/pacificwavedigital.com', 'javascript:alert(1)']) assert.equal(belongsToDomain(url, 'pacificwavedigital.com'), false);
 assert.equal(belongsToDomain('https://www.pacificwavedigital.com/', 'pacificwavedigital.com'), true);
});
test('not-found carries returned coverage and no fabricated zero position', () => {
 const rank = parseRankResponse(fixture([{ type: 'organic', rank_group: 1, url: 'https://example.com/' }]), 'web design Vanuatu');
 assert.equal(rank.position, null); assert.equal(rank.metadata.outcome, 'not_found'); assert.equal(rank.metadata.organicCount, 1);
});
test('failed tasks, missing organic data and wrong locations remain unavailable', () => {
 assert.throws(() => parseRankResponse(fixture([], 40200), 'web design Vanuatu'));
 assert.throws(() => parseRankResponse(fixture([]), 'web design Vanuatu'));
 assert.throws(() => parseRankResponse(fixture([], 20000, 2840), 'web design Vanuatu'));
});
test('active and tracking count; per-day measurement identity is case-normalized and Vanuatu-based', () => {
 assert.equal(trackedStatus('tracking'), true); assert.equal(trackedStatus('active'), true); assert.equal(trackedStatus('paused'), false);
 assert.equal(rankRowId('2026-10-18', 'WEB design Vanuatu'), rankRowId('2026-10-18', 'web design vanuatu'));
 assert.notEqual(rankRowId('2026-10-18', 'web design'), rankRowId('2026-10-19', 'web design'));
 assert.equal(rankDay(new Date('2026-10-17T13:00:00Z')), '2026-10-18');
});
test('owner endpoint rejects anonymous and foreign-origin requests before provider calls', async () => {
 const { POST, OPTIONS } = await import('../src/app/api/seo/rankings/route');
 assert.equal((await POST(new Request('https://pacificwavedigital.com/api/seo/rankings', { method: 'POST' }))).status, 401);
 assert.equal((await POST(new Request('https://pacificwavedigital.com/api/seo/rankings', { method: 'POST', headers: { origin: 'https://evil.test' } }))).status, 403);
 assert.equal(OPTIONS(new Request('https://pacificwavedigital.com/api/seo/rankings', { headers: { origin: 'https://totiroom.pacificwavedigital.com' } })).status, 204);
});

test('provider partial success preserves usable ranks with explicit partial coverage', () => {
 const rank = parseRankResponse(fixture([{ type: 'organic', rank_group: 3, url: 'https://pacificwavedigital.com/' }], 40106), 'web design Vanuatu');
 assert.equal(rank.position, 3); assert.equal(rank.metadata.partialResults, true); assert.equal(rank.metadata.organicCount, 1);
});
