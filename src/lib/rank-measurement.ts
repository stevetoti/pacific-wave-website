import { z } from 'zod';
export const RANK_MARKET = { locationCode: 2548, locationName: 'Vanuatu', languageCode: 'en', device: 'desktop', depth: 100, domain: 'pacificwavedigital.com' } as const;
export const trackedStatus = (status: string | null) => status === 'active' || status === 'tracking';
export const keywordKey = (keyword: string) => keyword.trim().toLowerCase().replace(/\s+/g, ' ');
const itemSchema = z.object({ type: z.string(), rank_group: z.number().int().nullable().optional(), rank_absolute: z.number().int().nullable().optional(), url: z.string().nullable().optional(), title: z.string().nullable().optional() });
const responseSchema = z.object({ status_code: z.number(), tasks: z.array(z.object({ id: z.string(), status_code: z.number(), cost: z.number().nonnegative().optional(), result: z.array(z.object({ keyword: z.string(), location_code: z.number(), language_code: z.string(), datetime: z.string(), check_url: z.string().optional(), items: z.array(itemSchema).nullable(), spell: z.object({ keyword: z.string().nullable().optional(), type: z.string().nullable().optional() }).nullable().optional() })).nullable() })) });
export function belongsToDomain(url: string, domain: string) {
  try { const u = new URL(url); return ['https:', 'http:'].includes(u.protocol) && (u.hostname === domain || u.hostname.endsWith('.' + domain)); } catch { return false; }
}
export function parseRankResponse(raw: unknown, keyword: string) {
  const response = responseSchema.parse(raw);
  const task = response.tasks[0];
  if (response.status_code !== 20000 || response.tasks.length !== 1 || task?.status_code !== 20000 || task.result?.length !== 1) throw new Error('DataForSEO did not complete the measurement');
  const result = task.result[0];
  if (keywordKey(result.keyword) !== keywordKey(keyword) || result.location_code !== RANK_MARKET.locationCode || result.language_code !== RANK_MARKET.languageCode) throw new Error('DataForSEO returned a different query or market');
  const organic = (result.items || []).filter(item => item.type === 'organic' && item.rank_group && item.rank_group > 0);
  if (!organic.length) throw new Error('No organic results returned; position is unavailable');
  const matches = organic.filter(item => item.url && belongsToDomain(item.url, RANK_MARKET.domain)).sort((a, b) => a.rank_group! - b.rank_group!);
  const match = matches[0];
  const checkedAt = new Date(result.datetime).toISOString();
  return { keyword, position: match?.rank_group ?? null, url: match?.url ?? null, checkedAt,
    metadata: { source: 'dataforseo' as const, version: 1, taskId: task.id, ...RANK_MARKET, checkedAt, organicCount: organic.length, maxOrganicRank: Math.max(...organic.map(item => item.rank_group!)), outcome: match ? 'ranked' : 'not_found', searchUrl: result.check_url ?? null, correctedQuery: result.spell?.keyword ?? null, correctionType: result.spell?.type ?? null, cost: task.cost ?? 0, rankAbsolute: match?.rank_absolute ?? null },
  };
}
