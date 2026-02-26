'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { getWordCount } from '@/lib/blog';
import SEOKeywordAnalyzer from '@/components/admin/SEOKeywordAnalyzer';
import EnhancedSEOChecklist from '@/components/admin/EnhancedSEOChecklist';

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

interface ValidationError {
  field: string;
  message: string;
}

export default function NewBlogPost() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    keywords: '',
    focusKeyword: '',
    readTime: '5 min read',
    imageUrl: '',
    imageAlt: '',
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

  // Publishing gate validation
  const validateForPublishing = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    // Featured image required
    if (!formData.imageUrl || formData.imageUrl.trim() === '') {
      errors.push({
        field: 'imageUrl',
        message: 'Featured image is required for publishing',
      });
    }

    // Meta description (excerpt) 150-160 chars
    if (formData.excerpt.length < 150) {
      errors.push({
        field: 'excerpt',
        message: `Meta description too short (${formData.excerpt.length}/150-160 chars). Add ${150 - formData.excerpt.length} more characters.`,
      });
    } else if (formData.excerpt.length > 160) {
      errors.push({
        field: 'excerpt',
        message: `Meta description too long (${formData.excerpt.length}/160 chars). Remove ${formData.excerpt.length - 160} characters.`,
      });
    }

    // 3-8 keywords
    if (keywordsArray.length < 3) {
      errors.push({
        field: 'keywords',
        message: `At least 3 keywords required (currently ${keywordsArray.length}). Add ${3 - keywordsArray.length} more.`,
      });
    } else if (keywordsArray.length > 8) {
      errors.push({
        field: 'keywords',
        message: `Maximum 8 keywords allowed (currently ${keywordsArray.length}). Remove ${keywordsArray.length - 8}.`,
      });
    }

    // Content 600+ words
    const wordCount = getWordCount(formData.content);
    if (wordCount < 600) {
      errors.push({
        field: 'content',
        message: `Content too short (${wordCount}/600+ words required). Add ${600 - wordCount} more words for SEO.`,
      });
    }

    // Category required
    if (!formData.category) {
      errors.push({
        field: 'category',
        message: 'Category is required for publishing',
      });
    }

    // Title required
    if (!formData.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Title is required',
      });
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = true) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validate before publishing (not for drafts)
    if (publish) {
      const errors = validateForPublishing();
      if (errors.length > 0) {
        setValidationErrors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

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
      image_alt: formData.imageAlt,
      keywords: keywordsArray,
      focus_keyword: formData.focusKeyword,
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

  const wordCount = getWordCount(formData.content);
  const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

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

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h3 className="text-red-800 font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span>
            Cannot Publish - Please Fix These Issues:
          </h3>
          <ul className="space-y-2">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span><strong className="capitalize">{error.field}:</strong> {error.message}</span>
              </li>
            ))}
          </ul>
          <p className="text-red-600 text-xs mt-4">
            You can still save as draft without meeting these requirements.
          </p>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, true)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${validationErrors.some(e => e.field === 'title') ? 'border-red-300' : 'border-gray-100'}`}>
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
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${validationErrors.some(e => e.field === 'excerpt') ? 'border-red-300' : 'border-gray-100'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Excerpt / Meta Description
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief summary for SEO and previews (150-160 characters)..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              required
            />
            <p className={`text-xs mt-2 ${formData.excerpt.length >= 150 && formData.excerpt.length <= 160 ? 'text-green-600' : formData.excerpt.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.excerpt.length}/160 characters 
              {formData.excerpt.length >= 150 && formData.excerpt.length <= 160 && ' ✓'}
              {formData.excerpt.length < 150 && ` (need ${150 - formData.excerpt.length} more)`}
              {formData.excerpt.length > 160 && ` (${formData.excerpt.length - 160} too many)`}
            </p>
          </div>

          {/* Content Editor */}
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${validationErrors.some(e => e.field === 'content') ? 'border-red-300' : 'border-gray-100'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
            <p className={`text-xs mt-2 ${wordCount >= 600 ? 'text-green-600' : 'text-gray-400'}`}>
              {wordCount} words {wordCount >= 600 && '✓'} 
              {wordCount < 600 && ` (need ${600 - wordCount} more for SEO)`}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Focus Keyword - Primary SEO */}
          <div className="bg-gradient-to-br from-deep-blue to-dark-navy rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              🎯 Focus Keyword
            </h3>
            <input
              type="text"
              value={formData.focusKeyword}
              onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
              placeholder="Enter primary keyword..."
              className="w-full px-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibrant-orange text-sm"
            />
            <p className="text-blue-200 text-xs mt-2">
              Your main keyword for this article. This helps track SEO optimization.
            </p>
          </div>

          {/* Focus Keyword Analysis */}
          <SEOKeywordAnalyzer
            focusKeyword={formData.focusKeyword}
            title={formData.title}
            slug={formData.slug}
            metaDescription={formData.excerpt}
            content={formData.content}
            imageAlt={formData.imageAlt}
          />

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
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${validationErrors.some(e => e.field === 'category') ? 'border-red-300' : 'border-gray-100'}`}>
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
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${validationErrors.some(e => e.field === 'imageUrl') ? 'border-red-300' : 'border-gray-100'}`}>
            <h3 className="font-semibold text-gray-900 mb-4">
              Featured Image
              <span className="text-red-500 ml-1">*</span>
            </h3>
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
              <>
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img src={formData.imageUrl} alt={formData.imageAlt || 'Preview'} className="w-full h-32 object-cover" />
                </div>
                {/* Image Alt Text Field */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                    placeholder="Describe the image..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm"
                  />
                  <p className={`text-xs mt-1 ${formData.imageAlt.length > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                    {formData.imageAlt.length > 0 ? '✓ Alt text set' : 'Add alt text for accessibility & SEO'}
                  </p>
                </div>
              </>
            )}
            {!formData.imageUrl && (
              <p className="text-gray-400 text-xs mt-2">Required for publishing</p>
            )}
          </div>

          {/* SEO Keywords */}
          <div className={`bg-white rounded-xl p-6 shadow-sm border ${validationErrors.some(e => e.field === 'keywords') ? 'border-red-300' : 'border-gray-100'}`}>
            <h3 className="font-semibold text-gray-900 mb-4">
              SEO Keywords
              <span className="text-red-500 ml-1">*</span>
            </h3>
            <textarea
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="Enter keywords separated by commas..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm"
            />
            <p className={`text-xs mt-2 ${keywordsArray.length >= 3 && keywordsArray.length <= 8 ? 'text-green-600' : 'text-gray-400'}`}>
              {keywordsArray.length}/8 keywords 
              {keywordsArray.length >= 3 && keywordsArray.length <= 8 && ' ✓'}
              {keywordsArray.length < 3 && ` (need ${3 - keywordsArray.length} more)`}
              {keywordsArray.length > 8 && ` (${keywordsArray.length - 8} too many)`}
            </p>
          </div>

          {/* Enhanced SEO Checklist */}
          <EnhancedSEOChecklist
            focusKeyword={formData.focusKeyword}
            title={formData.title}
            slug={formData.slug}
            excerpt={formData.excerpt}
            content={formData.content}
            keywords={formData.keywords}
            imageUrl={formData.imageUrl}
            imageAlt={formData.imageAlt}
          />
        </div>
      </form>
    </div>
  );
}
