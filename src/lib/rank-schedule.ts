export const RANK_AUTOMATION = {
  version: 1, timezone: 'Pacific/Efate', cron: '15 22,23 * * 0',
  schedule: 'Mondays at 09:15 Vanuatu time', recovery: 'Mondays at 10:15; retries missing checks only',
} as const;
const localDate = (now: Date) => new Date(now.getTime() + 11 * 3600000);
export function rankingScheduleDue(now: Date) {
  const local = localDate(now);
  return local.getUTCDay() === 1 && local.getUTCHours() * 60 + local.getUTCMinutes() >= 9 * 60 + 15;
}
export function nextWeeklyRanking(now: Date) {
  const local = localDate(now);
  const next = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 9, 15));
  next.setUTCDate(next.getUTCDate() + (8 - local.getUTCDay()) % 7);
  if (next.getTime() <= local.getTime()) next.setUTCDate(next.getUTCDate() + 7);
  return new Date(next.getTime() - 11 * 3600000).toISOString();
}
export function nextRankingInvocation(now: Date) {
  const local = localDate(now);
  if (local.getUTCDay() === 1) {
    const recovery = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 10, 15));
    const primaryMinutes = 9 * 60 + 15;
    if (local.getUTCHours() * 60 + local.getUTCMinutes() >= primaryMinutes && local < recovery) return new Date(recovery.getTime() - 11 * 3600000).toISOString();
  }
  return nextWeeklyRanking(now);
}
