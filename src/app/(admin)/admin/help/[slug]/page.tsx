'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  BookOpen, 
  Clock,
  Eye,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  tags: string[];
  related_feature?: string;
  view_count: number;
  helpful_yes: number;
  helpful_no: number;
  created_at: string;
  updated_at: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
}

export default function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [resolvedParams.slug]);

  const fetchArticle = async () => {
    setIsLoading(true);
    try {
      // Fetch the article
      const res = await fetch(`/api/help/articles/${resolvedParams.slug}?bySlug=true&view=true`);
      const data = await res.json();
      
      if (data.success && data.data) {
        setArticle(data.data);
        
        // Fetch related articles from same category
        const relatedRes = await fetch(`/api/help/articles?category=${data.data.category}&published=true&limit=5`);
        const relatedData = await relatedRes.json();
        if (relatedData.success) {
          // Filter out current article
          const related = (relatedData.data || [])
            .filter((a: RelatedArticle) => a.slug !== resolvedParams.slug)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      }
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!article || feedbackGiven) return;
    
    try {
      const res = await fetch('/api/help/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, helpful }),
      });
      
      if (res.ok) {
        setFeedbackGiven(helpful ? 'yes' : 'no');
        setFeedbackMessage('Thank you for your feedback!');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'getting-started': 'Getting Started',
      'seo-hub': 'SEO Hub',
      'geo': 'GEO (AI Optimization)',
      'blog-management': 'Blog Management',
      'account-settings': 'Account & Settings',
    };
    return labels[category] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-deep-blue rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
        <p className="text-gray-500 mb-6">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link
          href="/admin/help"
          className="inline-flex items-center gap-2 text-vibrant-orange hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/admin/help" className="text-gray-500 hover:text-gray-700">
            Help Center
          </Link>
          <span className="text-gray-300">/</span>
          <Link 
            href={`/admin/help?category=${article.category}`} 
            className="text-gray-500 hover:text-gray-700"
          >
            {getCategoryLabel(article.category)}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{article.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Article Header */}
            <header className="mb-8">
              <span className="inline-block px-3 py-1 bg-deep-blue/10 text-deep-blue text-sm rounded-full mb-4">
                {getCategoryLabel(article.category)}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {formatDate(article.updated_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.view_count} views
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none prose-headings:font-heading prose-a:text-vibrant-orange prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Section */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="text-center">
                {feedbackMessage ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                    <ThumbsUp className="w-4 h-4" />
                    {feedbackMessage}
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 font-medium mb-4">Was this article helpful?</p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleFeedback(true)}
                        disabled={feedbackGiven !== null}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Yes ({article.helpful_yes})
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        disabled={feedbackGiven !== null}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        No ({article.helpful_no})
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </article>

          {/* Back Link */}
          <div className="mt-6">
            <Link
              href="/admin/help"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Related Articles</h3>
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/admin/help/${related.slug}`}
                    className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                      {related.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Need More Help */}
          <div className="bg-gradient-to-br from-deep-blue to-dark-navy rounded-xl p-6 text-white mt-6">
            <h3 className="font-bold mb-2">Need more help?</h3>
            <p className="text-white/70 text-sm mb-4">
              Our support team is ready to assist you.
            </p>
            <a
              href="mailto:hello@pacificwavedigital.com"
              className="inline-block w-full text-center py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
