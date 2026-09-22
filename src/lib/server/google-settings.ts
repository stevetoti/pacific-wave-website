import 'server-only';
import { getSupabaseAdmin } from './clients';
export async function getAllSettings(_siteId = 'pwd'): Promise<Record<string, string>> {
  const db = getSupabaseAdmin();
  const [{ data: secrets, error }, { data: settings, error: settingsError }] = await Promise.all([
    db.from('integration_secrets').select('key,value').eq('site_id', 'pwd'),
    db.from('site_settings').select('key,value').eq('site_id', 'pwd').in('key', ['google_analytics_id','google_analytics_property_id','google_search_console_id']),
  ]);
  if (error || settingsError) throw new Error('Google integration settings unavailable');
  return Object.fromEntries([...(settings || []), ...(secrets || [])].map(row => [row.key, row.value || '']));
}
export async function upsertSetting(key: string, value: string, _siteId = 'pwd') {
  const { error } = await getSupabaseAdmin().from('integration_secrets').upsert({ site_id: 'pwd', key, value }, { onConflict: 'site_id,key' });
  if (error) throw new Error('Unable to save Google integration');
  return true;
}
export async function getSetting(key: string, _siteId = 'pwd') { return (await getAllSettings())[key] || null; }
