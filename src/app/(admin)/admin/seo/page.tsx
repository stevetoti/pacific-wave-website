'use client';

import { useState } from 'react';

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

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('SEO settings saved!');
    setIsSaving(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">SEO Settings</h1>
          <p className="text-gray-500 mt-1">Configure search engine optimization</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-vibrant-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Analytics 4 ID
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
              <p className="text-gray-400 text-xs mt-2">
                Found in Google Analytics → Admin → Data Streams
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Google Search Console Verification
              </label>
              <input
                type="text"
                value={settings.googleSearchConsoleId}
                onChange={(e) => setSettings({ ...settings, googleSearchConsoleId: e.target.value })}
                placeholder="google-site-verification=XXXX"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
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
      </div>
    </div>
  );
}
