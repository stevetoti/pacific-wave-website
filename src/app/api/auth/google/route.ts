import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { authorize } from '@/lib/server/auth';
import { getAllSettings } from '@/lib/server/google-settings';
import { apiError, HttpError } from '@/lib/server/http';
export async function POST(request: Request) {
  const access = await authorize(request);
  if (access.response) return access.response;
  try {
    const settings = await getAllSettings();
    if (!settings.google_client_id) throw new HttpError(400, 'Configure Google credentials in SEO Settings first');
    const state = randomBytes(32).toString('hex');
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://pacificwavedigital.com';
    const params = new URLSearchParams({ client_id: settings.google_client_id, redirect_uri: `${origin}/api/auth/callback/google`,
      response_type: 'code', scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly', access_type: 'offline', prompt: 'consent', state });
    const { error } = await access.db.from('oauth_states').insert({ state, site_id: 'pwd', user_id: access.user.id, expires_at: new Date(Date.now() + 600000).toISOString() });
    if (error) throw error;
    const response = NextResponse.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
    response.cookies.set('pwd_oauth_state', state, { httpOnly: true, secure: new URL(origin).protocol === 'https:', sameSite: 'lax', path: '/api/auth/callback/google', maxAge: 600 });
    return response;
  } catch (error) { return apiError(error, '/api/auth/google'); }
}
