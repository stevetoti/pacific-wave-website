import { authorize, READ_ROLES } from '@/lib/server/auth';
import { NextResponse } from 'next/server';
import { isGoogleConnected } from '@/lib/google-auth';
import { getAllSettings } from '@/lib/server/google-settings';

export async function GET(request: Request) {
  const access = await authorize(request, READ_ROLES);
  if (access.response) return access.response;
  try {
    const connected = await isGoogleConnected();
    const settings = await getAllSettings('pwd');
    
    return NextResponse.json({
      connected,
      hasCredentials: !!(settings['google_client_id'] && settings['google_client_secret']),
      analyticsId: settings['google_analytics_id'] || null,
    });
  } catch (error) {
    console.error('Connection status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}
