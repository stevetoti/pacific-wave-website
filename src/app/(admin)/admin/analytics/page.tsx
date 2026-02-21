'use client';

import { useState, useEffect } from 'react';

interface GA4Overview {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface TopPage {
  page: string;
  pageviews: number;
  users: number;
}

interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchConsoleOverview {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
}

export default function AnalyticsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30');
  const [error, setError] = useState<string | null>(null);
  
  // GA4 Data
  const [ga4Overview, setGa4Overview] = useState<GA4Overview | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  
  // Search Console Data
  const [scOverview, setScOverview] = useState<SearchConsoleOverview | null>(null);
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);

  useEffect(() => {
    checkConnectionAndFetchData();
  }, []);

  const checkConnectionAndFetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check connection status
      const statusRes = await fetch('/api/analytics/connection-status');
      const statusData = await statusRes.json();
      
      if (statusData.connected) {
        setIsConnected(true);
        
        // Fetch GA4 data
        const ga4Res = await fetch('/api/analytics/ga4');
        const ga4Data = await ga4Res.json();
        
        if (ga4Data.connected && !ga4Data.error) {
          setGa4Overview(ga4Data.overview);
          setTopPages(ga4Data.topPages || []);
          setTrafficSources(ga4Data.trafficSources || []);
        } else if (ga4Data.needsPropertyId) {
          setError('GA4 Property ID not found. The system will auto-detect it, or add it manually in SEO Settings.');
        }

        // Fetch Search Console data
        const scRes = await fetch('/api/analytics/search-console');
        const scData = await scRes.json();
        
        if (scData.connected && !scData.error) {
          setScOverview(scData.overview);
          setSearchQueries(scData.queries || []);
        }
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect Google Analytics?')) {
      await fetch('/api/auth/google/disconnect', { method: 'POST' });
      setIsConnected(false);
      setGa4Overview(null);
      setScOverview(null);
      setTopPages([]);
      setTrafficSources([]);
      setSearchQueries([]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-blue mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor your website&apos;s search performance and traffic</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
          </select>
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="bg-vibrant-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-soft-orange transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Connect Google
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          ⚠️ {error}
        </div>
      )}

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔗</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Connect Google Analytics & Search Console</h3>
              <p className="text-gray-600 mt-1">
                Get real-time data by connecting your Google accounts. You&apos;ll be able to see actual visitor statistics, 
                search queries, click-through rates, and more.
              </p>
              <div className="mt-4">
                <button
                  onClick={handleConnectGoogle}
                  className="bg-deep-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                  Connect Google Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Status */}
      {isConnected && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-lg">✅</span>
            <span>Connected to Google Analytics & Search Console</span>
          </div>
          <button
            onClick={checkConnectionAndFetchData}
            className="text-green-700 hover:text-green-900 text-sm font-medium"
          >
            🔄 Refresh Data
          </button>
        </div>
      )}

      {/* GA4 Overview Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-gray-900">Google Analytics Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {ga4Overview ? ga4Overview.users.toLocaleString() : '--'}
            </div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📄</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {ga4Overview ? ga4Overview.pageviews.toLocaleString() : '--'}
            </div>
            <div className="text-sm text-gray-500">Page Views</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {ga4Overview ? formatDuration(ga4Overview.avgSessionDuration) : '--'}
            </div>
            <div className="text-sm text-gray-500">Avg. Session</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {ga4Overview ? `${(ga4Overview.bounceRate * 100).toFixed(1)}%` : '--'}
            </div>
            <div className="text-sm text-gray-500">Bounce Rate</div>
          </div>
        </div>
      </div>

      {/* Traffic Sources & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span> Traffic Sources
          </h3>
          {trafficSources.length > 0 ? (
            <div className="space-y-4">
              {trafficSources.map((source, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{source.source}</span>
                    <span className="text-gray-500">{source.sessions.toLocaleString()} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-deep-blue to-vibrant-orange h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data available yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📍</span> Top Pages
          </h3>
          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.slice(0, 5).map((page, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="truncate max-w-[200px]">
                    <p className="font-medium text-gray-800 truncate">{page.page}</p>
                  </div>
                  <span className="text-sm text-gray-600">{page.pageviews.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No data available yet</p>
          )}
        </div>
      </div>

      {/* Search Console Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔍</span>
          <h2 className="text-xl font-bold text-gray-900">Search Console Performance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">👆</div>
            <div className="text-2xl font-bold text-gray-900">
              {scOverview ? scOverview.totalClicks.toLocaleString() : '--'}
            </div>
            <div className="text-sm text-gray-500">Total Clicks</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">👁️</div>
            <div className="text-2xl font-bold text-gray-900">
              {scOverview ? scOverview.totalImpressions.toLocaleString() : '--'}
            </div>
            <div className="text-sm text-gray-500">Impressions</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900">
              {scOverview ? `${(scOverview.avgCtr * 100).toFixed(1)}%` : '--'}
            </div>
            <div className="text-sm text-gray-500">Avg. CTR</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-900">
              {scOverview ? scOverview.avgPosition.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-500">Avg. Position</div>
          </div>
        </div>

        {/* Top Search Queries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Top Search Queries</h3>
          {searchQueries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Query</th>
                    <th className="pb-3 font-medium text-right">Clicks</th>
                    <th className="pb-3 font-medium text-right">Impressions</th>
                    <th className="pb-3 font-medium text-right">CTR</th>
                    <th className="pb-3 font-medium text-right">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {searchQueries.map((query, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 text-gray-800">{query.query}</td>
                      <td className="py-3 text-right text-gray-600">{query.clicks.toLocaleString()}</td>
                      <td className="py-3 text-right text-gray-600">{query.impressions.toLocaleString()}</td>
                      <td className="py-3 text-right text-green-600">{(query.ctr * 100).toFixed(1)}%</td>
                      <td className="py-3 text-right text-vibrant-orange">{query.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No search data available yet. It may take 24-48 hours for data to appear after connecting.</p>
          )}
        </div>
      </div>
    </div>
  );
}
