import 'server-only';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from './clients';
import { RANK_MARKET, keywordKey, parseRankResponse, trackedStatus } from '../rank-measurement';

interface RankRun { day: string; state: 'running' | 'ready' | 'partial' | 'failed'; attempt: number; updatedAt: string; failures: { keyword: string; error: string }[]; saved: number }
const snapshotKey = 'rank_snapshot:VU:desktop:en';
export function rankDay(now: Date) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Efate', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now); }
export function rankRowId(day: string, keyword: string) {
  const hash = createHash('sha256').update(`pwd:rank-v1:${day}:2548:desktop:en:${keywordKey(keyword)}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
export async function refreshPWDRankings(now = new Date()) {
  if (process.env.VERCEL_ENV !== 'production') throw new Error('Rank checks run only in production');
  const login = process.env.DATAFORSEO_LOGIN, password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new Error('DataForSEO is not configured');
  const db = getSupabaseAdmin(), day = rankDay(now), runKey = `rank_check:${day}:VU:desktop:en`;
  const old = await db.from('seo_settings').select('setting_value').eq('site_id', 'pwd').eq('setting_key', runKey).maybeSingle();
  if (old.error) throw new Error('Cannot read rank-check state');
  const previous = old.data?.setting_value ? JSON.parse(old.data.setting_value) as RankRun : undefined;
  if (previous?.state === 'ready') return { ...previous, state: 'already_checked' };
  if (previous?.state === 'running' && now.getTime() - Date.parse(previous.updatedAt) < 15 * 60000) return { state: 'in_progress' };
  if (previous && previous.attempt >= 2) return { state: 'retry_limit', failures: previous.failures };
  let run: RankRun = { day, state: 'running', attempt: (previous?.attempt || 0) + 1, updatedAt: now.toISOString(), failures: [], saved: 0 };
  let raw = JSON.stringify(run);
  const claim = old.data ? await db.from('seo_settings').update({ setting_value: raw, updated_at: run.updatedAt }).eq('site_id', 'pwd').eq('setting_key', runKey).eq('setting_value', old.data.setting_value).select('id') : await db.from('seo_settings').insert({ site_id: 'pwd', setting_key: runKey, setting_value: raw }).select('id');
  if (claim.error?.code === '23505' || (!claim.error && claim.data?.length !== 1)) return { state: 'in_progress' };
  if (claim.error) throw new Error('Cannot claim rank check');
  async function save(next: RankRun) {
    const serialized = JSON.stringify(next);
    const result = await db.from('seo_settings').update({ setting_value: serialized, updated_at: next.updatedAt }).eq('site_id', 'pwd').eq('setting_key', runKey).eq('setting_value', raw).select('id');
    if (result.error || result.data?.length !== 1) throw new Error('Rank-check lease changed');
    raw = serialized; run = next;
  }
  try {
    const targets = await db.from('seo_target_keywords').select('keyword,status').eq('site_id', 'pwd').in('status', ['active', 'tracking']).order('keyword').limit(21);
    if (targets.error || !targets.data?.length || targets.data.length > 20) throw new Error('Expected one to twenty tracked PWD keywords');
    const keywords = targets.data.filter(k => trackedStatus(k.status));
    if (new Set(keywords.map(k => keywordKey(k.keyword))).size !== keywords.length) throw new Error('Duplicate tracked keyword; check held');
    const auth = 'Basic ' + Buffer.from(login + ':' + password).toString('base64');
    const account = await fetch('https://api.dataforseo.com/v3/appendix/user_data', { headers: { authorization: auth }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const accountData = await account.json();
    // Published price: USD0.002 per ten live results; depth100, no paid extras/operators.
    if (!account.ok || accountData.status_code !== 20000 || accountData.tasks?.[0]?.status_code !== 20000 || !(accountData.tasks?.[0]?.result?.[0]?.money?.balance >= keywords.length * 0.02)) throw new Error('DataForSEO balance or account could not be verified');
    const measure = async (row: { keyword: string }) => {
      const id = rankRowId(day, row.keyword);
      const existing = await db.from('seo_rankings_history').select('id').eq('site_id', 'pwd').eq('id', id).maybeSingle();
      if (existing.error) throw new Error('Cannot verify saved observation');
      if (existing.data) { run.saved++; return; }
      if (/\b(?:site|inurl|intitle|intext|filetype|link|define|id|info|inanchor|allinurl|allintitle|allintext|allinanchor):/i.test(row.keyword)) throw new Error('Search operators require separate review');
      try {
        const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', { method: 'POST', headers: { authorization: auth, 'content-type': 'application/json' }, body: JSON.stringify([{ keyword: row.keyword, location_code: RANK_MARKET.locationCode, language_code: 'en', device: 'desktop', os: 'windows', depth: 100 }]), cache: 'no-store', signal: AbortSignal.timeout(40000) });
        if (!response.ok) throw new Error('DataForSEO HTTP request failed');
        const measured = parseRankResponse(await response.json(), row.keyword);
        const inserted = await db.from('seo_rankings_history').insert({ id, site_id: 'pwd', keyword: row.keyword, position: measured.position, url: measured.url, location: 'Vanuatu', search_engine: 'google', recorded_at: measured.checkedAt.slice(0, 10), competitors: measured.metadata }).select('id');
        if (inserted.error || inserted.data?.length !== 1) throw new Error('Observation save failed');
        run.saved++;
      } catch (error) { run.failures.push({ keyword: row.keyword, error: error instanceof Error ? error.message.slice(0, 180) : 'Measurement unavailable' }); }
    };
    // Three bounded requests at a time keep slow SERPs within the 300-second route limit.
    for (let offset = 0; offset < keywords.length; offset += 3) {
      const chunk = await Promise.allSettled(keywords.slice(offset, offset + 3).map(measure));
      if (chunk.some(item => item.status === 'rejected')) throw new Error('Rank persistence or keyword validation failed');
      await save({ ...run, updatedAt: new Date().toISOString() });
    }
    const ids = keywords.map(k => rankRowId(day, k.keyword));
    const stored = await db.from('seo_rankings_history').select('id,keyword,position,url,competitors').eq('site_id', 'pwd').in('id', ids);
    if (stored.error) throw new Error('Cannot verify measured observations');
    const snapshot = { version: 1, market: RANK_MARKET, updatedAt: new Date().toISOString(), state: run.failures.length ? 'partial' : 'ready', keywords: stored.data.map(r => ({ id: r.id, keyword: r.keyword, position: r.position, url: r.url, ...r.competitors })), failures: run.failures };
    const receipt = await db.from('seo_settings').upsert({ site_id: 'pwd', setting_key: snapshotKey, setting_value: JSON.stringify(snapshot), updated_at: snapshot.updatedAt }, { onConflict: 'site_id,setting_key' }).select('id');
    if (receipt.error || receipt.data?.length !== 1) throw new Error('Rank snapshot save failed');
    await save({ ...run, state: run.failures.length ? 'partial' : 'ready', updatedAt: new Date().toISOString(), saved: stored.data.length });
    return run;
  } catch (error) {
    await save({ ...run, state: 'failed', updatedAt: new Date().toISOString(), failures: [...run.failures, { keyword: '*', error: error instanceof Error ? error.message : 'Rank check failed' }] });
    throw new Error('Rank check failed; review its private run record');
  }
}
