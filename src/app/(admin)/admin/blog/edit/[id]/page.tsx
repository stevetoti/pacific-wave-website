'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>,
});

const categories = [
  'AI Solutions',
  'Web Development',
  'Mobile Development',
  'Digital Marketing',
  'Business Automation',
  'Cloud & Hosting',
  'Industry Insights',
  'Company News',
];

// Static posts data - will be replaced with Supabase
const postsData: Record<string, {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  keywords: string;
  readTime: string;
  imageUrl: string;
  published: boolean;
}> = {
  '1': {
    title: 'AI Business Automation for Pacific Island Enterprises: A Complete Guide for 2025',
    slug: 'ai-business-automation-pacific-islands-2025',
    excerpt: 'Discover how AI-powered automation is transforming businesses across Vanuatu, Fiji, and the Pacific Islands.',
    content: '<p>AI-powered automation is revolutionizing how Pacific Island businesses operate...</p>',
    category: 'AI Solutions',
    keywords: 'AI automation, Pacific Islands, business automation, Vanuatu AI',
    readTime: '8 min read',
    imageUrl: '/images/services/ai-solutions.jpg',
    published: true,
  },
  '2': {
    title: 'Why Every Vanuatu Business Needs a Professional Website in 2025',
    slug: 'web-development-vanuatu-business-growth',
    excerpt: 'In today\'s digital economy, a professional website is essential for business growth in Vanuatu.',
    content: '<p>The digital landscape in Vanuatu is evolving rapidly...</p>',
    category: 'Web Development',
    keywords: 'web development, Vanuatu, business website, digital presence',
    readTime: '6 min read',
    imageUrl: '/images/services/web-dev.jpg',
    published: true,
  },
  '3': {
    title: 'Mobile App Development for Pacific Island Businesses',
    slug: 'mobile-app-development-pacific-islands',
    excerpt: 'Building mobile apps for the Pacific requires unique considerations.',
    content: '<p>Mobile app development in the Pacific Islands presents unique challenges and opportunities...</p>',
    category: 'Mobile Development',
    keywords: 'mobile apps, Pacific Islands, app development, iOS, Android',
    readTime: '7 min read',
    imageUrl: '/images/services/mobile-apps.jpg',
    published: true,
  },
  '4': {
    title: 'Digital Marketing Strategies That Work for Pacific Island SMEs',
    slug: 'digital-marketing-strategies-pacific-smes',
    excerpt: 'Discover proven digital marketing strategies specifically designed for Pacific businesses.',
    content: '<p>Digital marketing in the Pacific region requires a tailored approach...</p>',
    category: 'Digital Marketing',
    keywords: 'digital marketing, Pacific SMEs, online marketing, social media',
    readTime: '5 min read',
    imageUrl: '/images/services/digital-marketing.jpg',
    published: true,
  },
};

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    keywords: '',
    readTime: '5 min read',
    imageUrl: '',
    published: false,
  });

  useEffect(() => {
    // Load post data
    const post = postsData[postId];
    if (post) {
      setFormData(post);
      setIsLoading(false);
    } else {
      setNotFound(true);
      setIsLoading(false);
    }
  }, [postId]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Updating post:', formData);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Post updated! (Note: Supabase integration pending)');
    setIsSubmitting(false);
    router.push('/admin/blog');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
        <p className="text-gray-500 mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/admin/blog"
          className="text-deep-blue hover:underline"
        >
          ← Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/blog" className="text-gray-500 hover:text-deep-blue text-sm mb-2 inline-block">
            ← Back to Posts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Edit Blog Post</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/blog/${formData.slug}`}
            target="_blank"
            className="px-6 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            👁️ Preview
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-vibrant-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span>💾</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-xl font-medium"
              required
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Excerpt / Summary
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief summary for SEO and previews..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              required
            />
            <p className="text-gray-400 text-xs mt-2">
              {formData.excerpt.length}/160 characters (recommended for SEO)
            </p>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Publish Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.published ? 'published' : 'draft'}
                  onChange={(e) => setFormData({ ...formData, published: e.target.value === 'published' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Read Time
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              required
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Enter image URL..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm mb-3"
            />
            <button
              type="button"
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-deep-blue hover:text-deep-blue transition-colors"
            >
              📤 Upload Image
            </button>
            {formData.imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
              </div>
            )}
          </div>

          {/* SEO Keywords */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">SEO Keywords</h3>
            <textarea
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="Enter keywords separated by commas..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm"
            />
            <p className="text-gray-400 text-xs mt-2">
              e.g., AI automation Pacific, web development Vanuatu
            </p>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <h3 className="font-semibold text-red-700 mb-4">Danger Zone</h3>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
                  alert('Post deleted! (Note: Supabase integration pending)');
                  router.push('/admin/blog');
                }
              }}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              🗑️ Delete Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
