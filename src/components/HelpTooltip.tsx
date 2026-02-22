'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  feature: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md';
}

// Predefined help content for common features
const HELP_CONTENT: Record<string, { title: string; summary: string; slug: string }> = {
  citability: {
    title: 'AI Citability Analyzer',
    summary: 'Measures how likely AI systems (ChatGPT, Perplexity, etc.) are to quote your content. Higher scores mean better visibility in AI-generated answers.',
    slug: 'ai-citability-analyzer-guide',
  },
  'brand-authority': {
    title: 'Brand Authority',
    summary: 'Tracks where your brand is mentioned across the web. More quality mentions = higher authority in AI systems.',
    slug: 'understanding-brand-authority',
  },
  'llms-txt': {
    title: 'llms.txt File',
    summary: 'A standardized file that helps AI assistants understand your business. Like robots.txt, but for AI crawlers.',
    slug: 'how-to-generate-llms-txt',
  },
  'ai-platforms': {
    title: 'AI Platforms',
    summary: 'Different AI systems like ChatGPT, Perplexity, and Google AI Overview have different optimization strategies.',
    slug: 'ai-platform-targeting-explained',
  },
  chatgpt: {
    title: 'ChatGPT Optimization',
    summary: 'ChatGPT prefers clear, factual content with specific numbers and well-structured information.',
    slug: 'ai-platform-targeting-explained',
  },
  perplexity: {
    title: 'Perplexity Optimization',
    summary: 'Perplexity favors comprehensive, well-researched content with citations. Optimal paragraph length: 134-167 words.',
    slug: 'ai-platform-targeting-explained',
  },
  'google-ai': {
    title: 'Google AI Overview',
    summary: 'Optimize for featured snippets, use schema markup, and match search intent precisely.',
    slug: 'ai-platform-targeting-explained',
  },
  gemini: {
    title: 'Gemini Optimization',
    summary: 'Google Gemini prefers comprehensive coverage with clear language and multiple perspectives.',
    slug: 'ai-platform-targeting-explained',
  },
  claude: {
    title: 'Claude Optimization',
    summary: 'Claude responds well to nuanced, thoughtful content that acknowledges complexity.',
    slug: 'ai-platform-targeting-explained',
  },
  'seo-hub': {
    title: 'SEO Hub',
    summary: 'Your command center for tracking keywords, rankings, and discovering content opportunities.',
    slug: 'what-is-the-seo-hub',
  },
  keywords: {
    title: 'Keyword Tracking',
    summary: 'Monitor your target keywords, track rankings, and see competitor analysis.',
    slug: 'how-to-track-keywords',
  },
  rankings: {
    title: 'Rankings',
    summary: 'See your current position for tracked keywords and track changes over time.',
    slug: 'checking-your-rankings',
  },
  opportunities: {
    title: 'Content Opportunities',
    summary: 'AI-identified gaps where you can create content to rank for new keywords.',
    slug: 'finding-content-opportunities',
  },
};

export default function HelpTooltip({ feature, position = 'right', size = 'md' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(HELP_CONTENT[feature] || null);

  useEffect(() => {
    // If not in predefined content, try to fetch from API
    if (!HELP_CONTENT[feature]) {
      fetchHelpContent();
    }
  }, [feature]);

  const fetchHelpContent = async () => {
    try {
      const response = await fetch(`/api/help/articles/${feature}?bySlug=true`);
      const result = await response.json();
      if (result.success && result.data) {
        setContent({
          title: result.data.title,
          summary: result.data.content.slice(0, 200) + '...',
          slug: result.data.slug,
        });
      }
    } catch (error) {
      console.error('Failed to fetch help content:', error);
    }
  };

  if (!content) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`text-gray-400 hover:text-deep-blue transition-colors ${
          size === 'sm' ? 'p-0.5' : 'p-1'
        }`}
        aria-label="Help"
      >
        <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-72`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="relative">
            {/* Arrow */}
            <div className={`absolute ${arrowClasses[position]} w-0 h-0`} />
            
            {/* Tooltip content */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-sm">{content.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed mb-3">
                {content.summary}
              </p>
              <Link
                href={`/admin/help/${content.slug}`}
                className="text-xs text-vibrant-orange hover:text-soft-orange font-medium flex items-center gap-1"
                onClick={() => setIsOpen(false)}
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
