'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase, BlogPost } from '@/lib/supabase';

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

interface SEOAnalysis {
  score: number;
  recommendations: string[];
  keywordDensity: number;
  wordCount: number;
  readabilityScore: number;
}

// AI Dropdown Component
const AIDropdown = ({ 
  onAction, 
  isLoading 
}: { 
  onAction: (action: string) => void;
  isLoading: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    { id: 'generate-all', label: 'Generate All Meta', icon: '🚀', desc: 'Title, description & keywords' },
    { id: 'suggest-titles', label: 'Suggest Titles', icon: '📝', desc: 'Get 5 title ideas' },
    { id: 'generate-meta', label: 'Generate Description', icon: '📄', desc: 'Meta description from content' },
    { id: 'suggest-keywords', label: 'Suggest Keywords', icon: '🔑', desc: 'SEO keyword ideas' },
    { id: 'analyze-seo', label: 'Analyze SEO Score', icon: '📊', desc: 'Check optimization' },
    { id: 'improve-content', label: 'Improve Content', icon: '✨', desc: 'Enhance readability' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
          isOpen 
            ? 'bg-gradient-to-r from-deep-blue to-vibrant-orange text-white shadow-lg' 
            : 'bg-gradient-to-r from-deep-blue to-dark-navy text-white hover:shadow-lg'
        }`}
      >
        {isLoading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <span>✨</span>
        )}
        AI Assistant
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-3 bg-gradient-to-r from-deep-blue to-dark-navy">
            <p className="text-white text-sm font-medium">Quick AI Actions</p>
            <p className="text-white/70 text-xs">Click any action below</p>
          </div>
          <div className="p-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  onAction(action.id);
                  setIsOpen(false);
                }}
                disabled={isLoading === action.id}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-start gap-3 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {isLoading === action.id ? '⏳' : action.icon}
                </span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Inline AI Button Component
const InlineAIButton = ({ 
  onClick, 
  isLoading, 
  label = 'AI',
  tooltip = 'Generate with AI'
}: { 
  onClick: () => void;
  isLoading: boolean;
  label?: string;
  tooltip?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-vibrant-orange hover:text-white hover:bg-vibrant-orange rounded-md transition-all border border-vibrant-orange/30 hover:border-vibrant-orange"
    title={tooltip}
  >
    {isLoading ? (
      <span className="animate-spin text-sm">⏳</span>
    ) : (
      <span className="text-sm">✨</span>
    )}
    {label}
  </button>
);

// Title Suggestions Modal
const TitleSuggestionsModal = ({
  isOpen,
  onClose,
  suggestions,
  onSelect,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onSelect: (title: string) => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b bg-gradient-to-r from-deep-blue to-dark-navy">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📝</span> Suggested Titles
          </h3>
          <p className="text-white/70 text-sm">Click a title to use it</p>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-gray-500">Generating title ideas...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((title, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSelect(title);
                    onClose();
                  }}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-vibrant-orange hover:bg-vibrant-orange/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-800 group-hover:text-vibrant-orange transition-colors">
                      {title}
                    </span>
                    <span className="text-gray-400 group-hover:text-vibrant-orange text-sm whitespace-nowrap">
                      Use →
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${title.length <= 60 ? 'text-green-500' : 'text-red-500'}`}>
                    {title.length <= 60 ? '✓' : '⚠️'} {title.length}/60 characters
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Write some content first, then I can suggest titles!
            </p>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
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

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [seoScore, setSeoScore] = useState<SEOAnalysis | null>(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [suggestedAltText, setSuggestedAltText] = useState('');

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !data) {
      console.error('Error fetching post:', error);
      setNotFound(true);
    } else {
      const post = data as BlogPost;
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : '',
        readTime: post.read_time || '5 min read',
        imageUrl: post.image_url || '',
        published: post.published || false,
      });
    }
    setIsLoading(false);
  };

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

  // Helper: Ensure title is under 60 characters (SEO best practice)
  const ensureSEOTitle = (title: string, maxLength: number = 55): string => {
    if (title.length <= maxLength) return title;
    // Truncate at last word boundary before maxLength
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated;
  };

  // Extract main topic from content
  const extractMainTopic = (content: string): string => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    // Get first meaningful sentence or phrase
    const firstSentence = plainText.split(/[.!?]/)[0]?.trim() || '';
    // Extract key words (skip common words)
    const words = firstSentence.split(/\s+/).filter(w => 
      w.length > 3 && !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'have', 'are', 'was', 'were'].includes(w.toLowerCase())
    );
    return words.slice(0, 3).join(' ');
  };

  // AI Assistant Functions
  const handleSuggestTitles = async () => {
    if (!formData.content && !formData.excerpt) {
      alert('Please add some content first so I can suggest relevant titles.');
      return;
    }
    
    setAiLoading('suggest-titles');
    setShowTitleModal(true);

    try {
      const result = await callSEOFunction('seo-generate-meta', {
        topic: formData.category || 'Technology',
        content: formData.content || formData.excerpt,
        generateTitles: true,
        maxTitleLength: 55, // Leave room for truncation display
      });
      
      // Get topic from content for better titles
      const topic = extractMainTopic(formData.content) || formData.category || 'Business';
      const category = formData.category || 'Business';
      const year = new Date().getFullYear();
      
      // Generate SEO-optimized titles (all under 60 chars)
      const titleTemplates = [
        // From API result (if available and short enough)
        result.title,
        // Template-based titles optimized for length
        `${category} in Vanuatu: A Complete Guide`,
        `${year} Guide to ${category} Success`,
        `Why ${category} Matters in the Pacific`,
        `How to Master ${category} in Vanuatu`,
        `${category} Tips for Pacific Businesses`,
        `The Future of ${category} in Vanuatu`,
        `Essential ${category} Strategies for ${year}`,
        `${category}: What You Need to Know`,
        `Grow Your Business with ${category}`,
      ].filter(Boolean);
      
      // Filter and ensure all titles are under 60 characters
      const validTitles = titleTemplates
        .map(t => ensureSEOTitle(t || '', 55))
        .filter(t => t.length >= 20 && t.length <= 58) // Min 20, max 58 chars
        .filter((t, i, arr) => arr.indexOf(t) === i) // Remove duplicates
        .slice(0, 5);
      
      // If we don't have enough, add some generic but SEO-friendly ones
      while (validTitles.length < 5) {
        const extras = [
          `${category} Solutions That Work`,
          `Smart ${category} for ${year}`,
          `${category} Made Simple`,
          `Your Guide to ${category}`,
          `${category} Best Practices`,
        ];
        const extra = extras[validTitles.length % extras.length];
        if (!validTitles.includes(extra) && extra.length <= 58) {
          validTitles.push(extra);
        } else {
          break;
        }
      }
      
      setSuggestedTitles(validTitles);
    } catch (error) {
      console.error('Title suggestion error:', error);
      // Fallback suggestions - all guaranteed under 60 chars
      const category = formData.category || 'Digital';
      const fallbackTitles = [
        ensureSEOTitle(`${category} Solutions for Your Business`, 55),
        ensureSEOTitle(`How to Succeed with ${category}`, 55),
        ensureSEOTitle(`The Smart Guide to ${category}`, 55),
        ensureSEOTitle(`Why ${category} Matters Today`, 55),
        ensureSEOTitle(`${category} Tips That Actually Work`, 55),
      ];
      setSuggestedTitles(fallbackTitles);
    } finally {
      setAiLoading(null);
    }
  };

  // Helper: Ensure meta description is 150-160 characters (SEO best practice)
  const ensureSEODescription = (text: string, maxLength: number = 155): string => {
    // Remove HTML tags
    const clean = text.replace(/<[^>]*>/g, '').trim();
    if (clean.length <= maxLength) return clean;
    // Truncate at last sentence or word boundary
    let truncated = clean.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastPeriod > maxLength - 30) {
      return truncated.substring(0, lastPeriod + 1);
    }
    return truncated.substring(0, lastSpace) + '...';
  };

  // Helper: Generate SEO-friendly slug (short, keyword-rich)
  const ensureSEOSlug = (text: string): string => {
    // Remove common stop words for shorter slugs
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'that', 'this', 'these', 'those', 'your', 'our', 'their'];
    
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w))
      .slice(0, 5); // Max 5 words for short URLs
    
    return words.join('-');
  };

  const handleGenerateMeta = async () => {
    if (!formData.content && !formData.title) {
      alert('Please add a title or content first.');
      return;
    }
    setAiLoading('generate-meta');

    try {
      const result = await callSEOFunction('seo-generate-meta', {
        topic: formData.title,
        content: formData.content,
        maxDescriptionLength: 155,
      });
      
      // Ensure description is SEO-optimized (150-160 chars)
      const seoDescription = ensureSEODescription(result.description || '', 155);
      
      setFormData(prev => ({
        ...prev,
        excerpt: seoDescription,
      }));
    } catch (error) {
      console.error('Generate meta error:', error);
      // Fallback: generate from content with SEO limits
      const plainContent = formData.content.replace(/<[^>]*>/g, '');
      const excerpt = ensureSEODescription(plainContent, 155);
      setFormData(prev => ({ ...prev, excerpt }));
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!formData.content) {
      alert('Please add some content first.');
      return;
    }
    setAiLoading('generate-all');

    try {
      const result = await callSEOFunction('seo-generate-meta', {
        topic: formData.title || formData.category,
        content: formData.content,
        maxTitleLength: 55,
        maxDescriptionLength: 155,
      });
      
      // Apply SEO best practices to ALL generated fields
      const seoTitle = ensureSEOTitle(result.title || formData.title || `${formData.category} Guide`, 55);
      const seoDescription = ensureSEODescription(result.description || '', 155);
      const seoSlug = ensureSEOSlug(seoTitle);
      const seoKeywords = (result.keywords || [])
        .slice(0, 8) // Max 8 keywords
        .map((k: string) => k.toLowerCase().trim())
        .filter((k: string) => k.length > 2)
        .join(', ');
      
      // Calculate read time based on word count (avg 200 words/min)
      const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      
      setFormData(prev => ({
        ...prev,
        title: prev.title || seoTitle,
        slug: prev.slug || seoSlug,
        excerpt: seoDescription,
        keywords: seoKeywords || prev.keywords,
        readTime: `${readTime} min read`,
      }));
    } catch (error) {
      console.error('Generate all error:', error);
      // Fallback with SEO best practices
      const plainContent = formData.content.replace(/<[^>]*>/g, '');
      const fallbackTitle = ensureSEOTitle(`${formData.category || 'Business'} Guide`, 55);
      const fallbackDesc = ensureSEODescription(plainContent, 155);
      const wordCount = plainContent.split(/\s+/).length;
      
      setFormData(prev => ({
        ...prev,
        title: prev.title || fallbackTitle,
        slug: prev.slug || ensureSEOSlug(fallbackTitle),
        excerpt: fallbackDesc,
        readTime: `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
      }));
    } finally {
      setAiLoading(null);
    }
  };

  const handleSuggestKeywords = async () => {
    if (!formData.title && !formData.content) {
      alert('Please add a title or content first.');
      return;
    }
    setAiLoading('suggest-keywords');

    try {
      const result = await callSEOFunction('seo-keyword-research', {
        topic: formData.title || 'blog post',
        industry: formData.category || 'Technology',
        location: 'Pacific Islands',
        maxKeywords: 8,
      });
      
      // Process keywords: lowercase, trim, remove duplicates, max 8
      const processedKeywords = result.keywords
        .map((k: { keyword: string } | string) => typeof k === 'string' ? k : k.keyword)
        .map((k: string) => k.toLowerCase().trim())
        .filter((k: string) => k.length > 2 && k.length < 30)
        .filter((k: string, i: number, arr: string[]) => arr.indexOf(k) === i)
        .slice(0, 8);
      
      setSuggestedKeywords(processedKeywords);
    } catch (error) {
      console.error('Keyword research error:', error);
      // Fallback: extract keywords from content + category
      const category = formData.category?.toLowerCase() || 'business';
      const contentWords = formData.content
        .replace(/<[^>]*>/g, '')
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 4)
        .slice(0, 3);
      
      const fallbackKeywords = [
        category,
        'vanuatu',
        'pacific islands',
        ...contentWords,
        `${category} solutions`,
        `${category} services`,
      ].filter((k, i, arr) => arr.indexOf(k) === i).slice(0, 8);
      
      setSuggestedKeywords(fallbackKeywords);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!formData.content) {
      alert('Please add some content to analyze.');
      return;
    }
    setAiLoading('analyze-seo');

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
      // Fallback score
      const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      setSeoScore({
        score: Math.min(100, wordCount > 300 ? 70 : 40),
        wordCount,
        keywordDensity: 2,
        readabilityScore: 75,
        recommendations: [
          wordCount < 300 ? 'Add more content (aim for 300+ words)' : 'Good content length!',
          !formData.keywords ? 'Add target keywords' : 'Keywords defined',
          !formData.excerpt ? 'Add a meta description' : 'Meta description set',
        ],
      });
    } finally {
      setAiLoading(null);
    }
  };

  const handleImproveContent = async () => {
    alert('Content improvement coming soon! For now, use the SEO Analysis to get recommendations.');
  };

  const handleAIAction = (actionId: string) => {
    switch (actionId) {
      case 'generate-all':
        handleGenerateAll();
        break;
      case 'suggest-titles':
        handleSuggestTitles();
        break;
      case 'generate-meta':
        handleGenerateMeta();
        break;
      case 'suggest-keywords':
        handleSuggestKeywords();
        break;
      case 'analyze-seo':
        handleAnalyzeContent();
        break;
      case 'improve-content':
        handleImproveContent();
        break;
    }
  };

  const handleGenerateAltText = async () => {
    if (!formData.imageUrl) return;
    setAiLoading('alt');

    setTimeout(() => {
      // Generate SEO-friendly alt text (max 125 characters)
      const category = formData.category?.toLowerCase() || 'business';
      const title = formData.title || category;
      
      // Create concise, descriptive alt text
      let altText = `${title} - ${category} solutions`;
      
      // Ensure it's under 125 characters
      if (altText.length > 120) {
        altText = title.substring(0, 100);
        if (altText.length < title.length) {
          const lastSpace = altText.lastIndexOf(' ');
          altText = altText.substring(0, lastSpace);
        }
      }
      
      // Add location context if there's room
      if (altText.length < 100) {
        altText += ' in Vanuatu';
      }
      
      setSuggestedAltText(altText);
      setAiLoading(null);
    }, 800);
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

    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const updateData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      image_url: formData.imageUrl,
      keywords: keywordsArray,
      read_time: formData.readTime,
      published: formData.published,
      published_at: formData.published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId);

    if (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post: ' + error.message);
      setIsSubmitting(false);
    } else {
      router.push('/admin/blog');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } else {
      router.push('/admin/blog');
    }
  };

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
        <Link href="/admin/blog" className="text-deep-blue hover:underline">
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
          <AIDropdown onAction={handleAIAction} isLoading={aiLoading} />
          <Link
            href={`/blog/preview/${postId}`}
            target="_blank"
            className="px-6 py-3 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Post Title
              </label>
              <InlineAIButton 
                onClick={handleSuggestTitles}
                isLoading={aiLoading === 'suggest-titles'}
                label="Suggest Titles"
                tooltip="Get 5 AI-generated title ideas"
              />
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-xl font-medium"
              required
            />
            <p className={`text-xs mt-2 ${formData.title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.title.length}/60 characters (recommended for SEO)
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Excerpt / Meta Description
              </label>
              <InlineAIButton 
                onClick={handleGenerateMeta}
                isLoading={aiLoading === 'generate-meta'}
                label="Generate"
                tooltip="Generate meta description from content"
              />
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Post Content
              </label>
              <div className="flex gap-2">
                <InlineAIButton 
                  onClick={handleAnalyzeContent}
                  isLoading={aiLoading === 'analyze-seo'}
                  label="Analyze SEO"
                  tooltip="Check SEO score and get recommendations"
                />
              </div>
            </div>
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
              <InlineAIButton 
                onClick={handleSuggestKeywords}
                isLoading={aiLoading === 'suggest-keywords'}
                label="Suggest"
                tooltip="Get AI keyword suggestions"
              />
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

          {/* SEO Checklist */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">📋 SEO Checklist</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={formData.title.length >= 30 && formData.title.length <= 60 ? 'text-green-500' : formData.title.length > 0 ? 'text-yellow-500' : 'text-gray-300'}>
                    {formData.title.length >= 30 && formData.title.length <= 60 ? '✓' : formData.title.length > 60 ? '⚠️' : '○'}
                  </span>
                  <span className="text-gray-700">Title (50-60 chars)</span>
                </div>
                <span className={`text-xs font-mono ${formData.title.length > 60 ? 'text-red-500' : formData.title.length >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
                  {formData.title.length}/60
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={formData.excerpt.length >= 120 && formData.excerpt.length <= 160 ? 'text-green-500' : formData.excerpt.length > 0 ? 'text-yellow-500' : 'text-gray-300'}>
                    {formData.excerpt.length >= 120 && formData.excerpt.length <= 160 ? '✓' : formData.excerpt.length > 160 ? '⚠️' : '○'}
                  </span>
                  <span className="text-gray-700">Description (150-160)</span>
                </div>
                <span className={`text-xs font-mono ${formData.excerpt.length > 160 ? 'text-red-500' : formData.excerpt.length >= 120 ? 'text-green-500' : 'text-gray-400'}`}>
                  {formData.excerpt.length}/160
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={formData.slug.length > 0 && formData.slug.length <= 50 ? 'text-green-500' : formData.slug.length > 50 ? 'text-yellow-500' : 'text-gray-300'}>
                    {formData.slug.length > 0 && formData.slug.length <= 50 ? '✓' : formData.slug.length > 50 ? '⚠️' : '○'}
                  </span>
                  <span className="text-gray-700">URL slug (short)</span>
                </div>
                <span className={`text-xs font-mono ${formData.slug.length > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {formData.slug.length} chars
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const keywordCount = formData.keywords ? formData.keywords.split(',').filter(k => k.trim()).length : 0;
                    const isGood = keywordCount >= 3 && keywordCount <= 8;
                    return (
                      <>
                        <span className={isGood ? 'text-green-500' : keywordCount > 0 ? 'text-yellow-500' : 'text-gray-300'}>
                          {isGood ? '✓' : keywordCount > 8 ? '⚠️' : '○'}
                        </span>
                        <span className="text-gray-700">Keywords (3-8)</span>
                      </>
                    );
                  })()}
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {formData.keywords ? formData.keywords.split(',').filter(k => k.trim()).length : 0} keywords
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={formData.imageUrl ? 'text-green-500' : 'text-gray-300'}>
                    {formData.imageUrl ? '✓' : '○'}
                  </span>
                  <span className="text-gray-700">Featured image</span>
                </div>
                <span className={`text-xs ${formData.imageUrl ? 'text-green-500' : 'text-gray-400'}`}>
                  {formData.imageUrl ? 'Set' : 'Missing'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length;
                    const isGood = wordCount >= 300;
                    return (
                      <>
                        <span className={isGood ? 'text-green-500' : wordCount > 0 ? 'text-yellow-500' : 'text-gray-300'}>
                          {isGood ? '✓' : '○'}
                        </span>
                        <span className="text-gray-700">Content (300+ words)</span>
                      </>
                    );
                  })()}
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length} words
                </span>
              </li>
            </ul>
            
            {/* Overall SEO Score indicator */}
            {(() => {
              let score = 0;
              if (formData.title.length >= 30 && formData.title.length <= 60) score++;
              if (formData.excerpt.length >= 120 && formData.excerpt.length <= 160) score++;
              if (formData.slug.length > 0 && formData.slug.length <= 50) score++;
              const keywordCount = formData.keywords ? formData.keywords.split(',').filter(k => k.trim()).length : 0;
              if (keywordCount >= 3 && keywordCount <= 8) score++;
              if (formData.imageUrl) score++;
              const wordCount = formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length;
              if (wordCount >= 300) score++;
              
              const percentage = Math.round((score / 6) * 100);
              const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">SEO Score</span>
                    <span className={`text-sm font-bold ${percentage >= 80 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <h3 className="font-semibold text-red-700 mb-4">Danger Zone</h3>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              🗑️ Delete Post
            </button>
          </div>
        </div>
      </form>

      {/* Title Suggestions Modal */}
      <TitleSuggestionsModal
        isOpen={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        suggestions={suggestedTitles}
        onSelect={(title) => {
          setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title),
          }));
        }}
        isLoading={aiLoading === 'suggest-titles'}
      />
    </div>
  );
}
