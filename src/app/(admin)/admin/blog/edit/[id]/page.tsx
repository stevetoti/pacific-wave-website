'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>,
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rndegttgwtpkbjtvjgnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

interface SEOAnalysis {
  score: number;
  recommendations: string[];
  keywordDensity: number;
  wordCount: number;
  readabilityScore: number;
}

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
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

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [seoScore, setSeoScore] = useState<SEOAnalysis | null>(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [suggestedAltText, setSuggestedAltText] = useState('');

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

  // API call helper
  const callSEOFunction = async (functionName: string, body: object) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  };

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

  // AI Assistant Functions
  const handleGenerateMeta = async () => {
    if (!formData.content && !formData.title) return;
    setAiLoading('meta');

    try {
      const result = await callSEOFunction('seo-generate-meta', {
        topic: formData.title,
        content: formData.content,
      });
      
      setFormData({
        ...formData,
        excerpt: result.description,
        keywords: result.keywords.join(', '),
      });
      
      // Also set the title if it's better
      if (result.title && !formData.title) {
        setFormData(prev => ({ ...prev, title: result.title }));
      }
    } catch (error) {
      console.error('Generate meta error:', error);
      alert('Failed to generate meta tags');
    } finally {
      setAiLoading(null);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!formData.title && !formData.content) return;
    setAiLoading('keywords');

    try {
      const result = await callSEOFunction('seo-keyword-research', {
        topic: formData.title || 'blog post',
        industry: 'Technology',
        location: 'Pacific Islands',
      });
      
      setSuggestedKeywords(result.keywords.map((k: { keyword: string }) => k.keyword).slice(0, 10));
    } catch (error) {
      console.error('Keyword research error:', error);
      alert('Failed to suggest keywords');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!formData.content) return;
    setAiLoading('analyze');

    try {
      const targetKeyword = formData.keywords.split(',')[0]?.trim() || '';
      const result = await callSEOFunction('seo-analyze-content', {
        content: formData.content,
        targetKeyword,
        title: formData.title,
        description: formData.excerpt,
      });
      
      setSeoScore(result);
    } catch (error) {
      console.error('Content analysis error:', error);
      alert('Failed to analyze content');
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerateAltText = async () => {
    if (!formData.imageUrl) return;
    setAiLoading('alt');

    // Simulated alt text generation based on context
    setTimeout(() => {
      const altText = `${formData.title} - Featured image showing ${formData.category.toLowerCase()} concepts for Pacific Island businesses`;
      setSuggestedAltText(altText);
      setAiLoading(null);
    }, 1500);
  };

  const addKeywordToList = (keyword: string) => {
    const currentKeywords = formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [];
    if (!currentKeywords.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...currentKeywords, keyword].join(', '),
      });
    }
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

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
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
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`px-4 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              showAIPanel 
                ? 'bg-deep-blue text-white' 
                : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>✨</span>
            AI Assistant
          </button>
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className={`${showAIPanel ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
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
            <p className="text-gray-400 text-xs mt-2">
              {formData.title.length}/60 characters (recommended for SEO)
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Excerpt / Meta Description
              </label>
              <button
                type="button"
                onClick={handleGenerateMeta}
                disabled={aiLoading === 'meta'}
                className="text-sm text-vibrant-orange hover:underline flex items-center gap-1"
              >
                {aiLoading === 'meta' ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>✨</span>
                )}
                Generate with AI
              </button>
            </div>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief summary for SEO and previews..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              required
            />
            <p className={`text-xs mt-2 ${formData.excerpt.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.excerpt.length}/160 characters
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

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* SEO Score Indicator */}
          {seoScore && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                📊 SEO Score
              </h3>
              <div className="text-center mb-4">
                <div className={`inline-block text-4xl font-bold px-6 py-3 rounded-full ${getScoreColor(seoScore.score)}`}>
                  {seoScore.score}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Words</p>
                  <p className="font-semibold">{seoScore.wordCount}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Keyword %</p>
                  <p className="font-semibold">{seoScore.keywordDensity}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">RECOMMENDATIONS</p>
                <ul className="text-xs space-y-1">
                  {seoScore.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="text-gray-600 flex items-start gap-1">
                      <span className="text-vibrant-orange">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
              <>
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAltText}
                  disabled={aiLoading === 'alt'}
                  className="mt-2 text-sm text-vibrant-orange hover:underline flex items-center gap-1"
                >
                  {aiLoading === 'alt' ? <span className="animate-spin">⏳</span> : <span>✨</span>}
                  Generate Alt Text
                </button>
                {suggestedAltText && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>Suggested:</strong> {suggestedAltText}
                  </div>
                )}
              </>
            )}
          </div>

          {/* SEO Keywords */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">SEO Keywords</h3>
              <button
                type="button"
                onClick={handleSuggestKeywords}
                disabled={aiLoading === 'keywords'}
                className="text-sm text-vibrant-orange hover:underline flex items-center gap-1"
              >
                {aiLoading === 'keywords' ? <span className="animate-spin">⏳</span> : <span>✨</span>}
                Suggest
              </button>
            </div>
            <textarea
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="Enter keywords separated by commas..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-sm"
            />
            {suggestedKeywords.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Click to add:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedKeywords.map((kw, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addKeywordToList(kw)}
                      className="text-xs px-2 py-1 bg-deep-blue/10 text-deep-blue rounded hover:bg-deep-blue/20 transition-colors"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

        {/* AI Writing Assistant Panel */}
        {showAIPanel && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-deep-blue to-dark-navy rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span>✨</span>
                AI Writing Assistant
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Use AI to optimize your content for search engines
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGenerateMeta}
                  disabled={aiLoading === 'meta'}
                  className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {aiLoading === 'meta' ? <span className="animate-spin">⏳</span> : <span>🏷️</span>}
                  Generate Meta Tags
                </button>

                <button
                  type="button"
                  onClick={handleSuggestKeywords}
                  disabled={aiLoading === 'keywords'}
                  className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {aiLoading === 'keywords' ? <span className="animate-spin">⏳</span> : <span>🔑</span>}
                  Suggest Keywords
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzeContent}
                  disabled={aiLoading === 'analyze' || !formData.content}
                  className="w-full bg-vibrant-orange hover:bg-soft-orange py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  {aiLoading === 'analyze' ? <span className="animate-spin">⏳</span> : <span>📊</span>}
                  Analyze SEO Score
                </button>
              </div>
            </div>

            {/* SEO Checklist */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">SEO Checklist</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className={formData.title.length > 0 && formData.title.length <= 60 ? 'text-green-500' : 'text-gray-300'}>✓</span>
                  <span className={formData.title.length > 0 && formData.title.length <= 60 ? 'text-gray-700' : 'text-gray-400'}>
                    Title under 60 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={formData.excerpt.length > 0 && formData.excerpt.length <= 160 ? 'text-green-500' : 'text-gray-300'}>✓</span>
                  <span className={formData.excerpt.length > 0 && formData.excerpt.length <= 160 ? 'text-gray-700' : 'text-gray-400'}>
                    Description under 160 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={formData.keywords.length > 0 ? 'text-green-500' : 'text-gray-300'}>✓</span>
                  <span className={formData.keywords.length > 0 ? 'text-gray-700' : 'text-gray-400'}>
                    Keywords defined
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={formData.imageUrl ? 'text-green-500' : 'text-gray-300'}>✓</span>
                  <span className={formData.imageUrl ? 'text-gray-700' : 'text-gray-400'}>
                    Featured image set
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={formData.content.length > 300 ? 'text-green-500' : 'text-gray-300'}>✓</span>
                  <span className={formData.content.length > 300 ? 'text-gray-700' : 'text-gray-400'}>
                    Content has 300+ words
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Tips */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h4 className="font-semibold text-amber-800 mb-2 text-sm">💡 Quick Tips</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Include your keyword in the first 100 words</li>
                <li>• Use H2/H3 headings to structure content</li>
                <li>• Add internal links to other pages</li>
                <li>• Keep paragraphs short (2-3 sentences)</li>
              </ul>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
