import { getSupabaseAdmin } from '@/lib/server/clients';
import { ADMIN_SITE_ID } from '@/lib/server/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, upsertSetting } from '@/lib/server/google-settings';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL('/admin/analytics?error=' + encodeURIComponent(error), request.url)
      );
    }

    // Validate state
    if (!state || state !== request.cookies.get('pwd_oauth_state')?.value) {
      return NextResponse.redirect(
        new URL('/admin/analytics?error=invalid_state', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/analytics?error=no_code', request.url)
      );
    }

    const db = getSupabaseAdmin();
    // Delete-and-return makes state single use, including concurrent callbacks.
    const { data: pending, error: stateError } = await db.from('oauth_states').delete()
      .eq('state', state).eq('site_id', 'pwd').gt('expires_at', new Date().toISOString()).select('user_id').maybeSingle();
    if (stateError || !pending) return NextResponse.redirect(new URL('/admin/analytics?error=expired_state', request.url));
    const { data: { user } } = await db.auth.admin.getUserById(pending.user_id);
    const { data: admin } = await db.from('admin_users').select('role,is_active').eq('email', user?.email || '').eq('site_id', ADMIN_SITE_ID).maybeSingle();
    if (!admin?.is_active || !['admin', 'super_admin'].includes(admin.role)) return NextResponse.redirect(new URL('/admin/analytics?error=access_denied', request.url));

    // Get credentials from settings
    const settings = await getAllSettings('pwd');
    const clientId = settings['google_client_id'];
    const clientSecret = settings['google_client_secret'];

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/admin/analytics?error=missing_credentials', request.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pacificwavedigital.com'}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || tokens.error) {
      console.error('Google token exchange failed');
      return NextResponse.redirect(
        new URL('/admin/analytics?error=' + encodeURIComponent(tokens.error || 'token_error'), request.url)
      );
    }

    // Store refresh token in site_settings
    if (tokens.refresh_token) {
      await upsertSetting('google_refresh_token', tokens.refresh_token, 'pwd');
    }

    // Also store access token and expiry for immediate use
    if (tokens.access_token) {
      await upsertSetting('google_access_token', tokens.access_token, 'pwd');
      const expiresAt = Date.now() + (tokens.expires_in * 1000);
      await upsertSetting('google_token_expires_at', expiresAt.toString(), 'pwd');
    }

    // Redirect back to analytics with success
    const response = NextResponse.redirect(new URL('/admin/analytics?success=connected', request.url));
    response.cookies.set('pwd_oauth_state', '', { path: '/api/auth/callback/google', maxAge: 0 });
    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/analytics?error=callback_error', request.url)
    );
  }
}
