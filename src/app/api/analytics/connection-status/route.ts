import { NextResponse } from 'next/server';
import { isGoogleConnected } from '@/lib/google-auth';
import { getAllSettings } from '@/lib/supabase';

export async function GET() {
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
