import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { checked } from './lms';
export async function allowedPeers(db: SupabaseClient, me: string, ids: string[]) {
  if (!ids.length) return new Set<string>();
  const rows = checked(await db.rpc('pwd_lms_allowed_peers', { p_me: me, p_users: Array.from(new Set(ids)) })) as { user_id: string }[];
  return new Set(rows.map(row => row.user_id));
}
export const isPeerNotification = (kind: string) => ['message', 'connection_request', 'connection_accepted'].includes(kind);
