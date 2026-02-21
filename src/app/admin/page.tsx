'use client';

import Link from 'next/link';

const stats = [
  { label: 'Blog Posts', value: '4', icon: '📝', href: '/admin/blog', change: '+2 this month' },
  { label: 'Total Views', value: '1,234', icon: '👁️', href: '#', change: '+15% vs last month' },
  { label: 'Media Files', value: '23', icon: '🖼️', href: '/admin/media', change: '6 images' },
  { label: 'Transcripts', value: '12', icon: '💬', href: '/admin/transcripts', change: 'Chat + Voice' },
];

const quickActions = [
  { label: 'New Blog Post', icon: '✍️', href: '/admin/blog/new', color: 'bg-vibrant-orange' },
  { label: 'Upload Media', icon: '📤', href: '/admin/media', color: 'bg-deep-blue' },
  { label: 'SEO Settings', icon: '🔍', href: '/admin/seo', color: 'bg-green-600' },
  { label: 'View Transcripts', icon: '💬', href: '/admin/transcripts', color: 'bg-purple-600' },
];

const recentPosts = [
  { title: 'AI Business Automation for Pacific Island Enterprises', status: 'Published', date: 'Feb 15, 2026' },
  { title: 'Why Every Vanuatu Business Needs a Professional Website', status: 'Published', date: 'Feb 10, 2026' },
  { title: 'Mobile App Development for Pacific Island Businesses', status: 'Published', date: 'Feb 5, 2026' },
  { title: 'Digital Marketing Strategies for Pacific Island SMEs', status: 'Published', date: 'Jan 28, 2026' },
];

export default function AdminDashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to Pacific Wave Digital Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}
            >
              <span className="text-2xl block mb-2">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Blog Posts</h2>
            <Link href="/admin/blog" className="text-vibrant-orange text-sm hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">{post.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{post.date}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  post.status === 'Published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">SEO Status</h2>
            <Link href="/admin/seo" className="text-vibrant-orange text-sm hover:underline">
              Configure →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Google Analytics</span>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Not Connected</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Google Search Console</span>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Not Connected</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Sitemap</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Meta Tags</span>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
