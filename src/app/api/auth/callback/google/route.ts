import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, upsertSetting } from '@/lib/supabase';

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
    if (state !== 'pacific-wave-analytics') {
      return NextResponse.redirect(
        new URL('/admin/analytics?error=invalid_state', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/analytics?error=no_code', request.url)
      );
    }

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
        redirect_uri: 'https://pacificwavedigital.com/api/auth/callback/google',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || tokens.error) {
      console.error('Token exchange error:', tokens);
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
    return NextResponse.redirect(
      new URL('/admin/analytics?success=connected', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/analytics?error=callback_error', request.url)
    );
  }
}
