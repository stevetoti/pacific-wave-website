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

    // Calculate date range (last 28 days including today)
    // Note: Search Console API has 2-3 day data delay, but we include today just in case
    const endDate = new Date();
    // Don't subtract 1 - include today for freshest possible data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Try each site URL format until one works
    let summaryData = null;
    let queryData = null;
    let lastError = null;
    let workingSiteUrl = null;
    
    for (const siteUrl of SITE_URLS) {
      console.log(`[SearchConsole] Trying site URL: ${siteUrl}`);
      
      // First, get overall summary (no dimensions - gets total clicks/impressions)
      const summaryResponse = await fetch(
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
            // No dimensions = get totals
          }),
        }
      );

      const summaryResponseData = await summaryResponse.json();

      if (summaryResponse.ok) {
        console.log(`[SearchConsole] Success with: ${siteUrl}`);
        summaryData = summaryResponseData;
        workingSiteUrl = siteUrl;
        break;
      } else {
        console.log(`[SearchConsole] Failed with ${siteUrl}: ${summaryResponseData.error?.message}`);
        lastError = summaryResponseData.error?.message || 'Failed to fetch Search Console data';
      }
    }

    if (!summaryData || !workingSiteUrl) {
      console.error('Search Console API error - all URLs failed:', lastError);
      return NextResponse.json(
        { error: lastError },
        { status: 403 }
      );
    }

    // Now get query breakdown using the working URL
    const queryResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(workingSiteUrl)}/searchAnalytics/query`,
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
        }),
      }
    );

    if (queryResponse.ok) {
      queryData = await queryResponse.json();
    }

    // Extract summary from summaryData (single row without dimensions)
    const summaryRow = summaryData.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    const summary: SearchConsoleSummary = {
      totalClicks: summaryRow.clicks || 0,
      totalImpressions: summaryRow.impressions || 0,
      avgCtr: summaryRow.ctr || 0,
      avgPosition: summaryRow.position || 0,
    };

    console.log(`[SearchConsole] Summary: ${summary.totalClicks} clicks, ${summary.totalImpressions} impressions`);

    // Transform query data
    const queries: SearchQueryData[] = (queryData?.rows || []).map((row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

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
