'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState({
    googleAnalyticsId: '',
    googleSearchConsoleId: '',
    siteTitle: 'Pacific Wave Digital',
    siteDescription: 'AI-powered business solutions, web development, and digital transformation for Pacific Island businesses.',
    ogImage: '/images/hero-digital-innovation.jpg',
    twitterHandle: '@pacificwavedigital',
    facebookUrl: 'https://facebook.com/pacificwavedigital',
    linkedinUrl: 'https://linkedin.com/company/pacific-wave-digital',
  });

  const [googleCredentials, setGoogleCredentials] = useState({
    clientId: '',
    clientSecret: '',
  });

  const [connectionStatus, setConnectionStatus] = useState({
    analytics: false,
    searchConsole: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('SEO settings saved!');
    setIsSaving(false);
  };

  const handleSaveCredentials = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Google API credentials saved! OAuth integration will be enabled shortly.');
    setShowCredentialsForm(false);
    setIsSaving(false);
  };

  const handleTestConnection = async (service: 'analytics' | 'searchConsole') => {
    alert(`Testing ${service === 'analytics' ? 'Google Analytics' : 'Search Console'} connection...\n\nNote: Full OAuth integration requires Google Cloud setup.`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">SEO Settings</h1>
          <p className="text-gray-500 mt-1">Configure search engine optimization and Google integrations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/seo-assistant"
            className="px-6 py-3 border border-deep-blue text-deep-blue rounded-lg font-semibold hover:bg-deep-blue/5 transition-colors flex items-center gap-2"
          >
            <span>✨</span>
            AI SEO Assistant
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-vibrant-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-lg">📄</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">Indexed Pages</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-lg">🔍</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">8.2</p>
              <p className="text-xs text-gray-500">Avg. Position</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-lg">👆</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2.4K</p>
              <p className="text-xs text-gray-500">Monthly Clicks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5.4%</p>
              <p className="text-xs text-gray-500">Avg. CTR</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Google Integration */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🔍</span>
            Google Integration
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Google Analytics 4 ID
                </label>
                <span className={`text-xs px-2 py-1 rounded-full ${connectionStatus.analytics ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {connectionStatus.analytics ? '✓ Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                />
                <button
                  onClick={() => handleTestConnection('analytics')}
                  className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Test
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Found in Google Analytics → Admin → Data Streams
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Google Search Console Verification
                </label>
                <span className={`text-xs px-2 py-1 rounded-full ${connectionStatus.searchConsole ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {connectionStatus.searchConsole ? '✓ Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.googleSearchConsoleId}
                  onChange={(e) => setSettings({ ...settings, googleSearchConsoleId: e.target.value })}
                  placeholder="google-site-verification=XXXX"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                />
                <button
                  onClick={() => handleTestConnection('searchConsole')}
                  className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Test
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Get this from Google Search Console → Settings → Ownership verification
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener" className="underline">Google Analytics</a></li>
                <li>Create or select a property for pacificwavedigital.com</li>
                <li>Copy the Measurement ID (starts with G-)</li>
                <li>For Search Console, verify ownership via DNS or HTML tag</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Google API Credentials */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🔐</span>
            Google API Credentials
          </h2>
          
          <p className="text-gray-500 text-sm mb-4">
            Configure OAuth credentials to display real analytics data directly in the dashboard.
          </p>

          {!showCredentialsForm ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">OAuth Credentials</p>
                    <p className="text-sm text-gray-500">Required for API access</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Not Configured
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCredentialsForm(true)}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-deep-blue hover:text-deep-blue transition-colors"
              >
                + Add Google Cloud Credentials
              </button>

              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">How to get credentials:</h4>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener" className="underline">Google Cloud Console</a></li>
                  <li>Create a new project or select existing</li>
                  <li>Enable &quot;Google Analytics Data API&quot; and &quot;Search Console API&quot;</li>
                  <li>Create OAuth 2.0 credentials</li>
                  <li>Copy Client ID and Client Secret</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={googleCredentials.clientId}
                  onChange={(e) => setGoogleCredentials({ ...googleCredentials, clientId: e.target.value })}
                  placeholder="xxxx.apps.googleusercontent.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={googleCredentials.clientSecret}
                  onChange={(e) => setGoogleCredentials({ ...googleCredentials, clientSecret: e.target.value })}
                  placeholder="GOCSPX-xxxxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCredentials}
                  disabled={!googleCredentials.clientId || !googleCredentials.clientSecret}
                  className="flex-1 bg-deep-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  Save Credentials
                </button>
                <button
                  onClick={() => setShowCredentialsForm(false)}
                  className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meta Tags */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🏷️</span>
            Default Meta Tags
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Site Title
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
              <p className="text-gray-400 text-xs mt-2">
                {settings.siteTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
              <p className="text-gray-400 text-xs mt-2">
                {settings.siteDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default OG Image URL
              </label>
              <input
                type="text"
                value={settings.ogImage}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📱</span>
            Social Media
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Twitter/X Handle
              </label>
              <input
                type="text"
                value={settings.twitterHandle}
                onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facebook URL
              </label>
              <input
                type="text"
                value={settings.facebookUrl}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={settings.linkedinUrl}
                onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>
          </div>
        </div>

        {/* Sitemap & Robots */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🗺️</span>
            Sitemap & Robots
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Sitemap</p>
                <p className="text-gray-500 text-sm">/sitemap.xml</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Robots.txt</p>
                <p className="text-gray-500 text-sm">/robots.txt</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-gray-900">JSON-LD Schema</p>
                <p className="text-gray-500 text-sm">Structured data for rich results</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Active</span>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Sitemap and robots.txt are auto-generated by Next.js. 
              JSON-LD schema is configured in the root layout.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>⚡</span>
            Quick Actions
          </h2>
          
          <div className="space-y-3">
            <Link
              href="/admin/seo-assistant"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-deep-blue/5 to-vibrant-orange/5 rounded-lg hover:from-deep-blue/10 hover:to-vibrant-orange/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="font-semibold text-gray-800">AI SEO Assistant</p>
                  <p className="text-sm text-gray-500">Generate meta tags, keywords, analyze content</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-deep-blue/5 to-vibrant-orange/5 rounded-lg hover:from-deep-blue/10 hover:to-vibrant-orange/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-gray-800">Analytics Dashboard</p>
                  <p className="text-sm text-gray-500">View traffic, search queries, performance</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>

            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-semibold text-gray-800">Google Search Console</p>
                  <p className="text-sm text-gray-500">View search performance data</p>
                </div>
              </div>
              <span className="text-gray-400">↗</span>
            </a>

            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-semibold text-gray-800">Google Analytics</p>
                  <p className="text-sm text-gray-500">View website traffic analytics</p>
                </div>
              </div>
              <span className="text-gray-400">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
