import { authorize } from '@/lib/server/auth';
import { NextResponse } from 'next/server';
import { upsertSetting, getSetting } from '@/lib/server/google-settings';

export async function POST(request: Request) {
  const access = await authorize(request);
  if (access.response) return access.response;
  try {
    // Get current access token to revoke
    const accessToken = await getSetting('google_access_token', 'pwd');
    
    // Revoke token with Google
    if (accessToken) {
      const response = await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: accessToken }),
      });
      if (!response.ok && response.status !== 400) throw new Error('Google revocation failed');
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
