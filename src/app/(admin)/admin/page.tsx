'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type StatCard = {
  label: string;
  value: string;
  icon: string;
  href: string;
  change?: string;
};

type SeoStatus = {
  ga4: 'connected' | 'not_connected' | 'needs_setup' | 'unknown';
  searchConsole: 'connected' | 'not_connected' | 'unknown';
};

const quickActions = [
  { label: 'New Blog Post', icon: '✍️', href: '/admin/blog/new', color: 'bg-vibrant-orange' },
  { label: 'Upload Media', icon: '📤', href: '/admin/media', color: 'bg-deep-blue' },
  { label: 'SEO Settings', icon: '🔍', href: '/admin/seo', color: 'bg-green-600' },
  { label: 'View Transcripts', icon: '💬', href: '/admin/transcripts', color: 'bg-purple-600' },
];

function formatNumber(n: number) {
  return new Intl.NumberFormat('en-US').format(n);
}

function statusPill(status: 'connected' | 'not_connected' | 'needs_setup' | 'unknown') {
  switch (status) {
    case 'connected':
      return { text: 'Connected', className: 'bg-green-100 text-green-700' };
    case 'needs_setup':
      return { text: 'Needs Setup', className: 'bg-orange-100 text-orange-700' };
    case 'not_connected':
      return { text: 'Not Connected', className: 'bg-yellow-100 text-yellow-700' };
    default:
      return { text: 'Unknown', className: 'bg-gray-100 text-gray-700' };
  }
}

export default function AdminDashboard() {
  const [blogPostsCount, setBlogPostsCount] = useState<number | null>(null);
  const [mediaCount, setMediaCount] = useState<number | null>(null);
  const [pageviews, setPageviews] = useState<number | null>(null);
  const [seoStatus, setSeoStatus] = useState<SeoStatus>({
    ga4: 'unknown',
    searchConsole: 'unknown',
  });

  const stats: StatCard[] = useMemo(() => {
    return [
      {
        label: 'Blog Posts',
        value: blogPostsCount === null ? '—' : formatNumber(blogPostsCount),
        icon: '📝',
        href: '/admin/blog',
        change: blogPostsCount === null ? 'Loading…' : 'From database',
      },
      {
        label: 'Pageviews (28d)',
        value: pageviews === null ? '—' : formatNumber(pageviews),
        icon: '👁️',
        href: '/admin/analytics',
        change: pageviews === null ? 'Connect GA4 to view' : 'Google Analytics',
      },
      {
        label: 'Media Files',
        value: mediaCount === null ? '—' : formatNumber(mediaCount),
        icon: '🖼️',
        href: '/admin/media',
        change: mediaCount === null ? 'Loading…' : 'Supabase Storage',
      },
      {
        label: 'Transcripts',
        value: '—',
        icon: '💬',
        href: '/admin/transcripts',
        change: 'Demo module',
      },
    ];
  }, [blogPostsCount, mediaCount, pageviews]);

  useEffect(() => {
    const run = async () => {
      // 1) Blog posts count
      try {
        const { count } = await supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', 'pwd');
        setBlogPostsCount(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Failed to fetch blog posts count', e);
        setBlogPostsCount(0);
      }

      // 2) Media count (Supabase Storage)
      try {
        const { data, error } = await supabase.storage
          .from('site-assets')
          .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
        if (!error && data) setMediaCount(data.length);
        else setMediaCount(0);
      } catch (e) {
        console.error('Failed to fetch media count', e);
        setMediaCount(0);
      }

      // 3) GA4 (pageviews)
      try {
        const res = await fetch('/api/analytics/ga4', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          setPageviews(json?.overview?.pageviews ?? 0);
          setSeoStatus((s) => ({ ...s, ga4: 'connected' }));
        } else if (res.status === 401) {
          setPageviews(null);
          setSeoStatus((s) => ({ ...s, ga4: 'not_connected' }));
        } else {
          // Often: needs property ID
          setSeoStatus((s) => ({ ...s, ga4: 'needs_setup' }));
        }
      } catch (e) {
        console.error('Failed to fetch GA4', e);
        setSeoStatus((s) => ({ ...s, ga4: 'unknown' }));
      }

      // 4) Search Console connection test
      try {
        const res = await fetch('/api/analytics/search-console', { cache: 'no-store' });
        if (res.ok) {
          setSeoStatus((s) => ({ ...s, searchConsole: 'connected' }));
        } else if (res.status === 401) {
          setSeoStatus((s) => ({ ...s, searchConsole: 'not_connected' }));
        } else {
          setSeoStatus((s) => ({ ...s, searchConsole: 'unknown' }));
        }
      } catch (e) {
        console.error('Failed to fetch Search Console', e);
        setSeoStatus((s) => ({ ...s, searchConsole: 'unknown' }));
      }
    };

    run();
  }, []);

  const gaPill = statusPill(seoStatus.ga4);
  const scPill = statusPill(seoStatus.searchConsole);

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
              {stat.change ? (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{stat.change}</span>
              ) : null}
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

      {/* Recent Posts + SEO Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentPostsCard />

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
              <span className="text-gray-600">Google Analytics (GA4)</span>
              <span className={`text-xs px-2 py-1 rounded-full ${gaPill.className}`}>{gaPill.text}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Google Search Console</span>
              <span className={`text-xs px-2 py-1 rounded-full ${scPill.className}`}>{scPill.text}</span>
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

function RecentPostsCard() {
  const [recentPosts, setRecentPosts] = useState<Array<{ id: string; title: string; created_at: string; published: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id,title,created_at,published')
        .eq('site_id', 'pwd')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent posts:', error);
        setRecentPosts([]);
      } else {
        setRecentPosts(data || []);
      }
      setLoading(false);
    };

    run();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Blog Posts</h2>
        <Link href="/admin/blog" className="text-vibrant-orange text-sm hover:underline">
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{post.title}</p>
                <p className="text-gray-400 text-xs mt-1">{formatDate(post.created_at)}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {post.published ? 'Published' : 'Draft'}
              </span>
            </div>
          ))}

          {recentPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No posts yet</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
