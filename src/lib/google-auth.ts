import { getAllSettings, upsertSetting } from './supabase';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Get a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string | null> {
  const settings = await getAllSettings('pwd');
  
  const refreshToken = settings['google_refresh_token'];
  const accessToken = settings['google_access_token'];
  const expiresAt = parseInt(settings['google_token_expires_at'] || '0');
  const clientId = settings['google_client_id'];
  const clientSecret = settings['google_client_secret'];

  // Check if we have a refresh token
  if (!refreshToken) {
    return null;
  }

  // Check if current access token is still valid (with 5 min buffer)
  if (accessToken && expiresAt && Date.now() < expiresAt - 300000) {
    return accessToken;
  }

  // Need to refresh the token
  if (!clientId || !clientSecret) {
    console.error('Missing Google credentials for token refresh');
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('Token refresh failed:', data);
      return null;
    }

    // Store new access token
    await upsertSetting('google_access_token', data.access_token, 'pwd');
    const newExpiresAt = Date.now() + (data.expires_in * 1000);
    await upsertSetting('google_token_expires_at', newExpiresAt.toString(), 'pwd');

    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Check if Google is connected
 */
export async function isGoogleConnected(): Promise<boolean> {
  const settings = await getAllSettings('pwd');
  return !!settings['google_refresh_token'];
}
