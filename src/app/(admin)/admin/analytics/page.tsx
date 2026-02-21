'use client';

import { useState } from 'react';

interface AnalyticsWidget {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const [isConnected] = useState(false);
  const [dateRange, setDateRange] = useState('last30');

  // Placeholder data for when connected
  const searchConsoleData: SearchQuery[] = [
    { query: 'web development vanuatu', clicks: 245, impressions: 3420, ctr: '7.2%', position: 4.2 },
    { query: 'pacific island digital agency', clicks: 189, impressions: 2890, ctr: '6.5%', position: 5.8 },
    { query: 'ai business automation pacific', clicks: 156, impressions: 2100, ctr: '7.4%', position: 3.9 },
    { query: 'custom software vanuatu', clicks: 134, impressions: 1850, ctr: '7.2%', position: 6.1 },
    { query: 'mobile app development fiji', clicks: 98, impressions: 1200, ctr: '8.2%', position: 4.5 },
  ];

  const trafficSources: TrafficSource[] = [
    { source: 'Organic Search', visitors: 4520, percentage: 45 },
    { source: 'Direct', visitors: 2890, percentage: 29 },
    { source: 'Social Media', visitors: 1560, percentage: 16 },
    { source: 'Referral', visitors: 780, percentage: 8 },
    { source: 'Email', visitors: 250, percentage: 2 },
  ];

  const overviewWidgets: AnalyticsWidget[] = [
    { title: 'Total Visitors', value: '10,245', change: '+12.5%', trend: 'up', icon: '👥' },
    { title: 'Page Views', value: '32,847', change: '+8.3%', trend: 'up', icon: '📄' },
    { title: 'Avg. Session', value: '2m 34s', change: '+5.2%', trend: 'up', icon: '⏱️' },
    { title: 'Bounce Rate', value: '42.3%', change: '-3.1%', trend: 'up', icon: '📊' },
  ];

  const searchWidgets: AnalyticsWidget[] = [
    { title: 'Total Clicks', value: '2,456', change: '+18.2%', trend: 'up', icon: '👆' },
    { title: 'Impressions', value: '45,230', change: '+24.5%', trend: 'up', icon: '👁️' },
    { title: 'Avg. CTR', value: '5.4%', change: '+2.1%', trend: 'up', icon: '📈' },
    { title: 'Avg. Position', value: '8.2', change: '-1.3', trend: 'up', icon: '🎯' },
  ];

  const handleConnectGoogle = () => {
    alert('Google OAuth integration coming soon! Stephen will need to provide:\n\n1. Google Cloud Project credentials\n2. Enable Search Console API\n3. Enable Analytics Data API\n\nContact support to set this up.');
  };

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
            <option value="last365">Last 12 months</option>
          </select>
          {!isConnected && (
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
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleConnectGoogle}
                  className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <span>📊</span> Connect Google Analytics 4
                </button>
                <button
                  onClick={handleConnectGoogle}
                  className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <span>🔍</span> Connect Search Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GA4 Overview Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-bold text-gray-900">Google Analytics Overview</h2>
          {!isConnected && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Sample Data</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewWidgets.map((widget, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{widget.icon}</span>
                <span className={`text-sm font-medium ${widget.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {widget.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{widget.value}</div>
              <div className="text-sm text-gray-500">{widget.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📈</span> Traffic Sources
          </h3>
          <div className="space-y-4">
            {trafficSources.map((source, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{source.source}</span>
                  <span className="text-gray-500">{source.visitors.toLocaleString()} ({source.percentage}%)</span>
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
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📍</span> Top Pages
          </h3>
          <div className="space-y-3">
            {[
              { page: '/', views: 8420, title: 'Home' },
              { page: '/services', views: 4230, title: 'Services' },
              { page: '/blog/ai-automation-guide', views: 2890, title: 'AI Automation Guide' },
              { page: '/contact', views: 2150, title: 'Contact' },
              { page: '/about', views: 1780, title: 'About Us' },
            ].map((page, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{page.title}</p>
                  <p className="text-xs text-gray-400">{page.page}</p>
                </div>
                <span className="text-sm text-gray-600">{page.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Console Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔍</span>
          <h2 className="text-xl font-bold text-gray-900">Search Console Performance</h2>
          {!isConnected && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Sample Data</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {searchWidgets.map((widget, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{widget.icon}</span>
                <span className={`text-sm font-medium ${widget.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {widget.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{widget.value}</div>
              <div className="text-sm text-gray-500">{widget.title}</div>
            </div>
          ))}
        </div>

        {/* Search Queries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Top Search Queries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Query</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Clicks</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Impressions</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">CTR</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchConsoleData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.query}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.impressions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="text-green-600 font-medium">{row.ctr}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className={`font-medium ${row.position <= 5 ? 'text-green-600' : row.position <= 10 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {row.position}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚙️</span> Setup Instructions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Google Analytics 4</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener" className="underline">Google Analytics</a></li>
              <li>Create a new GA4 property for pacificwavedigital.com</li>
              <li>Copy the Measurement ID (G-XXXXXXXXXX)</li>
              <li>Add it to the SEO Settings page</li>
            </ol>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Search Console</h4>
            <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="underline">Search Console</a></li>
              <li>Add pacificwavedigital.com as a property</li>
              <li>Verify ownership (DNS or HTML file)</li>
              <li>Wait 24-48 hours for data to appear</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>🔐 For OAuth Integration:</strong> To display real data directly in this dashboard, 
            we need to set up Google Cloud OAuth. This requires creating a Google Cloud project, 
            enabling the relevant APIs, and configuring credentials. Contact Stephen to set this up.
          </p>
        </div>
      </div>
    </div>
  );
}
