import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/google-auth';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Try domain property first (sc-domain:), then URL property
const SITE_URLS = [
  'sc-domain:pacificwavedigital.com',
  'https://pacificwavedigital.com',
  'https://www.pacificwavedigital.com',
];

export interface SearchQueryData {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleSummary {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
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

    // Calculate date range (last 28 days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday (data has 1-day delay)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29); // 28 days before yesterday

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Try each site URL format until one works
    let data = null;
    let lastError = null;
    
    for (const siteUrl of SITE_URLS) {
      console.log(`[SearchConsole] Trying site URL: ${siteUrl}`);
      
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: ['query'],
            rowLimit: 25,
            dataState: 'final',
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        console.log(`[SearchConsole] Success with: ${siteUrl}`);
        data = responseData;
        break;
      } else {
        console.log(`[SearchConsole] Failed with ${siteUrl}: ${responseData.error?.message}`);
        lastError = responseData.error?.message || 'Failed to fetch Search Console data';
      }
    }

    if (!data) {
      console.error('Search Console API error - all URLs failed:', lastError);
      return NextResponse.json(
        { error: lastError },
        { status: 403 }
      );
    }

    // Transform the data
    const queries: SearchQueryData[] = (data.rows || []).map((row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

    // Calculate summary
    const summary: SearchConsoleSummary = {
      totalClicks: queries.reduce((sum, q) => sum + q.clicks, 0),
      totalImpressions: queries.reduce((sum, q) => sum + q.impressions, 0),
      avgCtr: queries.length > 0 
        ? queries.reduce((sum, q) => sum + q.ctr, 0) / queries.length 
        : 0,
      avgPosition: queries.length > 0 
        ? queries.reduce((sum, q) => sum + q.position, 0) / queries.length 
        : 0,
    };

    return NextResponse.json({
      connected: true,
      queries,
      overview: summary,  // Frontend expects 'overview', not 'summary'
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search Console fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Search Console data' },
      { status: 500 }
    );
  }
}
