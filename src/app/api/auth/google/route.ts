import { NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/supabase';

export async function GET() {
  try {
    const settings = await getAllSettings('pwd');
    const clientId = settings['google_client_id'];
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Client ID not configured. Please add it in SEO Settings.' },
        { status: 400 }
      );
    }

    // Build OAuth URL
    const redirectUri = 'https://pacificwavedigital.com/api/auth/callback/google';
    const scopes = [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent', // Force consent to get refresh token
      state: 'pacific-wave-analytics', // CSRF protection
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
