'use client';

import { useMemo } from 'react';
import { analyzeKeyword, KeywordAnalysis } from './SEOKeywordAnalyzer';

interface EnhancedSEOChecklistProps {
  focusKeyword: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keywords: string;
  imageUrl: string;
  imageAlt?: string;
}

interface ContentStructure {
  h2Count: number;
  h3Count: number;
  hasProperHierarchy: boolean;
}

interface LinkCounts {
  internal: number;
  external: number;
}

interface ReadabilityResult {
  score: number;
  grade: string;
  status: 'good' | 'ok' | 'poor';
}

function analyzeContentStructure(content: string): ContentStructure {
  const h2Matches = content.match(/<h2[^>]*>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>/gi) || [];
  
  // Check for proper hierarchy (H2 should come before H3 in structure)
  const headingPattern = /<h([23])[^>]*>/gi;
  const headings: number[] = [];
  let match;
  while ((match = headingPattern.exec(content)) !== null) {
    headings.push(parseInt(match[1]));
  }
  
  // Proper hierarchy means no H3 before first H2
  let hasH2 = false;
  let hasProperHierarchy = true;
  for (const level of headings) {
    if (level === 2) hasH2 = true;
    if (level === 3 && !hasH2) hasProperHierarchy = false;
  }
  
  return {
    h2Count: h2Matches.length,
    h3Count: h3Matches.length,
    hasProperHierarchy,
  };
}

function countLinks(content: string): LinkCounts {
  const internalRegex = /href=["'](\/[^"']*|https?:\/\/pacificwavedigital\.com[^"']*)["']/gi;
  const externalRegex = /href=["'](https?:\/\/(?!pacificwavedigital\.com)[^"']+)["']/gi;
  
  const internalMatches = content.match(internalRegex) || [];
  const externalMatches = content.match(externalRegex) || [];
  
  return {
    internal: internalMatches.length,
    external: externalMatches.length,
  };
}

function calculateReadability(content: string): ReadabilityResult {
  // Strip HTML
  const plainText = content.replace(/<[^>]*>/g, ' ').trim();
  
  if (plainText.length === 0) {
    return { score: 0, grade: 'N/A', status: 'poor' };
  }
  
  // Count sentences (approximate)
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);
  
  // Count words
  const words = plainText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = Math.max(words.length, 1);
  
  // Count syllables (simplified)
  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  };
  
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Flesch Reading Ease formula
  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Clamp score between 0 and 100
  const score = Math.round(Math.max(0, Math.min(100, fleschScore)));
  
  // Determine grade
  let grade: string;
  let status: 'good' | 'ok' | 'poor';
  
  if (score >= 80) {
    grade = 'Easy';
    status = 'good';
  } else if (score >= 60) {
    grade = 'Standard';
    status = 'good';
  } else if (score >= 40) {
    grade = 'Difficult';
    status = 'ok';
  } else {
    grade = 'Very Difficult';
    status = 'poor';
  }
  
  return { score, grade, status };
}

