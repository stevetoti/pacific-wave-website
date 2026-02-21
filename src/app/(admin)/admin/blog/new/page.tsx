'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

// Dynamic import for rich text editor
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

export default function NewBlogPost() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent, publish: boolean = true) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Parse keywords into array
    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const postData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      image_url: formData.imageUrl,
      keywords: keywordsArray,
      read_time: formData.readTime,
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
      site_id: 'pwd',
    };

    const { error } = await supabase
      .from('blog_posts')
      .insert(postData);

    if (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post: ' + error.message);
      setIsSubmitting(false);
    } else {
      router.push('/admin/blog');
    }
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e, false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/blog" className="text-gray-500 hover:text-deep-blue text-sm mb-2 inline-block">
            ← Back to Posts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">New Blog Post</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={(e) => handleSubmit(e, true)}
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
                <span>🚀</span>
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, true)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        </div>
      </form>
    </div>
  );
}
