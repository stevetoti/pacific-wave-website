import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/google-auth';
import { getAllSettings, upsertSetting } from '@/lib/supabase';

export interface GA4Overview {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface TopPage {
  page: string;
  pageviews: number;
  users: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

/**
 * Convert GA4 Measurement ID (G-XXXXXXXXX) to numeric Property ID
 * Note: This requires looking up the property ID from the Admin API
 * Once found, we cache it in the database for future use
 */
async function getPropertyId(settings: Record<string, string>, accessToken: string): Promise<string | null> {
  // First, check if we have a stored property ID
  const storedPropertyId = settings['google_analytics_property_id'];
  if (storedPropertyId) {
    return storedPropertyId;
  }

  // Try to find property from measurement ID using Admin API
  const measurementId = settings['google_analytics_id'];
  if (!measurementId) {
    console.log('[GA4] No measurement ID found in settings');
    return null;
  }

  console.log(`[GA4] Auto-detecting property ID for measurement ID: ${measurementId}`);

  try {
    // List all GA4 properties accessible to the user
    const propertiesResponse = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/properties?filter=ancestor:accounts/-',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );
    
    if (!propertiesResponse.ok) {
      const errText = await propertiesResponse.text();
      console.error('[GA4] Failed to list properties:', propertiesResponse.status, errText);
      return null;
    }
    
    const propertiesData = await propertiesResponse.json();
    console.log(`[GA4] Found ${propertiesData.properties?.length || 0} properties`);

    // Search through properties for matching measurement ID
    for (const property of propertiesData.properties || []) {
      // Get data streams to find measurement ID
      const streamsResponse = await fetch(
        `https://analyticsadmin.googleapis.com/v1beta/${property.name}/dataStreams`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );
      
      if (!streamsResponse.ok) {
        console.error(`[GA4] Failed to get streams for ${property.name}`);
        continue;
      }
      
      const streamsData = await streamsResponse.json();

      for (const stream of streamsData.dataStreams || []) {
        if (stream.webStreamData?.measurementId === measurementId) {
          // Extract numeric property ID from property name (properties/123456789)
          const propertyId = property.name.split('/')[1];
          console.log(`[GA4] Found property ID: ${propertyId} for measurement ID: ${measurementId}`);
          
          // Cache the property ID for future requests
          await upsertSetting('google_analytics_property_id', propertyId, 'pwd');
          console.log(`[GA4] Cached property ID in database`);
          
          return propertyId;
        }
      }
    }
    
    console.log(`[GA4] No property found with measurement ID: ${measurementId}`);
  } catch (error) {
    console.error('[GA4] Error looking up property ID:', error);
  }

  return null;
}

export async function GET() {
  try {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not connected to Google', connected: false },
        { status: 401 }
      );
    }

    const settings = await getAllSettings('pwd');
    const propertyId = await getPropertyId(settings, accessToken);

    if (!propertyId) {
      return NextResponse.json(
        { 
          error: 'GA4 Property ID not found. Please add google_analytics_property_id in settings.',
          connected: true,
          needsPropertyId: true,
        },
        { status: 400 }
      );
    }

    // Calculate date range (last 28 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Fetch overview metrics
    const overviewResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
        }),
      }
    );

    const overviewData = await overviewResponse.json();

    if (!overviewResponse.ok) {
      console.error('GA4 overview API error:', overviewData);
      return NextResponse.json(
        { error: overviewData.error?.message || 'Failed to fetch GA4 data' },
        { status: overviewResponse.status }
      );
    }

    // Parse overview
    const overviewRow = overviewData.rows?.[0]?.metricValues || [];
    const overview: GA4Overview = {
      sessions: parseInt(overviewRow[0]?.value || '0'),
      users: parseInt(overviewRow[1]?.value || '0'),
      pageviews: parseInt(overviewRow[2]?.value || '0'),
      bounceRate: parseFloat(overviewRow[3]?.value || '0'),
      avgSessionDuration: parseFloat(overviewRow[4]?.value || '0'),
    };

    // Fetch top pages
    const pagesResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'totalUsers' },
          ],
          limit: 10,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        }),
      }
    );

    const pagesData = await pagesResponse.json();
    const topPages: TopPage[] = (pagesData.rows || []).map((row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => ({
      page: row.dimensionValues[0]?.value || '/',
      pageviews: parseInt(row.metricValues[0]?.value || '0'),
      users: parseInt(row.metricValues[1]?.value || '0'),
    }));

    // Fetch traffic sources
    const sourcesResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          limit: 10,
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),
      }
    );

    const sourcesData = await sourcesResponse.json();
    const totalSessions = overview.sessions || 1;
    const trafficSources: TrafficSource[] = (sourcesData.rows || []).map((row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => {
      const sessions = parseInt(row.metricValues[0]?.value || '0');
      return {
        source: row.dimensionValues[0]?.value || 'Unknown',
        sessions,
        percentage: Math.round((sessions / totalSessions) * 100),
      };
    });

    return NextResponse.json({
      connected: true,
      overview,
      topPages,
      trafficSources,
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GA4 fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GA4 data' },
      { status: 500 }
    );
  }
}
