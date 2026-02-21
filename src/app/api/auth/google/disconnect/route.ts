import { NextResponse } from 'next/server';
import { upsertSetting, getSetting } from '@/lib/supabase';

export async function POST() {
  try {
    // Get current access token to revoke
    const accessToken = await getSetting('google_access_token', 'pwd');
    
    // Revoke token with Google
    if (accessToken) {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
      });
    }

    // Clear stored tokens
    await upsertSetting('google_refresh_token', '', 'pwd');
    await upsertSetting('google_access_token', '', 'pwd');
    await upsertSetting('google_token_expires_at', '', 'pwd');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google account' },
      { status: 500 }
    );
  }
}
