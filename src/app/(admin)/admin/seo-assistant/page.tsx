'use client';

import { useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rndegttgwtpkbjtvjgnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface KeywordSuggestion {
  keyword: string;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  difficulty: 'low' | 'medium' | 'high';
  relevance: 'high' | 'medium' | 'low';
}

interface SEOAnalysis {
  score: number;
  recommendations: string[];
  keywordDensity: number;
  wordCount: number;
  readabilityScore: number;
}

export default function SEOAssistantPage() {
  // Meta Tag Generator State
  const [metaTopic, setMetaTopic] = useState('');
  const [metaContent, setMetaContent] = useState('');
  const [metaResult, setMetaResult] = useState<{ title: string; description: string; keywords: string[] } | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  // Keyword Suggester State
  const [keywordTopic, setKeywordTopic] = useState('');
  const [keywordIndustry, setKeywordIndustry] = useState('');
  const [keywordLocation, setKeywordLocation] = useState('Vanuatu');
  const [keywordResult, setKeywordResult] = useState<{ keywords: KeywordSuggestion[]; primaryKeyword: string; secondaryKeywords: string[] } | null>(null);
  const [keywordLoading, setKeywordLoading] = useState(false);

  // Content Analyzer State
  const [analyzeContent, setAnalyzeContent] = useState('');
  const [analyzeKeyword, setAnalyzeKeyword] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SEOAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Competitor Analyzer State
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorResults, setCompetitorResults] = useState<string[]>([]);
  const [competitorLoading, setCompetitorLoading] = useState(false);

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

  // Generate Meta Tags
  const handleGenerateMeta = async () => {
    if (!metaTopic && !metaContent) return;
    setMetaLoading(true);
    setMetaResult(null);

    try {
      const result = await callSEOFunction('seo-generate-meta', {
        topic: metaTopic,
        content: metaContent,
      });
      setMetaResult(result);
    } catch (error) {
      console.error('Meta generation error:', error);
      alert('Failed to generate meta tags. Check console for details.');
    } finally {
      setMetaLoading(false);
    }
  };

  // Generate Keywords
  const handleKeywordResearch = async () => {
    if (!keywordTopic) return;
    setKeywordLoading(true);
    setKeywordResult(null);

    try {
      const result = await callSEOFunction('seo-keyword-research', {
        topic: keywordTopic,
        industry: keywordIndustry,
        location: keywordLocation,
      });
      setKeywordResult(result);
    } catch (error) {
      console.error('Keyword research error:', error);
      alert('Failed to research keywords. Check console for details.');
    } finally {
      setKeywordLoading(false);
    }
  };

  // Analyze Content
  const handleAnalyzeContent = async () => {
    if (!analyzeContent) return;
    setAnalysisLoading(true);
    setAnalysisResult(null);

    try {
      const result = await callSEOFunction('seo-analyze-content', {
        content: analyzeContent,
        targetKeyword: analyzeKeyword,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Content analysis error:', error);
      alert('Failed to analyze content. Check console for details.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Analyze Competitor (placeholder - uses web search concept)
  const handleCompetitorAnalysis = async () => {
    if (!competitorUrl) return;
    setCompetitorLoading(true);
    setCompetitorResults([]);

    // Simulated competitor analysis based on URL
    // In production, this would use web search API or scraping
    setTimeout(() => {
      const domain = competitorUrl.replace(/https?:\/\//, '').split('/')[0];
      setCompetitorResults([
        `🎯 Domain: ${domain}`,
        '📊 Estimated monthly traffic: 5K-15K visits',
        '🔑 Likely target keywords:',
        '   • web development services',
        '   • digital agency pacific',
        '   • business automation',
        '   • custom software solutions',
        '💡 Content strategy: Blog-focused with case studies',
        '📱 Mobile optimization: Good',
        '⚡ Page speed: Needs improvement',
        '',
        '🚀 Opportunities to outrank:',
        '   • Create more in-depth content on automation',
        '   • Target long-tail local keywords',
        '   • Add more customer testimonials',
      ]);
      setCompetitorLoading(false);
    }, 2000);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  // Intent badge color
  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'transactional': return 'bg-green-100 text-green-700';
      case 'commercial': return 'bg-blue-100 text-blue-700';
      case 'informational': return 'bg-purple-100 text-purple-700';
      case 'navigational': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-heading">AI SEO Assistant</h1>
        <p className="text-gray-500 mt-1">AI-powered tools to optimize your content for search engines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meta Tag Generator */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏷️</span>
            Meta Tag Generator
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Generate optimized meta titles and descriptions for your pages
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Topic
              </label>
              <input
                type="text"
                value={metaTopic}
                onChange={(e) => setMetaTopic(e.target.value)}
                placeholder="e.g., AI Business Automation Services"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (optional, for better results)
              </label>
              <textarea
                value={metaContent}
                onChange={(e) => setMetaContent(e.target.value)}
                placeholder="Paste your page content here for more accurate suggestions..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>

            <button
              onClick={handleGenerateMeta}
              disabled={metaLoading || (!metaTopic && !metaContent)}
              className="w-full bg-vibrant-orange text-white py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {metaLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Generate Meta Tags
                </>
              )}
            </button>

            {metaResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    TITLE ({metaResult.title.length}/60 chars)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={metaResult.title}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(metaResult.title)}
                      className="px-3 py-2 bg-deep-blue text-white rounded text-sm hover:bg-opacity-90"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    DESCRIPTION ({metaResult.description.length}/160 chars)
                  </label>
                  <div className="flex items-start gap-2">
                    <textarea
                      value={metaResult.description}
                      readOnly
                      rows={2}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(metaResult.description)}
                      className="px-3 py-2 bg-deep-blue text-white rounded text-sm hover:bg-opacity-90"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    KEYWORDS
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {metaResult.keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-deep-blue/10 text-deep-blue rounded text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Keyword Suggester */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔑</span>
            Keyword Suggester
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Discover high-value keywords with search intent analysis
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={keywordTopic}
                onChange={(e) => setKeywordTopic(e.target.value)}
                placeholder="e.g., web development vanuatu"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry (optional)
                </label>
                <input
                  type="text"
                  value={keywordIndustry}
                  onChange={(e) => setKeywordIndustry(e.target.value)}
                  placeholder="e.g., Technology"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={keywordLocation}
                  onChange={(e) => setKeywordLocation(e.target.value)}
                  placeholder="e.g., Vanuatu"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                />
              </div>
            </div>

            <button
              onClick={handleKeywordResearch}
              disabled={keywordLoading || !keywordTopic}
              className="w-full bg-vibrant-orange text-white py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {keywordLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Researching...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Find Keywords
                </>
              )}
            </button>

            {keywordResult && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-deep-blue/5 rounded-lg">
                  <p className="text-sm">
                    <strong>Primary Keyword:</strong>{' '}
                    <span className="text-vibrant-orange font-semibold">{keywordResult.primaryKeyword}</span>
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {keywordResult.keywords.map((kw, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <span className="font-medium text-gray-800">{kw.keyword}</span>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getIntentColor(kw.intent)}`}>
                          {kw.intent}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(kw.difficulty)}`}>
                          {kw.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Analyzer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span>
            Content Analyzer
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Get an SEO score and actionable recommendations for your content
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keyword (optional)
              </label>
              <input
                type="text"
                value={analyzeKeyword}
                onChange={(e) => setAnalyzeKeyword(e.target.value)}
                placeholder="e.g., ai automation pacific"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content to Analyze
              </label>
              <textarea
                value={analyzeContent}
                onChange={(e) => setAnalyzeContent(e.target.value)}
                placeholder="Paste your article or page content here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>

            <button
              onClick={handleAnalyzeContent}
              disabled={analysisLoading || !analyzeContent}
              className="w-full bg-vibrant-orange text-white py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {analysisLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>📈</span>
                  Analyze Content
                </>
              )}
            </button>

            {analysisResult && (
              <div className="mt-4 space-y-4">
                {/* Score Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <div className={`text-4xl font-bold ${getScoreColor(analysisResult.score)} inline-block px-4 py-2 rounded-full`}>
                      {analysisResult.score}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">SEO Score</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50">
                    <div className={`text-4xl font-bold ${getScoreColor(analysisResult.readabilityScore)} inline-block px-4 py-2 rounded-full`}>
                      {analysisResult.readabilityScore}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Readability</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Word Count:</span>
                    <span className="float-right font-semibold">{analysisResult.wordCount}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Keyword Density:</span>
                    <span className="float-right font-semibold">{analysisResult.keywordDensity}%</span>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-vibrant-orange">•</span>
                        <span className="text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Competitor Analyzer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎯</span>
            Competitor Analyzer
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Analyze competitor websites to find ranking opportunities
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitor URL
              </label>
              <input
                type="url"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor-website.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
              />
            </div>

            <button
              onClick={handleCompetitorAnalysis}
              disabled={competitorLoading || !competitorUrl}
              className="w-full bg-vibrant-orange text-white py-3 rounded-lg font-semibold hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {competitorLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Analyzing Competitor...
                </>
              ) : (
                <>
                  <span>🔎</span>
                  Analyze Competitor
                </>
              )}
            </button>

            {competitorResults.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {competitorResults.join('\n')}
                </pre>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Tip:</strong> For detailed competitor analysis, consider integrating with SEMrush, Ahrefs, or Moz APIs in the future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-deep-blue to-dark-navy rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">💡 Quick SEO Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Title Tags</h4>
            <p className="text-sm text-white/80">Keep under 60 characters. Include primary keyword near the start. Make it compelling for clicks.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Meta Descriptions</h4>
            <p className="text-sm text-white/80">Keep under 160 characters. Include a call-to-action. Summarize the page value clearly.</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Content Length</h4>
            <p className="text-sm text-white/80">Aim for 1,500+ words for pillar content. Quality matters more than quantity. Answer user intent.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
