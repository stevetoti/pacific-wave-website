import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export async function authorizeSEO(req: Request): Promise<number | null> {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return 401;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return 503;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user?.email) return 401;
  const { data: admin } = await db.from('admin_users').select('role,is_active').eq('email', user.email).eq('site_id', 'pacific-wave-digital').maybeSingle();
  if (!admin?.is_active || !['super_admin','admin','editor'].includes(admin.role)) return 403;
  return null;
}
