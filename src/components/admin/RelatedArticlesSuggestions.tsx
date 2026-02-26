'use client';

import { useState, useEffect } from 'react';
import { supabase, BlogPost } from '@/lib/supabase';

interface RelatedArticlesSuggestionsProps {
  currentPostId: string;
  content: string;
  category: string;
  onInsertLink: (title: string, slug: string) => void;
}

interface SuggestedLink {
  post: BlogPost;
  matchedKeywords: string[];
  relevanceScore: number;
}

export default function RelatedArticlesSuggestions({
  currentPostId,
  content,
  category,
  onInsertLink,
}: RelatedArticlesSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [insertedLinks, setInsertedLinks] = useState<Set<string>>(new Set());

  // Extract existing links from content
  useEffect(() => {
    const linkRegex = /href=["']\/blog\/([^"']+)["']/g;
    const existingLinks = new Set<string>();
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      existingLinks.add(match[1]);
    }
    setInsertedLinks(existingLinks);
  }, [content]);

  const findRelatedArticles = async () => {
    setIsLoading(true);
    
    try {
      // Fetch all published posts except current one
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('site_id', 'pwd')
        .eq('published', true)
        .neq('id', currentPostId);

      if (error || !posts) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Strip HTML from content for analysis
      const plainContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
      
      // Calculate relevance for each post
      const scoredPosts: SuggestedLink[] = posts.map(post => {
        const matchedKeywords: string[] = [];
        let relevanceScore = 0;
        
        // Check category match (high weight)
        if (post.category === category) {
          relevanceScore += 30;
        }
        
        // Check title keywords in content
        const titleWords = post.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
        titleWords.forEach((word: string) => {
          if (plainContent.includes(word)) {
            matchedKeywords.push(word);
            relevanceScore += 5;
          }
        });
        
        // Check post keywords in content
        if (post.keywords && Array.isArray(post.keywords)) {
          post.keywords.forEach((keyword: string) => {
            if (plainContent.includes(keyword.toLowerCase())) {
              matchedKeywords.push(keyword);
              relevanceScore += 10;
            }
          });
        }
        
        // Check if post slug keywords appear in content
        const slugWords = post.slug.split('-').filter((w: string) => w.length > 4);
        slugWords.forEach((word: string) => {
          if (plainContent.includes(word)) {
            relevanceScore += 3;
          }
        });
        
        return {
          post,
          matchedKeywords: Array.from(new Set(matchedKeywords)),
          relevanceScore,
        };
      });
      
      // Sort by relevance and take top 5
      const topSuggestions = scoredPosts
        .filter(s => s.relevanceScore > 10)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);
      
      setSuggestions(topSuggestions);
    } catch (err) {
      console.error('Error finding related articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertLink = (post: BlogPost) => {
    onInsertLink(post.title, post.slug);
    setInsertedLinks(prev => new Set(Array.from(prev).concat(post.slug)));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          🔗 Internal Links
        </h3>
        <button
          type="button"
          onClick={findRelatedArticles}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 bg-deep-blue text-white rounded-lg hover:bg-dark-navy transition-colors disabled:opacity-50"
        >
          {isLoading ? '⏳ Finding...' : '🔍 Find Related'}
        </button>
      </div>
      
      {/* Current internal links count */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Internal Links Found</span>
          <span className={`text-sm font-bold ${
            insertedLinks.size >= 2 && insertedLinks.size <= 5 
              ? 'text-green-600' 
              : insertedLinks.size > 5 
                ? 'text-yellow-600' 
                : 'text-red-600'
          }`}>
            {insertedLinks.size}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Target: 2-5 internal links for SEO</p>
      </div>
      
      {suggestions.length === 0 && !isLoading ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Click &ldquo;Find Related&rdquo; to discover linking opportunities
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.post.id}
              className={`p-3 rounded-lg border transition-all ${
                insertedLinks.has(suggestion.post.slug)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-100 hover:border-deep-blue'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {suggestion.post.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {suggestion.post.category} • Score: {suggestion.relevanceScore}
                  </p>
                  {suggestion.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {suggestion.matchedKeywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {insertedLinks.has(suggestion.post.slug) ? (
                  <span className="text-green-500 text-sm">✓ Linked</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInsertLink(suggestion.post)}
                    className="text-xs px-2 py-1 bg-vibrant-orange text-white rounded hover:bg-soft-orange transition-colors whitespace-nowrap"
                  >
                    + Insert
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* SEO Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Internal Linking Tips</p>
        <ul className="text-xs text-blue-600 space-y-0.5">
          <li>• Link to 2-5 related articles per post</li>
          <li>• Use descriptive anchor text</li>
          <li>• Link early in the content when possible</li>
        </ul>
      </div>
    </div>
  );
}