export default function EnhancedSEOChecklist({
  focusKeyword,
  title,
  slug,
  excerpt,
  content,
  keywords,
  imageUrl,
  imageAlt = '',
}: EnhancedSEOChecklistProps) {
  const keywordAnalysis = useMemo(() => 
    analyzeKeyword({ focusKeyword, title, slug, metaDescription: excerpt, content, imageAlt }),
    [focusKeyword, title, slug, excerpt, content, imageAlt]
  );
  
  const contentStructure = useMemo(() => analyzeContentStructure(content), [content]);
  const linkCounts = useMemo(() => countLinks(content), [content]);
  const readability = useMemo(() => calculateReadability(content), [content]);
  
  const wordCount = useMemo(() => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.split(/\s+/).filter(w => w.length > 0).length;
  }, [content]);
  
  const keywordCount = keywords.split(',').filter(k => k.trim()).length;
  
  // Calculate overall score
  const overallScore = useMemo(() => {
    let score = 0;
    let maxScore = 0;
    
    // Title (0-10)
    maxScore += 10;
    if (title.length >= 30 && title.length <= 60) score += 10;
    else if (title.length > 0) score += 5;
    
    // Meta description (0-10)
    maxScore += 10;
    if (excerpt.length >= 120 && excerpt.length <= 160) score += 10;
    else if (excerpt.length > 0) score += 5;
    
    // URL slug (0-5)
    maxScore += 5;
    if (slug.length > 0 && slug.length <= 50) score += 5;
    else if (slug.length > 0) score += 3;
    
    // Keywords (0-10)
    maxScore += 10;
    if (keywordCount >= 3 && keywordCount <= 8) score += 10;
    else if (keywordCount > 0) score += 5;
    
    // Featured image (0-5)
    maxScore += 5;
    if (imageUrl) score += 5;
    
    // Content length (0-10)
    maxScore += 10;
    if (wordCount >= 600) score += 10;
    else if (wordCount >= 300) score += 5;
    
    // Focus keyword (0-20)
    maxScore += 20;
    score += Math.round(keywordAnalysis.score * 0.2);
    
    // Internal links (0-10)
    maxScore += 10;
    if (linkCounts.internal >= 2 && linkCounts.internal <= 5) score += 10;
    else if (linkCounts.internal > 0) score += 5;
    
    // External links (0-5)
    maxScore += 5;
    if (linkCounts.external >= 1 && linkCounts.external <= 3) score += 5;
    else if (linkCounts.external > 0) score += 3;
    
    // Content structure (0-10)
    maxScore += 10;
    if (contentStructure.h2Count >= 2 && contentStructure.hasProperHierarchy) score += 10;
    else if (contentStructure.h2Count >= 1) score += 5;
    
    // Readability (0-5)
    maxScore += 5;
    if (readability.status === 'good') score += 5;
    else if (readability.status === 'ok') score += 3;
    
    return Math.round((score / maxScore) * 100);
  }, [title, excerpt, slug, keywordCount, imageUrl, wordCount, keywordAnalysis, linkCounts, contentStructure, readability]);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getCheckIcon = (isGood: boolean, isOk: boolean = false) => {
    if (isGood) return <span className="text-green-500">✓</span>;
    if (isOk) return <span className="text-yellow-500">⚠</span>;
    return <span className="text-gray-300">○</span>;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📋 Enhanced SEO Checklist
      </h3>
      
      {/* Overall Score Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall SEO Score</span>
          <span className={`text-sm font-bold ${
            overallScore >= 80 ? 'text-green-600' : 
            overallScore >= 60 ? 'text-yellow-600' : 
            overallScore >= 40 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {overallScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${getScoreColor(overallScore)}`}
            style={{ width: `${overallScore}%` }}
          />
        </div>
      </div>
      
      {/* Checklist Items */}
      <ul className="space-y-3 text-sm">
        {/* Basic SEO */}
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(title.length >= 30 && title.length <= 60, title.length > 0)}
            <span className="text-gray-700">Title (50-60 chars)</span>
          </div>
          <span className={`text-xs font-mono ${title.length > 60 ? 'text-red-500' : title.length >= 30 ? 'text-green-500' : 'text-gray-400'}`}>
            {title.length}/60
          </span>
        </li>
        
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(excerpt.length >= 120 && excerpt.length <= 160, excerpt.length > 0)}
            <span className="text-gray-700">Meta Description (150-160)</span>
          </div>
          <span className={`text-xs font-mono ${excerpt.length > 160 ? 'text-red-500' : excerpt.length >= 120 ? 'text-green-500' : 'text-gray-400'}`}>
            {excerpt.length}/160
          </span>
        </li>
        
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(slug.length > 0 && slug.length <= 50, slug.length > 0)}
            <span className="text-gray-700">URL Slug (short)</span>
          </div>
          <span className={`text-xs font-mono ${slug.length > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
            {slug.length} chars
          </span>
        </li>
        
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(keywordCount >= 3 && keywordCount <= 8, keywordCount > 0)}
            <span className="text-gray-700">Keywords (3-8)</span>
          </div>
          <span className="text-xs font-mono text-gray-500">
            {keywordCount}
          </span>
        </li>
        
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(!!imageUrl)}
            <span className="text-gray-700">Featured Image</span>
          </div>
          <span className={`text-xs ${imageUrl ? 'text-green-500' : 'text-gray-400'}`}>
            {imageUrl ? 'Set' : 'Missing'}
          </span>
        </li>
        
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(wordCount >= 600, wordCount >= 300)}
            <span className="text-gray-700">Content (600+ words)</span>
          </div>
          <span className="text-xs font-mono text-gray-500">
            {wordCount} words
          </span>
        </li>
        
        {/* Focus Keyword */}
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(keywordAnalysis.score >= 70, keywordAnalysis.score >= 40)}
            <span className="text-gray-700">Focus Keyword Score</span>
          </div>
          <span className={`text-xs font-bold ${
            keywordAnalysis.score >= 70 ? 'text-green-500' : 
            keywordAnalysis.score >= 40 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {keywordAnalysis.score}%
          </span>
        </li>
        
        {/* Keyword Density */}
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(
              keywordAnalysis.density >= 0.5 && keywordAnalysis.density <= 2.5, 
              keywordAnalysis.density > 0
            )}
            <span className="text-gray-700">Keyword Density (1-2%)</span>
          </div>
          <span className={`text-xs font-mono ${
            keywordAnalysis.density >= 0.5 && keywordAnalysis.density <= 2.5 ? 'text-green-500' :
            keywordAnalysis.density > 2.5 ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {keywordAnalysis.density}%
          </span>
        </li>
        
        {/* Internal Links */}
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(
              linkCounts.internal >= 2 && linkCounts.internal <= 5,
              linkCounts.internal > 0
            )}
            <span className="text-gray-700">Internal Links (2-5)</span>
          </div>
          <span className={`text-xs font-mono ${
            linkCounts.internal >= 2 && linkCounts.internal <= 5 ? 'text-green-500' :
            linkCounts.internal > 5 ? 'text-yellow-500' : 'text-gray-500'
          }`}>
            {linkCounts.internal}
          </span>
        </li>
        
        {/* External Links */}
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(
              linkCounts.external >= 1 && linkCounts.external <= 3,
              linkCounts.external > 0
            )}
            <span className="text-gray-700">External Links (1-3)</span>
          </div>
          <span className={`text-xs font-mono ${
            linkCounts.external >= 1 && linkCounts.external <= 3 ? 'text-green-500' : 'text-gray-500'
          }`}>
            {linkCounts.external}
          </span>
        </li>
        
        {/* Content Structure */}
        <li className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {getCheckIcon(
              contentStructure.h2Count >= 2 && contentStructure.hasProperHierarchy,
              contentStructure.h2Count >= 1
            )}
            <span className="text-gray-700">Content Structure (H2/H3)</span>
          </div>
          <span className="text-xs text-gray-500">
            {contentStructure.h2Count}×H2, {contentStructure.h3Count}×H3
          </span>
        </li>
        
        {/* Readability */}
        <li className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {getCheckIcon(readability.status === 'good', readability.status === 'ok')}
            <span className="text-gray-700">Readability</span>
          </div>
          <span className={`text-xs ${
            readability.status === 'good' ? 'text-green-500' :
            readability.status === 'ok' ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {readability.grade} ({readability.score})
          </span>
        </li>
      </ul>
    </div>
  );
}
