'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  Rocket, 
  Target, 
  Brain, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  TrendingUp,
  X
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  snippet?: string;
  view_count?: number;
}

interface HelpFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: <Rocket className="w-6 h-6" />,
    description: 'Learn the basics and set up your account',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'seo-hub',
    name: 'SEO Hub',
    icon: <Target className="w-6 h-6" />,
    description: 'Track keywords and improve rankings',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'geo',
    name: 'GEO (AI Optimization)',
    icon: <Brain className="w-6 h-6" />,
    description: 'Optimize for AI search engines',
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: 'blog-management',
    name: 'Blog Management',
    icon: <FileText className="w-6 h-6" />,
    description: 'Create and manage blog posts',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'account-settings',
    name: 'Account & Settings',
    icon: <Settings className="w-6 h-6" />,
    description: 'Manage your profile and preferences',
    color: 'from-gray-500 to-slate-600',
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularArticles, setPopularArticles] = useState<HelpArticle[]>([]);
  const [allArticles, setAllArticles] = useState<HelpArticle[]>([]);
  const [faqs, setFaqs] = useState<HelpFAQ[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [showAskAI, setShowAskAI] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<Array<{title: string; slug: string; category: string}>>([]);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all articles for searching
      const articlesRes = await fetch('/api/help/articles?published=true&limit=100');
      const articlesData = await articlesRes.json();
      if (articlesData.success) {
        const articles = articlesData.data || [];
        setAllArticles(articles);
        // Sort by view count and take top 6 for popular
        const sorted = [...articles]
          .sort((a: HelpArticle, b: HelpArticle) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 6);
        setPopularArticles(sorted);
      }

      // Fetch FAQs (we'll create some inline if table is empty)
      // For now, use static FAQs
      setFaqs([
        {
          id: '1',
          question: 'How do I track my website rankings?',
          answer: 'Go to SEO Hub, add your target keywords, and click "Check Rankings". The system will show your current positions in search results along with competitor analysis.',
        },
        {
          id: '2',
          question: 'What is citability and why does it matter?',
          answer: 'Citability measures how likely AI systems (like ChatGPT or Perplexity) are to quote your content. Higher citability scores mean your content is more likely to appear in AI-generated answers, increasing your visibility.',
        },
        {
          id: '3',
          question: 'How do I improve my GEO score?',
          answer: 'Focus on creating clear, factual content with specific numbers and statistics. Use optimal paragraph lengths (134-167 words), add Q&A sections, and cite authoritative sources. Use the Citability Analyzer to get specific recommendations.',
        },
        {
          id: '4',
          question: 'What is llms.txt and do I need it?',
          answer: 'llms.txt is a standardized file that helps AI assistants understand your business. It\'s like robots.txt but for AI crawlers. Having one can improve how accurately AI systems represent your brand.',
        },
        {
          id: '5',
          question: 'How often are rankings updated?',
          answer: 'You can manually check rankings anytime from the SEO Hub. For tracked keywords, we recommend checking at least weekly to monitor changes and identify opportunities.',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    
    try {
      // First try API search
      const res = await fetch('/api/help/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setSearchResults(data.data);
        setIsSearching(false);
        return;
      }
    } catch (error) {
      console.error('API search failed, falling back to client-side:', error);
    }
    
    // Fallback to client-side search
    const filtered = allArticles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(query);
      const snippetMatch = article.snippet?.toLowerCase().includes(query) || false;
      const categoryMatch = article.category?.toLowerCase().includes(query) || false;
      return titleMatch || snippetMatch || categoryMatch;
    }).map(article => ({
      ...article,
      snippet: article.snippet || article.title,
    }));
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsAskingAI(true);
    setAiResponse('');
    setRelatedArticles([]);
    
    try {
      const res = await fetch('/api/help/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiQuestion }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setAiResponse(data.answer);
        if (data.relatedArticles && data.relatedArticles.length > 0) {
          setRelatedArticles(data.relatedArticles);
        }
      } else {
        setAiResponse('Sorry, I couldn\'t process your question. Please try searching for articles or browse the categories below.');
      }
    } catch (error) {
      console.error('AI query failed:', error);
      setAiResponse('Sorry, I couldn\'t process your question. Please try searching for articles or browse the categories below.');
    } finally {
      setIsAskingAI(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-deep-blue to-dark-navy rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading mb-2">
          How can we help you?
        </h1>
        <p className="text-gray-500">
          Search our knowledge base or browse by category
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for articles, guides, and more..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue text-lg shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-deep-blue rounded-full mb-2"></div>
                <p className="text-sm">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/admin/help/${result.slug}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setSearchQuery('')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{result.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{result.snippet}</p>
                        <span className="text-xs text-deep-blue">{result.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="mb-2">No results found for &ldquo;{searchQuery}&rdquo;</p>
                <button
                  onClick={() => setShowAskAI(true)}
                  className="text-vibrant-orange hover:underline text-sm"
                >
                  Ask AI instead →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ask AI Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowAskAI(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5" />
          Ask AI Assistant
        </button>
      </div>

      {/* Ask AI Modal */}
      {showAskAI && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">AI Help Assistant</h3>
                    <p className="text-sm text-gray-500">Ask me anything about the platform</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAskAI(false);
                    setAiQuestion('');
                    setAiResponse('');
                    setRelatedArticles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                />
              </div>
              {aiResponse && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                  {relatedArticles.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-purple-200">
                      <p className="text-xs font-medium text-purple-600 mb-2">Related Articles:</p>
                      <div className="space-y-1">
                        {relatedArticles.map((article, idx) => (
                          <Link
                            key={idx}
                            href={`/admin/help/${article.slug}`}
                            className="block text-sm text-purple-700 hover:text-purple-900 hover:underline"
                            onClick={() => setShowAskAI(false)}
                          >
                            → {article.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleAskAI}
                disabled={!aiQuestion.trim() || isAskingAI}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAskingAI ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Ask Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/admin/help?category=${category.id}`}
            className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
              {category.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.description}</p>
          </Link>
        ))}
      </div>

      {/* Popular Articles */}
      {!isLoading && popularArticles.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-vibrant-orange" />
            <h2 className="text-xl font-bold text-gray-900">Popular Articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/help/${article.slug}`}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4">
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed pl-0">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl">
        <h3 className="font-bold text-gray-900 mb-2">Still need help?</h3>
        <p className="text-gray-500 mb-4">Our support team is here to assist you</p>
        <a
          href="mailto:hello@pacificwavedigital.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-deep-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
}
