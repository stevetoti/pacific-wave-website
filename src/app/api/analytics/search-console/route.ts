import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/google-auth';

const SITE_URL = 'https://pacificwavedigital.com';

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

    // Fetch search analytics data
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
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

    const data = await response.json();

    if (!response.ok) {
      console.error('Search Console API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to fetch Search Console data' },
        { status: response.status }
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
      summary,
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
