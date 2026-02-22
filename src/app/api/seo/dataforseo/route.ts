import { NextResponse } from 'next/server';

// DataForSEO API credentials
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

const getAuthHeader = () => {
  const credentials = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
};

// Base API URL
const API_BASE = 'https://api.dataforseo.com/v3';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
      return NextResponse.json(
        { error: 'DataForSEO credentials not configured' },
        { status: 500 }
      );
    }

    let endpoint = '';
    let requestBody: any[] = [];

    switch (action) {
      case 'keyword_data':
        // Get keyword search volume, CPC, competition
        endpoint = '/keywords_data/google_ads/search_volume/live';
        requestBody = [{
          keywords: params.keywords,
          location_code: params.location_code || 2548, // Vanuatu
          language_code: params.language_code || 'en',
        }];
        break;

      case 'keyword_suggestions':
        // Get related keyword ideas
        endpoint = '/keywords_data/google_ads/keywords_for_keywords/live';
        requestBody = [{
          keywords: params.keywords,
          location_code: params.location_code || 2548,
          language_code: params.language_code || 'en',
          include_seed_keyword: true,
          limit: params.limit || 50,
        }];
        break;

      case 'serp_overview':
        // Get SERP results for a keyword
        endpoint = '/serp/google/organic/live/regular';
        requestBody = [{
          keyword: params.keyword,
          location_code: params.location_code || 2548,
          language_code: params.language_code || 'en',
          device: params.device || 'desktop',
          depth: params.depth || 10,
        }];
        break;

      case 'rank_tracker':
        // Check ranking for specific domain + keyword
        endpoint = '/serp/google/organic/live/regular';
        requestBody = [{
          keyword: params.keyword,
          location_code: params.location_code || 2548,
          language_code: params.language_code || 'en',
          device: 'desktop',
          depth: 100, // Check top 100 results
        }];
        break;

      case 'domain_overview':
        // Get domain SEO metrics
        endpoint = '/dataforseo_labs/google/domain_metrics_by_categories/live';
        requestBody = [{
          target: params.domain,
          location_code: params.location_code || 2840, // US for better data
          language_code: 'en',
        }];
        break;

      case 'competitor_keywords':
        // Find keywords competitors rank for
        endpoint = '/dataforseo_labs/google/competitors_domain/live';
        requestBody = [{
          target: params.domain,
          location_code: params.location_code || 2840,
          language_code: 'en',
          limit: params.limit || 50,
        }];
        break;

      case 'content_ideas':
        // Get content ideas based on keyword
        endpoint = '/keywords_data/google_ads/keywords_for_keywords/live';
        requestBody = [{
          keywords: [params.keyword],
          location_code: params.location_code || 2548,
          language_code: 'en',
          include_seed_keyword: false,
          limit: 100,
        }];
        break;

      case 'test_connection':
        // Simple test to verify API credentials
        endpoint = '/appendix/user_data';
        requestBody = [];
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    console.log(`[DataForSEO] Calling ${endpoint}`);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: requestBody.length > 0 ? JSON.stringify(requestBody) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[DataForSEO] API Error:', data);
      return NextResponse.json(
        { error: data.status_message || 'API request failed', details: data },
        { status: response.status }
      );
    }

    // Process response based on action
    let processedData: any = data;

    if (action === 'keyword_data') {
      // Handle keyword data - check multiple possible response structures
      const result = data.tasks?.[0]?.result;
      console.log('[DataForSEO] Raw result:', JSON.stringify(result));
      
      if (result && Array.isArray(result) && result.length > 0) {
        processedData = {
          keywords: result.map((item: any) => ({
            keyword: item.keyword,
            search_volume: item.search_volume || 0,
            cpc: item.cpc || 0,
            competition: item.competition_index ?? (typeof item.competition === 'number' ? item.competition * 100 : 0),
            competition_level: item.competition || 'UNKNOWN',
            monthly_searches: item.monthly_searches || [],
          })),
        };
        console.log('[DataForSEO] Processed keywords:', JSON.stringify(processedData.keywords));
      } else {
        // No data returned for these keywords
        console.log('[DataForSEO] No keyword data returned. Full response:', JSON.stringify(data));
        processedData = {
          keywords: [],
          message: 'No data found for these keywords. Try more common keywords or a different location.',
          raw_status: data.tasks?.[0]?.status_message,
        };
      }
    }

    if (action === 'keyword_suggestions' && data.tasks?.[0]?.result) {
      processedData = {
        suggestions: data.tasks[0].result.map((item: any) => ({
          keyword: item.keyword,
          search_volume: item.search_volume,
          cpc: item.cpc,
          competition: item.competition,
        })).filter((item: any) => item.search_volume > 0),
      };
    }

    if (action === 'serp_overview' && data.tasks?.[0]?.result?.[0]?.items) {
      processedData = {
        serp: data.tasks[0].result[0].items.map((item: any, index: number) => ({
          position: index + 1,
          title: item.title,
          url: item.url,
          domain: item.domain,
          description: item.description,
        })),
        total_results: data.tasks[0].result[0].se_results_count,
      };
    }

    if (action === 'rank_tracker' && data.tasks?.[0]?.result?.[0]?.items) {
      const targetDomain = params.target_domain || 'pacificwavedigital.com';
      const items = data.tasks[0].result[0].items || [];
      const ranking = items.find((item: any) => 
        item.domain?.includes(targetDomain) || item.url?.includes(targetDomain)
      );
      
      processedData = {
        keyword: params.keyword,
        is_ranking: !!ranking,
        position: ranking ? items.indexOf(ranking) + 1 : null,
        url: ranking?.url || null,
        competitors: items.slice(0, 10).map((item: any, index: number) => ({
          position: index + 1,
          domain: item.domain,
          url: item.url,
          title: item.title,
        })),
      };
    }

    if (action === 'test_connection') {
      processedData = {
        connected: true,
        balance: data.tasks?.[0]?.result?.[0]?.money?.balance,
        limits: data.tasks?.[0]?.result?.[0]?.limits,
      };
    }

    return NextResponse.json({
      success: true,
      action,
      data: processedData,
      raw: data, // Include raw response for debugging
    });

  } catch (error) {
    console.error('[DataForSEO] Error:', error);
    return NextResponse.json(
      { error: 'Failed to call DataForSEO API', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for simple tests
export async function GET() {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    return NextResponse.json({ 
      configured: false, 
      message: 'DataForSEO credentials not set' 
    });
  }

  try {
    const response = await fetch(`${API_BASE}/appendix/user_data`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      configured: true,
      connected: response.ok,
      balance: data.tasks?.[0]?.result?.[0]?.money?.balance,
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      connected: false,
      error: String(error),
    });
  }
}
