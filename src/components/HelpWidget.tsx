'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  X, 
  Search, 
  MessageCircle, 
  BookOpen,
  ChevronRight,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  snippet?: string;
}

interface WidgetConfig {
  siteId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  accentColor?: string;
  baseUrl?: string;
  defaultCategory?: string;
  allowAskAI?: boolean;
  showSearch?: boolean;
  title?: string;
  subtitle?: string;
}

interface HelpWidgetProps extends WidgetConfig {
  className?: string;
}

const POSITION_CLASSES = {
  'bottom-right': 'fixed bottom-4 right-4',
  'bottom-left': 'fixed bottom-4 left-4',
  'top-right': 'fixed top-4 right-4',
  'top-left': 'fixed top-4 left-4',
};

export function HelpWidget({
  siteId = 'pwd',
  position = 'bottom-right',
  primaryColor = '#233C6F',
  accentColor = '#EF5E33',
  baseUrl = '',
  defaultCategory,
  allowAskAI = true,
  showSearch = true,
  title = 'Help Center',
  subtitle = 'How can we help you?',
  className = '',
}: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'chat'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularArticles, setPopularArticles] = useState<HelpArticle[]>([]);
  
  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);

  // Fetch popular articles on mount
  useEffect(() => {
    if (isOpen && popularArticles.length === 0) {
      fetchPopularArticles();
    }
  }, [isOpen]);

  const fetchPopularArticles = async () => {
    try {
      const params = new URLSearchParams({ limit: '5', siteId });
      if (defaultCategory) params.append('category', defaultCategory);
      
      const res = await fetch(`${baseUrl}/api/help/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPopularArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to fetch popular articles:', err);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`${baseUrl}/api/help/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, siteId, useRAG: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, [baseUrl, siteId]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const sendAIMessage = async () => {
    if (!chatInput.trim() || isAIResponding) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAIResponding(true);

    try {
      const res = await fetch(`${baseUrl}/api/help/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, siteId }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.answer || 'Sorry, I couldn\'t find an answer to that question.',
        }]);
      } else {
        throw new Error('AI request failed');
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setIsAIResponding(false);
    }
  };

  const styles = {
    '--help-primary': primaryColor,
    '--help-accent': accentColor,
  } as React.CSSProperties;

  return (
    <div className={`${POSITION_CLASSES[position]} z-50 ${className}`} style={styles}>
      {/* Widget Panel */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div 
            className="p-4 text-white"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm opacity-90">{subtitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            {allowAskAI && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'search' 
                      ? 'bg-white text-gray-900' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Articles
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'chat' 
                      ? 'bg-white text-gray-900' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Ask AI
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="h-80 overflow-y-auto">
            {activeTab === 'search' ? (
              <div className="p-4">
                {/* Search Input */}
                {showSearch && (
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                )}

                {/* Results or Popular Articles */}
                <div className="space-y-2">
                  {searchQuery ? (
                    searchResults.length > 0 ? (
                      searchResults.map((article) => (
                        <ArticleLink 
                          key={article.id} 
                          article={article} 
                          baseUrl={baseUrl}
                          accentColor={accentColor}
                        />
                      ))
                    ) : !isSearching && (
                      <p className="text-center text-gray-500 py-8">
                        No results found. Try a different search term.
                      </p>
                    )
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">Popular Articles</h4>
                      {popularArticles.map((article) => (
                        <ArticleLink 
                          key={article.id} 
                          article={article} 
                          baseUrl={baseUrl}
                          accentColor={accentColor}
                        />
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Chat Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Ask me anything about using the platform!</p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          msg.role === 'user'
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        style={msg.role === 'user' ? { backgroundColor: primaryColor } : undefined}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isAIResponding && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendAIMessage}
                      disabled={!chatInput.trim() || isAIResponding}
                      className="p-2 text-white rounded-lg transition-colors disabled:opacity-50"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? 'Close help' : 'Open help'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}

// Sub-component for article links
function ArticleLink({ 
  article, 
  baseUrl,
  accentColor,
}: { 
  article: HelpArticle; 
  baseUrl: string;
  accentColor: string;
}) {
  return (
    <a
      href={`${baseUrl}/admin/help/${article.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 group-hover:underline">
            {article.title}
          </h5>
          {article.snippet && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{article.snippet}</p>
          )}
          <span 
            className="text-xs px-2 py-0.5 rounded-full mt-2 inline-block"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            {article.category.replace(/-/g, ' ')}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </a>
  );
}

// Export types for external use
export type { HelpWidgetProps, WidgetConfig, HelpArticle };

// Default export for easy imports
export default HelpWidget;
