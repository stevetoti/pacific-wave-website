'use client';

import { useMemo } from 'react';

interface KeywordPlacement {
  title: boolean;
  slug: boolean;
  metaDescription: boolean;
  firstParagraph: boolean;
  headings: boolean;
  imageAlt: boolean;
}

interface SEOKeywordAnalyzerProps {
  focusKeyword: string;
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  imageAlt?: string;
}

export interface KeywordAnalysis {
  placements: KeywordPlacement;
  density: number;
  wordCount: number;
  keywordCount: number;
  score: number;
  status: 'good' | 'ok' | 'poor';
}

export function analyzeKeyword(props: SEOKeywordAnalyzerProps): KeywordAnalysis {
  const { focusKeyword, title, slug, metaDescription, content, imageAlt = '' } = props;
  
  if (!focusKeyword.trim()) {
    return {
      placements: {
        title: false,
        slug: false,
        metaDescription: false,
        firstParagraph: false,
        headings: false,
        imageAlt: false,
      },
      density: 0,
      wordCount: 0,
      keywordCount: 0,
      score: 0,
      status: 'poor',
    };
  }

  const keyword = focusKeyword.toLowerCase().trim();
  
  // Strip HTML for content analysis
  const plainContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  const words = plainContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Count keyword occurrences (including multi-word keywords)
  const keywordRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const keywordCount = (plainContent.match(keywordRegex) || []).length;
  
  // Calculate density as percentage
  const keywordWordCount = keyword.split(/\s+/).length;
  const density = wordCount > 0 ? (keywordCount * keywordWordCount / wordCount) * 100 : 0;
  
  // Extract first paragraph
  const firstParagraphMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
  const firstParagraph = firstParagraphMatch 
    ? firstParagraphMatch[1].replace(/<[^>]*>/g, '').toLowerCase() 
    : plainContent.split('\n')[0]?.toLowerCase() || '';
  
  // Extract H2 and H3 headings
  const headingMatches = content.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [];
  const headingsText = headingMatches.map(h => h.replace(/<[^>]*>/g, '').toLowerCase()).join(' ');
  
  // Check placements
  const placements: KeywordPlacement = {
    title: title.toLowerCase().includes(keyword),
    slug: slug.toLowerCase().includes(keyword.replace(/\s+/g, '-')),
    metaDescription: metaDescription.toLowerCase().includes(keyword),
    firstParagraph: firstParagraph.includes(keyword),
    headings: headingsText.includes(keyword),
    imageAlt: imageAlt.toLowerCase().includes(keyword),
  };
  
  // Calculate score based on placements and density
  let score = 0;
  if (placements.title) score += 20;
  if (placements.slug) score += 15;
  if (placements.metaDescription) score += 15;
  if (placements.firstParagraph) score += 20;
  if (placements.headings) score += 15;
  if (placements.imageAlt) score += 10;
  
  // Adjust score based on density (optimal 1-2%)
  if (density >= 0.5 && density <= 2.5) {
    score += 5;
  } else if (density > 2.5) {
    score -= 10; // Penalty for keyword stuffing
  }
  
  // Determine status
  let status: 'good' | 'ok' | 'poor' = 'poor';
  if (score >= 70) status = 'good';
  else if (score >= 40) status = 'ok';
  
  return {
    placements,
    density: Math.round(density * 100) / 100,
    wordCount,
    keywordCount,
    score,
    status,
  };
}

export default function SEOKeywordAnalyzer({
  focusKeyword,
  title,
  slug,
  metaDescription,
  content,
  imageAlt = '',
}: SEOKeywordAnalyzerProps) {
  const analysis = useMemo(() => 
    analyzeKeyword({ focusKeyword, title, slug, metaDescription, content, imageAlt }),
    [focusKeyword, title, slug, metaDescription, content, imageAlt]
  );
  
  if (!focusKeyword.trim()) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🎯 Focus Keyword Analysis
        </h3>
        <p className="text-sm text-gray-500">
          Enter a focus keyword to see placement analysis
        </p>
      </div>
    );
  }
  
  const getStatusColor = (status: 'good' | 'ok' | 'poor') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'ok': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
    }
  };
  
  const getCheckIcon = (isPresent: boolean) => {
    return isPresent ? (
      <span className="text-green-500">✓</span>
    ) : (
      <span className="text-red-400">✗</span>
    );
  };

  const getDensityColor = (density: number) => {
    if (density >= 0.5 && density <= 2.5) return 'text-green-600';
    if (density > 2.5) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        🎯 Focus Keyword Analysis
      </h3>
      
      {/* Overall Score */}
      <div className={`text-center p-4 rounded-lg mb-4 ${getStatusColor(analysis.status)}`}>
        <div className="text-3xl font-bold">{analysis.score}%</div>
        <div className="text-sm capitalize">{analysis.status} SEO Score</div>
      </div>
      
      {/* Keyword Density */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Keyword Density</span>
          <span className={`text-sm font-bold ${getDensityColor(analysis.density)}`}>
            {analysis.density}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              analysis.density >= 0.5 && analysis.density <= 2.5 
                ? 'bg-green-500' 
                : analysis.density > 2.5 
                  ? 'bg-red-500' 
                  : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(analysis.density * 20, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span className="text-green-500">1-2% optimal</span>
          <span>5%+</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Found &ldquo;{focusKeyword}&rdquo; {analysis.keywordCount} times in {analysis.wordCount} words
        </p>
      </div>
      
      {/* Placement Checklist */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Keyword Placements
        </p>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(analysis.placements.title)}
            <span className="text-sm text-gray-700">Title</span>
          </div>
          <span className="text-xs text-gray-400">+20pts</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(analysis.placements.slug)}
            <span className="text-sm text-gray-700">URL Slug</span>
          </div>
          <span className="text-xs text-gray-400">+15pts</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(analysis.placements.metaDescription)}
            <span className="text-sm text-gray-700">Meta Description</span>
          </div>
          <span className="text-xs text-gray-400">+15pts</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(analysis.placements.firstParagraph)}
            <span className="text-sm text-gray-700">First Paragraph</span>
          </div>
          <span className="text-xs text-gray-400">+20pts</span>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(analysis.placements.headings)}
            <span className="text-sm text-gray-700">H2/H3 Headings</span>
          </div>
          <span className="text-xs text-gray-400">+15pts</span>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {getCheckIcon(analysis.placements.imageAlt)}
            <span className="text-sm text-gray-700">Image Alt Text</span>
          </div>
          <span className="text-xs text-gray-400">+10pts</span>
        </div>
      </div>
      
      {/* Tips */}
      {analysis.score < 70 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-semibold text-blue-700 mb-2">💡 Quick Tips</p>
          <ul className="text-xs text-blue-600 space-y-1">
            {!analysis.placements.title && (
              <li>• Add &ldquo;{focusKeyword}&rdquo; to your title</li>
            )}
            {!analysis.placements.firstParagraph && (
              <li>• Include keyword in the first paragraph</li>
            )}
            {!analysis.placements.headings && (
              <li>• Use keyword in at least one H2 or H3</li>
            )}
            {analysis.density < 0.5 && (
              <li>• Increase keyword usage (aim for 1-2%)</li>
            )}
            {analysis.density > 2.5 && (
              <li>• Reduce keyword usage to avoid stuffing</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
