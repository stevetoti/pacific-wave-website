import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RANK_AUTOMATION, rankingScheduleDue, nextWeeklyRanking, nextRankingInvocation } from '../src/lib/rank-schedule';
import { runScheduledRankings } from '../src/lib/server/scheduled-rankings';

test('weekly ranking schedule uses Monday Vanuatu, not UTC Monday', () => {
 assert.equal(rankingScheduleDue(new Date('2026-10-18T22:14:59Z')), false);
 assert.equal(rankingScheduleDue(new Date('2026-10-18T22:15:00Z')), true);
 assert.equal(rankingScheduleDue(new Date('2026-10-18T23:15:00Z')), true);
 assert.equal(rankingScheduleDue(new Date('2026-10-19T13:00:00Z')), false);
 assert.equal(nextWeeklyRanking(new Date('2026-10-18T11:00:00Z')), '2026-10-18T22:15:00.000Z');
 assert.equal(nextWeeklyRanking(new Date('2026-10-18T22:15:00Z')), '2026-10-25T22:15:00.000Z');
 assert.equal(nextWeeklyRanking(new Date('2026-12-31T22:00:00Z')), '2027-01-03T22:15:00.000Z');
 assert.equal(nextRankingInvocation(new Date('2026-10-18T22:16:00Z')), '2026-10-18T23:15:00.000Z');
 assert.equal(nextRankingInvocation(new Date('2026-10-18T23:16:00Z')), '2026-10-25T22:15:00.000Z');
});
test('weekly cron matches approved primary/recovery and preserves existing jobs', () => {
 const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
 assert.equal(config.crons.filter((c: { path: string }) => c.path === '/api/cron/weekly-rankings').length, 1);
 assert.equal(config.crons.find((c: { path: string }) => c.path === '/api/cron/weekly-rankings').schedule, RANK_AUTOMATION.cron);
 for (const path of ['training-campaigns','notifications','weekly-blog']) assert.ok(config.crons.some((c: { path: string }) => c.path === `/api/cron/${path}`));
});
test('scheduled route rejects anonymous/wrong auth before database/provider use', async () => {
 const { GET } = await import('../src/app/api/cron/weekly-rankings/route');
 for (const authorization of ['', 'Bearer wrong-secret']) assert.equal((await GET(new Request('https://pacificwavedigital.com/api/cron/weekly-rankings', { headers: { authorization } }))).status, 401);
});
test('off-schedule production checks never read configuration or spend credit', async () => {
 const old = process.env.VERCEL_ENV; process.env.VERCEL_ENV = 'production';
 try { assert.deepEqual(await runScheduledRankings(new Date('2026-10-18T11:00:00Z')), { state: 'not_due', nextRun: '2026-10-18T22:15:00.000Z' }); }
 finally { if (old === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = old; }
});
