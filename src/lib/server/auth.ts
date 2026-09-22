import 'server-only';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from './clients';
import type { Role } from '../permissions';

export const SITE_ID = 'pwd';
export const ADMIN_SITE_ID = process.env.ADMIN_SITE_ID || 'pacific-wave-digital';
export const READ_ROLES: Role[] = ['super_admin', 'admin', 'editor', 'viewer'];
export const EDIT_ROLES: Role[] = ['super_admin', 'admin', 'editor'];
export const ADMIN_ROLES: Role[] = ['super_admin', 'admin'];

export async function authorize(request: Request, roles: Role[] = ADMIN_ROLES) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return { response: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  try {
    const db = getSupabaseAdmin();
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user?.email) return { response: NextResponse.json({ error: 'Invalid session' }, { status: 401 }) };
    const { data: profile, error: profileError } = await db.from('admin_users')
      .select('role,is_active').eq('email', user.email).eq('site_id', ADMIN_SITE_ID).maybeSingle();
    if (profileError || !profile?.is_active || !roles.includes(profile.role)) {
      return { response: NextResponse.json({ error: 'Access denied' }, { status: 403 }) };
    }
    return { user, db, response: undefined };
  } catch {
    return { response: NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 }) };
  }
}
