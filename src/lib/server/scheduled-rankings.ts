import 'server-only';
import { z } from 'zod';
import { RANK_AUTOMATION, rankingScheduleDue, nextWeeklyRanking, nextRankingInvocation } from '../rank-schedule';
import { getSupabaseAdmin } from './clients';
import { refreshPWDRankings } from './pwd-rankings';

const configSchema = z.object({ enabled: z.boolean(), version: z.literal(1), cron: z.literal(RANK_AUTOMATION.cron), timezone: z.literal('Pacific/Efate') }).passthrough();
export async function runScheduledRankings(now = new Date()) {
  if (process.env.VERCEL_ENV !== 'production') return { state: 'disabled_environment' };
  if (!rankingScheduleDue(now)) return { state: 'not_due', nextRun: nextWeeklyRanking(now) };
  const db = getSupabaseAdmin();
  const stored = await db.from('seo_settings').select('setting_value').eq('site_id', 'pwd').eq('setting_key', 'rank_automation').maybeSingle();
  if (stored.error) throw new Error('Cannot read automatic ranking configuration');
  if (!stored.data?.setting_value) return { state: 'not_configured' };
  const raw: string = stored.data.setting_value;
  const config = configSchema.parse(JSON.parse(raw));
  if (!config.enabled) return { state: 'disabled' };
  const saveReceipt = async (lastRun: { checkedAt: string; state: string; saved?: number; failures?: unknown }) => {
    const setting_value = JSON.stringify({ ...config, lastRun });
    const saved = await db.from('seo_settings').update({ setting_value, updated_at: new Date().toISOString() }).eq('site_id', 'pwd').eq('setting_key', 'rank_automation').eq('setting_value', raw).select('id');
    if (saved.error || saved.data?.length !== 1) throw new Error('Automatic rank receipt could not be saved');
    const status = lastRun.state === 'ready' ? 'ok' : lastRun.state === 'already_checked' ? 'skipped' : lastRun.state === 'in_progress' ? 'running' : 'error';
    const registry = await db.from('cron_jobs').update({ last_run_at: lastRun.checkedAt, last_status: status, last_output: `${lastRun.state}; ${lastRun.saved ?? 0} measurements saved`, last_error: status === 'error' ? 'Incomplete ranking check; inspect SEO records' : null, next_run_at: nextRankingInvocation(new Date()), updated_at: new Date().toISOString() }).eq('slug', 'pwd-weekly-rankings').select('id');
    if (registry.error || registry.data?.length !== 1) throw new Error('Automatic rank registry receipt could not be saved');
  };
  try {
    const result = await refreshPWDRankings(now);
    await saveReceipt({ checkedAt: new Date().toISOString(), state: result.state, saved: 'saved' in result ? result.saved : undefined, failures: 'failures' in result ? result.failures : undefined });
    return result;
  } catch {
    await saveReceipt({ checkedAt: new Date().toISOString(), state: 'failed' });
    throw new Error('Scheduled rank check failed; inspect private ranking state');
  }
}
