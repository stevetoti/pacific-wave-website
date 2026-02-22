'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { HelpTooltip } from '@/components/admin/HelpTooltip';

interface Competitor {
  position: number;
  domain: string;
  url: string;
  title: string;
}

interface TargetKeyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  priority: string;
  status: string;
  target_url: string | null;
  current_position?: number | null;
  change?: number;
  competitors?: Competitor[];
  last_checked?: string;
}

interface SEOTask {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  ai_generated: boolean;
  created_at: string;
}

interface ContentOpportunity {
  id: string;
  keyword: string;
  suggested_title: string | null;
  search_volume: number | null;
  difficulty: number | null;
  opportunity_score: number | null;
  status: string;
}

interface SEOMemory {
  id: string;
  memory_type: string;
  title: string;
  content: string;
  importance: string;
  created_at: string;
}

// GEO Feature Interfaces
interface BrandMention {
  id: string;
  site_id: string;
  platform: string;
  url: string | null;
  mention_text: string | null;
  sentiment: string;
  discovered_at: string;
  created_at: string;
}

interface PlatformTargets {
  id: string;
  site_id: string;
  target_chatgpt: boolean;
  target_perplexity: boolean;
  target_google_ai: boolean;
  target_gemini: boolean;
  target_claude: boolean;
}

interface LlmsTxtConfig {
  id: string;
  site_id: string;
  site_name: string | null;
  site_description: string | null;
  key_pages: { title: string; url: string; description: string }[];
  contact_info: { email?: string; phone?: string; address?: string };
  content: string | null;
  last_generated: string | null;
}

interface CitabilityAnalysis {
  id: string;
  content_title: string | null;
  content_text: string | null;
  overall_score: number | null;
  paragraph_scores: ParagraphScore[];
  recommendations: string[];
  analyzed_at: string;
}

interface ParagraphScore {
  text: string;
  score: number;
  wordCount: number;
  issues: string[];
  quotable: boolean;
}

// Platform info for optimization tips
const PLATFORM_INFO = {
  chatgpt: {
    name: 'ChatGPT',
    icon: '🤖',
    color: 'bg-green-500',
    tips: [
      'Use clear, factual statements that can be directly quoted',
      'Include specific numbers, dates, and statistics',
      'Structure content with clear headings and bullet points',
      'Cite authoritative sources within your content',
      'Create FAQ sections that directly answer common questions',
    ],
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    color: 'bg-blue-500',
    tips: [
      'Focus on comprehensive, well-researched content',
      'Include citations and references to build credibility',
      'Create content that answers specific questions thoroughly',
      'Use structured data markup where applicable',
      'Keep paragraphs concise (134-167 words optimal)',
    ],
  },
  google_ai: {
    name: 'Google AI Overview',
    icon: '🌐',
    color: 'bg-red-500',
    tips: [
      'Optimize for featured snippets with direct answers',
      'Use schema markup extensively',
      'Create content that matches search intent precisely',
      'Include tables, lists, and structured content',
      'Ensure fast page load times and mobile optimization',
    ],
  },
  gemini: {
    name: 'Gemini',
    icon: '💎',
    color: 'bg-purple-500',
    tips: [
      'Provide comprehensive coverage of topics',
      'Use clear, unambiguous language',
      'Include visual content descriptions',
      'Create content with multiple perspectives',
      'Optimize for conversational queries',
    ],
  },
  claude: {
    name: 'Claude',
    icon: '🎭',
    color: 'bg-orange-500',
    tips: [
      'Write nuanced, thoughtful content',
      'Acknowledge complexity and multiple viewpoints',
      'Use clear logical structure',
      'Cite primary sources when possible',
      'Create content that educates rather than just informs',
    ],
  },
};

export default function SEOHubPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'keywords' | 'opportunities' | 'tasks' | 'memory' | 'citability' | 'brand-authority' | 'llms-txt' | 'ai-platforms'>('dashboard');
  const [keywords, setKeywords] = useState<TargetKeyword[]>([]);
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; balance?: number } | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [researchKeyword, setResearchKeyword] = useState('');
  const [tasks, setTasks] = useState<SEOTask[]>([]);
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>([]);
  const [memories, setMemories] = useState<SEOMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [rankingResults, setRankingResults] = useState<Record<string, { position: number | null; competitors: Competitor[]; isRanking: boolean }>>({});
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  
  // GEO Feature States
  const [brandMentions, setBrandMentions] = useState<BrandMention[]>([]);
  const [platformTargets, setPlatformTargets] = useState<PlatformTargets | null>(null);
  const [llmsTxtConfig, setLlmsTxtConfig] = useState<LlmsTxtConfig | null>(null);
  const [citabilityAnalyses, setCitabilityAnalyses] = useState<CitabilityAnalysis[]>([]);
  const [citabilityInput, setCitabilityInput] = useState('');
  const [citabilityTitle, setCitabilityTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CitabilityAnalysis | null>(null);
  
  // Brand mention form
  const [showAddMention, setShowAddMention] = useState(false);
  const [newMention, setNewMention] = useState({
    platform: 'reddit',
    url: '',
    mention_text: '',
    sentiment: 'neutral',
  });
  
  // llms.txt form
  const [llmsForm, setLlmsForm] = useState({
    site_name: 'Pacific Wave Digital',
    site_description: 'Premium web development and digital marketing agency in Vanuatu',
    key_pages: [
      { title: 'Home', url: '/', description: 'Main landing page' },
      { title: 'Services', url: '/services', description: 'Our digital services' },
      { title: 'About', url: '/about', description: 'About our company' },
      { title: 'Contact', url: '/contact', description: 'Get in touch' },
    ] as { title: string; url: string; description: string }[],
    contact_email: 'hello@pacificwavedigital.com',
    contact_phone: '+678 7755 512',
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch keywords
    const { data: kwData } = await supabase
      .from('seo_target_keywords')
      .select('*')
      .eq('site_id', 'pwd')
      .order('priority', { ascending: true });
    
    // Fetch tasks
    const { data: taskData } = await supabase
      .from('seo_tasks')
      .select('*')
      .eq('site_id', 'pwd')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .limit(10);
    
    // Fetch opportunities
    const { data: oppData } = await supabase
      .from('seo_content_opportunities')
      .select('*')
      .eq('site_id', 'pwd')
      .eq('status', 'suggested')
      .order('opportunity_score', { ascending: false })
      .limit(10);
    
    // Fetch memories
    const { data: memData } = await supabase
      .from('seo_memory')
      .select('*')
      .eq('site_id', 'pwd')
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch GEO data
    const { data: mentionsData } = await supabase
      .from('seo_brand_mentions')
      .select('*')
      .eq('site_id', 'pwd')
      .order('discovered_at', { ascending: false });
    
    const { data: targetsData } = await supabase
      .from('seo_platform_targets')
      .select('*')
      .eq('site_id', 'pwd')
      .single();
    
    const { data: llmsData } = await supabase
      .from('seo_llms_txt')
      .select('*')
      .eq('site_id', 'pwd')
      .single();
    
    const { data: citabilityData } = await supabase
      .from('seo_citability_analyses')
      .select('*')
      .eq('site_id', 'pwd')
      .order('analyzed_at', { ascending: false })
      .limit(10);

    // Fetch latest ranking results with competitors for each keyword
    const rankResults: Record<string, { position: number | null; competitors: Competitor[]; isRanking: boolean }> = {};
    
    if (kwData && kwData.length > 0) {
      for (const kw of kwData) {
        const { data: latestRanking } = await supabase
          .from('seo_rankings_history')
          .select('position, competitors, created_at')
          .eq('site_id', 'pwd')
          .eq('keyword', kw.keyword)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (latestRanking) {
          rankResults[kw.keyword] = {
            position: latestRanking.position,
            competitors: (latestRanking.competitors as Competitor[]) || [],
            isRanking: latestRanking.position !== null && latestRanking.position > 0,
          };
        }
      }
    }
    
    setRankingResults(rankResults);
    setKeywords(kwData || []);
    setTasks(taskData || []);
    setOpportunities(oppData || []);
    setMemories(memData || []);
    setBrandMentions(mentionsData || []);
    setPlatformTargets(targetsData || null);
    setLlmsTxtConfig(llmsData || null);
    setCitabilityAnalyses((citabilityData || []) as CitabilityAnalysis[]);
    
    // Pre-populate llms.txt form if data exists
    if (llmsData) {
      setLlmsForm({
        site_name: llmsData.site_name || 'Pacific Wave Digital',
        site_description: llmsData.site_description || '',
        key_pages: llmsData.key_pages || [],
        contact_email: llmsData.contact_info?.email || '',
        contact_phone: llmsData.contact_info?.phone || '',
      });
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
    checkApiStatus();
  }, [fetchAllData]);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/seo/dataforseo');
      const data = await response.json();
      setApiStatus(data);
    } catch {
      setApiStatus({ connected: false });
    }
  };

  const researchKeywordData = async (keyword: string) => {
    setIsResearching(true);
    try {
      console.log('[SEO Hub] Researching keyword:', keyword);
      
      const response = await fetch('/api/seo/dataforseo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'keyword_data',
          keywords: [keyword.toLowerCase()],
          location_code: 2840,
        }),
      });
      
      const result = await response.json();
      console.log('[SEO Hub] API Response:', result);
      
      if (result.success && result.data?.keywords) {
        if (result.data.keywords.length > 0) {
          const kwData = result.data.keywords[0];
          
          const { error: updateError } = await supabase
            .from('seo_target_keywords')
            .update({
              search_volume: kwData.search_volume || 0,
              difficulty: kwData.competition || 0,
              cpc: kwData.cpc || 0,
              updated_at: new Date().toISOString(),
            })
            .eq('keyword', keyword.toLowerCase())
            .eq('site_id', 'pwd');
          
          if (updateError) {
            alert('Failed to save keyword data');
          } else {
            alert(`✅ Found data: Volume: ${kwData.search_volume?.toLocaleString() || 0}, Difficulty: ${kwData.competition || 0}`);
          }
          
          await fetchAllData();
          return kwData;
        } else {
          alert(result.data.message || 'No search data found for this keyword.');
        }
      } else {
        alert(result.error || 'No data found for this keyword');
      }
    } catch (error) {
      console.error('[SEO Hub] Research error:', error);
      alert('Research failed. Check console for details.');
    } finally {
      setIsResearching(false);
    }
    return null;
  };

  const findKeywordOpportunities = async () => {
    if (!researchKeyword.trim()) return;
    
    setIsResearching(true);
    try {
      const response = await fetch('/api/seo/dataforseo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'keyword_suggestions',
          keywords: [researchKeyword.toLowerCase()],
          limit: 30,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data.suggestions) {
        const topSuggestions = result.data.suggestions
          .filter((s: { search_volume: number }) => s.search_volume > 50)
          .slice(0, 10);
        
        for (const suggestion of topSuggestions) {
          const opportunityScore = Math.round(
            (Math.min(suggestion.search_volume, 10000) / 100) + 
            (100 - (suggestion.competition || 0.5) * 100)
          );
          
          await supabase
            .from('seo_content_opportunities')
            .upsert({
              site_id: 'pwd',
              keyword: suggestion.keyword,
              suggested_title: `Guide to ${suggestion.keyword.charAt(0).toUpperCase() + suggestion.keyword.slice(1)}`,
              search_volume: suggestion.search_volume,
              difficulty: Math.round((suggestion.competition || 0) * 100),
              opportunity_score: opportunityScore,
              status: 'suggested',
            }, {
              onConflict: 'keyword,site_id',
            });
        }
        
        await supabase
          .from('seo_memory')
          .insert({
            site_id: 'pwd',
            memory_type: 'research',
            title: `Keyword Research: ${researchKeyword}`,
            content: `Found ${topSuggestions.length} content opportunities related to "${researchKeyword}". Top keywords: ${topSuggestions.slice(0, 5).map((s: { keyword: string }) => s.keyword).join(', ')}`,
            importance: 'normal',
          });
        
        fetchAllData();
        setResearchKeyword('');
        alert(`Found ${topSuggestions.length} keyword opportunities!`);
      }
    } catch (error) {
      console.error('Opportunity research error:', error);
      alert('Failed to find opportunities. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  const checkRankings = async () => {
    if (keywords.length === 0) return;
    
    setIsResearching(true);
    const results: Record<string, { position: number | null; competitors: Competitor[]; isRanking: boolean }> = {};
    const tasksToCreate: { keyword: string; competitors: Competitor[] }[] = [];
    
    try {
      for (const kw of keywords.slice(0, 10)) {
        const response = await fetch('/api/seo/dataforseo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'rank_tracker',
            keyword: kw.keyword,
            target_domain: 'pacificwavedigital.com',
            location_code: 2548,
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          const position = result.data.position;
          const competitors = result.data.competitors || [];
          const isRanking = result.data.is_ranking;
          
          results[kw.keyword] = { position, competitors, isRanking };
          
          if (!isRanking && competitors.length > 0) {
            tasksToCreate.push({ keyword: kw.keyword, competitors });
          }
          
          await supabase
            .from('seo_rankings_history')
            .insert({
              site_id: 'pwd',
              keyword: kw.keyword,
              position: position,
              previous_position: kw.current_position,
              change: kw.current_position ? kw.current_position - (position || 0) : null,
              url: result.data.url,
              competitors: competitors,
            });
          
          await supabase
            .from('seo_target_keywords')
            .update({
              status: position ? 'ranking' : 'not_ranking',
              updated_at: new Date().toISOString(),
            })
            .eq('id', kw.id);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setRankingResults(results);
      
      for (const { keyword, competitors } of tasksToCreate) {
        const topCompetitor = competitors[0];
        const { data: existingTask } = await supabase
          .from('seo_tasks')
          .select('id')
          .eq('site_id', 'pwd')
          .ilike('title', `%${keyword}%`)
          .eq('status', 'pending')
          .single();
        
        if (!existingTask) {
          await supabase
            .from('seo_tasks')
            .insert({
              site_id: 'pwd',
              task_type: 'content',
              title: `Write article targeting: "${keyword}"`,
              description: `You're not ranking for "${keyword}" in Vanuatu. Top competitor: ${topCompetitor?.domain} (${topCompetitor?.title}). Create optimized content to outrank them.`,
              priority: 'high',
              status: 'pending',
              ai_generated: true,
            });
        }
      }
      
      const rankingCount = Object.values(results).filter(r => r.isRanking).length;
      const notRankingCount = Object.values(results).filter(r => !r.isRanking).length;
      
      await supabase
        .from('seo_memory')
        .insert({
          site_id: 'pwd',
          memory_type: 'ranking_check',
          title: `Ranking Check: ${new Date().toLocaleDateString()}`,
          content: `Checked ${Object.keys(results).length} keywords. Ranking: ${rankingCount}, Not ranking: ${notRankingCount}. ${tasksToCreate.length} content tasks created.`,
          importance: notRankingCount > rankingCount ? 'high' : 'normal',
        });
      
      fetchAllData();
      alert(`Ranking check complete!\n\n✅ Ranking: ${rankingCount}\n❌ Not ranking: ${notRankingCount}\n📝 Tasks created: ${tasksToCreate.length}`);
    } catch (error) {
      console.error('Ranking check error:', error);
      alert('Ranking check failed. Check console for details.');
    } finally {
      setIsResearching(false);
    }
  };
  
  const generateArticle = async (keyword: string, competitors: Competitor[]) => {
    setIsGeneratingArticle(true);
    try {
      const keywordData = keywords.find(k => k.keyword === keyword);
      
      const response = await fetch('/api/seo/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          competitors: competitors.map(c => ({
            position: c.position,
            domain: c.domain,
            url: c.url,
            title: c.title,
          })),
          searchVolume: keywordData?.search_volume,
          difficulty: keywordData?.difficulty,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.redirectUrl) {
        await supabase
          .from('seo_memory')
          .insert({
            site_id: 'pwd',
            memory_type: 'content_created',
            title: `Article Generated: ${keyword}`,
            content: `AI-generated article targeting "${keyword}". Draft created and ready for review. Top competitor was ${competitors[0]?.domain || 'unknown'}.`,
            importance: 'high',
          });
        
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error || 'Failed to generate article. Check console.');
      }
    } catch (error) {
      console.error('Article generation error:', error);
      alert('Failed to generate article. Check console.');
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    
    const { error } = await supabase
      .from('seo_target_keywords')
      .insert({
        site_id: 'pwd',
        keyword: newKeyword.toLowerCase().trim(),
        priority: 'medium',
        status: 'tracking'
      });
    
    if (!error) {
      setNewKeyword('');
      setShowAddKeyword(false);
      fetchAllData();
    }
  };

  const deleteKeyword = async (keywordId: string, keywordText: string) => {
    if (!confirm(`Are you sure you want to remove "${keywordText}"?`)) return;
    
    const { error } = await supabase
      .from('seo_target_keywords')
      .delete()
      .eq('id', keywordId);
    
    if (!error) {
      fetchAllData();
    } else {
      alert('Failed to delete keyword');
    }
  };

  const completeTask = async (taskId: string) => {
    await supabase
      .from('seo_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId);
    fetchAllData();
  };

  // GEO Feature Functions
  
  // Citability Analysis
  const analyzeCitability = async () => {
    if (!citabilityInput.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Split content into paragraphs
      const paragraphs = citabilityInput
        .split(/\n\n+/)
        .filter(p => p.trim().length > 0);
      
      const paragraphScores: ParagraphScore[] = [];
      let totalScore = 0;
      const recommendations: string[] = [];
      
      for (const para of paragraphs) {
        const words = para.trim().split(/\s+/);
        const wordCount = words.length;
        const issues: string[] = [];
        let paraScore = 100;
        
        // Check paragraph length (optimal: 134-167 words)
        if (wordCount < 50) {
          paraScore -= 30;
          issues.push('Too short - may lack context');
        } else if (wordCount < 134) {
          paraScore -= 15;
          issues.push('Could be more comprehensive');
        } else if (wordCount > 167 && wordCount <= 250) {
          paraScore -= 10;
          issues.push('Slightly long - consider breaking up');
        } else if (wordCount > 250) {
          paraScore -= 25;
          issues.push('Too long for AI quoting');
        }
        
        // Check for numbers/statistics
        const hasNumbers = /\d+(?:\.\d+)?(?:%|percent|million|billion|thousand)?/i.test(para);
        if (hasNumbers) {
          paraScore += 10;
        } else {
          paraScore -= 10;
          issues.push('No specific numbers or statistics');
        }
        
        // Check for specific claims (contains "is", "are", "means", "defined")
        const hasDefinitiveStatements = /(?:is|are|means|defined as|refers to|consists of)\s/i.test(para);
        if (hasDefinitiveStatements) {
          paraScore += 5;
        }
        
        // Check for question-answer format
        const hasQuestion = /\?/.test(para);
        if (hasQuestion) {
          paraScore += 15;
        }
        
        // Check for self-contained explanation
        const hasSelfContained = /(?:This means|In other words|For example|Specifically|In summary)/i.test(para);
        if (hasSelfContained) {
          paraScore += 5;
        } else if (wordCount > 50) {
          issues.push('Could use clarifying phrases for context');
        }
        
        // Check for vague language
        const vagueWords = (para.match(/(?:very|really|quite|somewhat|basically|actually|literally|generally|usually)/gi) || []).length;
        if (vagueWords > 2) {
          paraScore -= vagueWords * 5;
          issues.push('Contains vague qualifiers');
        }
        
        // Normalize score
        paraScore = Math.max(0, Math.min(100, paraScore));
        
        paragraphScores.push({
          text: para,
          score: paraScore,
          wordCount,
          issues,
          quotable: paraScore >= 70,
        });
        
        totalScore += paraScore;
      }
      
      const overallScore = Math.round(totalScore / paragraphs.length);
      
      // Generate recommendations
      const shortParagraphs = paragraphScores.filter(p => p.wordCount < 100).length;
      const longParagraphs = paragraphScores.filter(p => p.wordCount > 200).length;
      const lowScoreParagraphs = paragraphScores.filter(p => p.score < 60).length;
      
      if (shortParagraphs > paragraphs.length / 2) {
        recommendations.push('Many paragraphs are too short. Expand key points with examples and specifics.');
      }
      if (longParagraphs > 0) {
        recommendations.push('Some paragraphs are too long. Break them into smaller, quotable chunks.');
      }
      if (lowScoreParagraphs > 0) {
        recommendations.push('Add specific numbers, statistics, or data points to strengthen weak paragraphs.');
      }
      if (!paragraphScores.some(p => /\?/.test(p.text))) {
        recommendations.push('Consider adding Q&A formatted sections for better AI discoverability.');
      }
      if (overallScore < 70) {
        recommendations.push('Overall citability is low. Focus on making statements more definitive and fact-based.');
      }
      
      const analysis: CitabilityAnalysis = {
        id: crypto.randomUUID(),
        content_title: citabilityTitle || 'Untitled Analysis',
        content_text: citabilityInput,
        overall_score: overallScore,
        paragraph_scores: paragraphScores,
        recommendations,
        analyzed_at: new Date().toISOString(),
      };
      
      setCurrentAnalysis(analysis);
      
      // Save to database
      await supabase
        .from('seo_citability_analyses')
        .insert({
          site_id: 'pwd',
          content_title: analysis.content_title,
          content_text: analysis.content_text,
          overall_score: analysis.overall_score,
          paragraph_scores: analysis.paragraph_scores,
          recommendations: analysis.recommendations,
        });
      
      fetchAllData();
    } catch (error) {
      console.error('Citability analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Brand Mentions
  const addBrandMention = async () => {
    if (!newMention.mention_text.trim()) {
      alert('Please enter the mention text');
      return;
    }
    
    const { error } = await supabase
      .from('seo_brand_mentions')
      .insert({
        site_id: 'pwd',
        platform: newMention.platform,
        url: newMention.url || null,
        mention_text: newMention.mention_text,
        sentiment: newMention.sentiment,
      });
    
    if (!error) {
      setNewMention({ platform: 'reddit', url: '', mention_text: '', sentiment: 'neutral' });
      setShowAddMention(false);
      fetchAllData();
    } else {
      alert('Failed to add mention');
    }
  };
  
  const deleteMention = async (mentionId: string) => {
    if (!confirm('Delete this mention?')) return;
    
    await supabase
      .from('seo_brand_mentions')
      .delete()
      .eq('id', mentionId);
    
    fetchAllData();
  };
  
  // Platform Targets
  const updatePlatformTargets = async (platform: keyof typeof PLATFORM_INFO, enabled: boolean) => {
    const updates: Partial<PlatformTargets> = {};
    const key = `target_${platform}` as keyof PlatformTargets;
    updates[key] = enabled as never;
    
    if (platformTargets) {
      await supabase
        .from('seo_platform_targets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('site_id', 'pwd');
    } else {
      await supabase
        .from('seo_platform_targets')
        .insert({ site_id: 'pwd', ...updates });
    }
    
    fetchAllData();
  };
  
  // llms.txt Generator
  const generateLlmsTxt = () => {
    const content = `# ${llmsForm.site_name}

> ${llmsForm.site_description}

## About
${llmsForm.site_name} provides professional web development, digital marketing, and technology solutions.

## Key Pages
${llmsForm.key_pages.map(p => `- [${p.title}](${p.url}): ${p.description}`).join('\n')}

## Services
- Web Development & Design
- Digital Marketing & SEO
- E-commerce Solutions
- Custom Software Development

## Contact
- Email: ${llmsForm.contact_email}
- Phone: ${llmsForm.contact_phone}

## Social Media
- LinkedIn: /company/pacific-wave-digital
- Facebook: /pacificwavedigital

---
*This file helps AI assistants understand and accurately represent our business.*
`;
    
    return content;
  };
  
  const saveLlmsTxt = async () => {
    const content = generateLlmsTxt();
    
    await supabase
      .from('seo_llms_txt')
      .upsert({
        site_id: 'pwd',
        site_name: llmsForm.site_name,
        site_description: llmsForm.site_description,
        key_pages: llmsForm.key_pages,
        contact_info: {
          email: llmsForm.contact_email,
          phone: llmsForm.contact_phone,
        },
        content,
        last_generated: new Date().toISOString(),
      }, { onConflict: 'site_id' });
    
    fetchAllData();
    alert('llms.txt configuration saved!');
  };
  
  const copyLlmsTxt = () => {
    const content = generateLlmsTxt();
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: number | null) => {
    if (!difficulty) return 'text-gray-400';
    if (difficulty <= 30) return 'text-green-600';
    if (difficulty <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700';
      case 'negative': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'reddit': return '🟠';
      case 'youtube': return '📺';
      case 'linkedin': return '💼';
      case 'wikipedia': return '📚';
      case 'twitter': return '🐦';
      case 'facebook': return '👥';
      default: return '🌐';
    }
  };
  
  // Calculate GEO stats
  const avgCitabilityScore = citabilityAnalyses.length > 0
    ? Math.round(citabilityAnalyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / citabilityAnalyses.length)
    : 0;
  
  const platformsOptimized = platformTargets
    ? [
        platformTargets.target_chatgpt,
        platformTargets.target_perplexity,
        platformTargets.target_google_ai,
        platformTargets.target_gemini,
        platformTargets.target_claude,
      ].filter(Boolean).length
    : 0;
  
  const brandAuthorityScore = brandMentions.length > 0
    ? Math.min(100, Math.round(
        (brandMentions.filter(m => m.sentiment === 'positive').length * 15) +
        (brandMentions.filter(m => m.sentiment === 'neutral').length * 5) +
        (brandMentions.length * 2)
      ))
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-500">Loading SEO Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-heading flex items-center gap-3">
          <span className="text-4xl">🎯</span>
          SEO Command Center
        </h1>
        <p className="text-gray-500 mt-1">Track rankings, discover opportunities, and optimize for AI engines</p>
      </div>

      {/* Stats Overview - Now includes GEO stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-gradient-to-br from-deep-blue to-dark-navy rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{keywords.length}</div>
          <div className="text-white/70 text-xs">Target Keywords</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{keywords.filter(k => k.status === 'ranking').length}</div>
          <div className="text-white/70 text-xs">Currently Ranking</div>
        </div>
        <div className="bg-gradient-to-br from-vibrant-orange to-soft-orange rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{opportunities.length}</div>
          <div className="text-white/70 text-xs">Opportunities</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{tasks.length}</div>
          <div className="text-white/70 text-xs">Pending Tasks</div>
        </div>
        {/* New GEO Stats */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{avgCitabilityScore}</div>
          <div className="text-white/70 text-xs">Citability Score</div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{brandMentions.length}</div>
          <div className="text-white/70 text-xs">Brand Mentions</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{platformsOptimized}/5</div>
          <div className="text-white/70 text-xs">AI Platforms</div>
        </div>
      </div>

      {/* Tabs - Now includes GEO tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'keywords', label: '🔑 Keywords' },
          { id: 'opportunities', label: '💡 Opportunities' },
          { id: 'tasks', label: '✅ Tasks' },
          { id: 'memory', label: '🧠 Memory' },
          { id: 'citability', label: '✨ Citability' },
          { id: 'brand-authority', label: '🏆 Brand Authority' },
          { id: 'llms-txt', label: '📄 llms.txt' },
          { id: 'ai-platforms', label: '🤖 AI Platforms' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-deep-blue text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Today&apos;s SEO Tasks
            </h2>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="font-medium text-gray-800">{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => completeTask(task.id)}
                      className="ml-3 p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Mark complete"
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">🎉 All tasks complete!</p>
            )}
          </div>

          {/* GEO Overview Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span> GEO Status
            </h2>
            <div className="space-y-4">
              {/* Citability */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">Citability Score</span>
                  <p className="text-xs text-gray-500">AI quote-readiness</p>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(avgCitabilityScore)}`}>
                  {avgCitabilityScore}/100
                </div>
              </div>
              
              {/* Brand Authority */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">Brand Authority</span>
                  <p className="text-xs text-gray-500">{brandMentions.length} mentions tracked</p>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(brandAuthorityScore)}`}>
                  {brandAuthorityScore}/100
                </div>
              </div>
              
              {/* AI Platforms */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">AI Platforms</span>
                  <p className="text-xs text-gray-500">Optimization targets</p>
                </div>
                <div className="flex items-center gap-1">
                  {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                    const isEnabled = platformTargets?.[`target_${key}` as keyof PlatformTargets];
                    return (
                      <span
                        key={key}
                        className={`text-lg ${isEnabled ? '' : 'opacity-30'}`}
                        title={info.name}
                      >
                        {info.icon}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {/* llms.txt Status */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">llms.txt</span>
                  <p className="text-xs text-gray-500">AI assistant file</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  llmsTxtConfig?.content ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {llmsTxtConfig?.content ? '✓ Generated' : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Keywords */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔑</span> Target Keywords
            </h2>
            {keywords.length > 0 ? (
              <div className="space-y-2">
                {keywords.slice(0, 5).map(kw => (
                  <div key={kw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{kw.keyword}</span>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        {kw.search_volume && (
                          <span className="text-gray-500">Vol: {kw.search_volume.toLocaleString()}</span>
                        )}
                        {kw.difficulty && (
                          <span className={getDifficultyColor(kw.difficulty)}>
                            Diff: {kw.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      kw.status === 'ranking' ? 'bg-green-100 text-green-700' :
                      kw.status === 'tracking' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {kw.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">No keywords yet</p>
                <button
                  onClick={() => setActiveTab('keywords')}
                  className="text-vibrant-orange hover:underline text-sm"
                >
                  + Add your first keyword
                </button>
              </div>
            )}
          </div>

          {/* Recent Brand Mentions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏆</span> Recent Brand Mentions
            </h2>
            {brandMentions.length > 0 ? (
              <div className="space-y-2">
                {brandMentions.slice(0, 3).map(mention => (
                  <div key={mention.id} className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                    <div className="flex items-center gap-2">
                      <span>{getPlatformIcon(mention.platform)}</span>
                      <span className="font-medium text-gray-800 text-sm capitalize">{mention.platform}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getSentimentColor(mention.sentiment)}`}>
                        {mention.sentiment}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{mention.mention_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">No mentions tracked yet</p>
                <button
                  onClick={() => setActiveTab('brand-authority')}
                  className="text-vibrant-orange hover:underline text-sm"
                >
                  + Track your first mention
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Target Keywords</h2>
              <HelpTooltip 
                title="Target Keywords"
                description="Add keywords you want to rank for. Track their search volume, difficulty, and your current position."
                articleSlug="how-to-track-keywords"
              />
            </div>
            <button
              onClick={() => setShowAddKeyword(true)}
              className="bg-vibrant-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-soft-orange transition-colors flex items-center gap-2"
            >
              <span>+</span> Add Keyword
            </button>
          </div>

          {showAddKeyword && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter keyword to track..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20"
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <button
                  onClick={addKeyword}
                  className="bg-deep-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddKeyword(false)}
                  className="text-gray-500 hover:text-gray-700 px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {keywords.length > 0 ? (
            <div className="space-y-2">
              {keywords.map(kw => {
                const rankResult = rankingResults[kw.keyword];
                const hasCompetitors = rankResult?.competitors && rankResult.competitors.length > 0;
                const isExpanded = expandedKeyword === kw.keyword;
                
                return (
                  <div key={kw.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        {hasCompetitors && (
                          <button
                            onClick={() => setExpandedKeyword(isExpanded ? null : kw.keyword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        )}
                        {!hasCompetitors && <span className="w-4"></span>}
                        
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{kw.keyword}</span>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            {kw.search_volume && kw.search_volume > 0 && (
                              <span>Vol: {kw.search_volume.toLocaleString()}</span>
                            )}
                            {kw.difficulty && kw.difficulty > 0 && (
                              <span className={getDifficultyColor(kw.difficulty)}>Diff: {kw.difficulty}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-24 text-center">
                        {rankResult?.isRanking ? (
                          <span className="font-bold text-green-600">#{rankResult.position}</span>
                        ) : rankResult && !rankResult.isRanking ? (
                          <span className="text-xs text-red-500 font-medium">Not in top 100</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Run check</span>
                        )}
                      </div>
                      
                      <div className="w-24 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          kw.status === 'ranking' ? 'bg-green-100 text-green-700' :
                          kw.status === 'not_ranking' ? 'bg-red-100 text-red-700' :
                          kw.status === 'tracking' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {kw.status === 'not_ranking' ? 'not ranked' : kw.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => researchKeywordData(kw.keyword)}
                          disabled={isResearching}
                          className="text-xs bg-vibrant-orange/10 text-vibrant-orange px-3 py-1 rounded-full hover:bg-vibrant-orange/20 disabled:opacity-50"
                        >
                          🔍 Research
                        </button>
                        {hasCompetitors && !rankResult?.isRanking && (
                          <button
                            onClick={() => generateArticle(kw.keyword, rankResult.competitors)}
                            disabled={isGeneratingArticle}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 disabled:opacity-50"
                          >
                            ✍️ Write Article
                          </button>
                        )}
                        <button
                          onClick={() => deleteKeyword(kw.id, kw.keyword)}
                          className="text-xs text-red-500 hover:text-red-700 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && hasCompetitors && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-100 border-t border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            🏆 Currently Ranking in Vanuatu
                          </h4>
                          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                            Top {Math.min(rankResult.competitors.length, 5)} competitors
                          </span>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr className="text-xs text-gray-500 uppercase">
                                <th className="py-3 px-4 text-left font-medium">Rank</th>
                                <th className="py-3 px-4 text-left font-medium">Website</th>
                                <th className="py-3 px-4 text-left font-medium">Ranking Page</th>
                                <th className="py-3 px-4 text-center font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rankResult.competitors.slice(0, 5).map((comp, idx) => (
                                <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md' :
                                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-sm' :
                                      idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm' :
                                      'bg-gray-200 text-gray-600'
                                    }`}>
                                      #{comp.position}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={`https://www.google.com/s2/favicons?domain=${comp.domain}&sz=32`} 
                                        alt="" 
                                        className="w-5 h-5 rounded"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                      <span className="font-medium text-gray-800">{comp.domain}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="max-w-xs">
                                      <p className="font-medium text-gray-700 text-sm truncate">{comp.title}</p>
                                      <a 
                                        href={comp.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-deep-blue hover:underline truncate block"
                                      >
                                        {comp.url.length > 50 ? comp.url.substring(0, 50) + '...' : comp.url}
                                      </a>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <a 
                                      href={comp.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                      Analyze 🔍
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-4 p-4 bg-gradient-to-r from-vibrant-orange/10 to-amber-100 rounded-xl border border-vibrant-orange/20">
                          <h5 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            💡 Strategy to Outrank
                          </h5>
                          <p className="text-sm text-gray-600 mb-3">
                            Create a comprehensive article targeting <strong>&quot;{kw.keyword}&quot;</strong> that&apos;s better than {rankResult.competitors[0]?.domain || 'the competition'}. 
                            Focus on Vanuatu-specific insights, include more practical examples, and make it more comprehensive.
                          </p>
                          <button
                            onClick={() => generateArticle(kw.keyword, rankResult.competitors)}
                            disabled={isGeneratingArticle}
                            className="bg-gradient-to-r from-vibrant-orange to-soft-orange text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {isGeneratingArticle ? (
                              <>
                                <span className="animate-spin">⏳</span> Generating with AI...
                              </>
                            ) : (
                              <>
                                ✨ Generate Article with AI
                              </>
                            )}
                          </button>
                          <p className="text-xs text-gray-500 mt-2">AI will write a 1500+ word SEO-optimized article and open the editor</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔑</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No keywords yet</h3>
              <p className="text-gray-500 mb-4">Start tracking keywords to monitor your search rankings</p>
              <button
                onClick={() => setShowAddKeyword(true)}
                className="bg-vibrant-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-soft-orange"
              >
                Add Your First Keyword
              </button>
            </div>
          )}
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Content Opportunities</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={researchKeyword}
                onChange={(e) => setResearchKeyword(e.target.value)}
                placeholder="Enter seed keyword..."
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibrant-orange/20 w-64"
                onKeyPress={(e) => e.key === 'Enter' && findKeywordOpportunities()}
              />
              <button 
                onClick={findKeywordOpportunities}
                disabled={isResearching || !researchKeyword.trim()}
                className="bg-vibrant-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-soft-orange transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isResearching ? (
                  <>
                    <span className="animate-spin">⏳</span> Finding...
                  </>
                ) : (
                  <>
                    <span>🔍</span> Find Opportunities
                  </>
                )}
              </button>
            </div>
          </div>
          
          {opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map(opp => (
                <div key={opp.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800">{opp.suggested_title || opp.keyword}</h3>
                      <p className="text-sm text-gray-600 mt-1">Target keyword: {opp.keyword}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {opp.search_volume && (
                          <span className="text-gray-500">📊 {opp.search_volume.toLocaleString()} searches/mo</span>
                        )}
                        {opp.difficulty && (
                          <span className={getDifficultyColor(opp.difficulty)}>
                            💪 Difficulty: {opp.difficulty}
                          </span>
                        )}
                        {opp.opportunity_score && (
                          <span className="text-amber-600 font-medium">⭐ Score: {opp.opportunity_score}</span>
                        )}
                      </div>
                    </div>
                    <button className="bg-vibrant-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-soft-orange">
                      Write Article →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Find content opportunities</h3>
              <p className="text-gray-500 mb-4">Discover high-value keywords you should create content for</p>
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">SEO Tasks</h2>
            <button className="bg-deep-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2">
              <span>🤖</span> Generate Tasks
            </button>
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                        {task.task_type}
                      </span>
                      {task.ai_generated && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                          AI
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-800 mt-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => completeTask(task.id)}
                    className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Complete ✓
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">All tasks complete!</h3>
              <p className="text-gray-500 mb-4">Generate new AI tasks to keep improving your SEO</p>
            </div>
          )}
        </div>
      )}

      {/* Memory Tab */}
      {activeTab === 'memory' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                SEO Memory
                <HelpTooltip 
                  title="SEO Memory"
                  description="Track your SEO activities, ranking changes, and insights over time. Memory helps you understand trends and make better decisions."
                  articleSlug="how-seo-memory-works"
                />
              </h2>
              <p className="text-sm text-gray-500">AI-powered insights and learning from your SEO journey</p>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
              <span>+</span> Add Note
            </button>
          </div>
          
          {memories.length > 0 ? (
            <div className="space-y-4">
              {memories.map(mem => (
                <div key={mem.id} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                      {mem.memory_type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mem.importance === 'critical' ? 'bg-red-100 text-red-700' :
                      mem.importance === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {mem.importance}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800">{mem.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{mem.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Building SEO Memory</h3>
              <p className="text-gray-500">The system will learn from your SEO decisions and results over time</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== GEO FEATURE TABS ==================== */}
      
      {/* Citability Tab */}
      {activeTab === 'citability' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">✨</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  AI Citability Analyzer
                  <HelpTooltip 
                    title="What is Citability?"
                    description="Citability measures how likely AI systems are to quote your content. Higher scores mean better AI visibility."
                    articleSlug="ai-citability-analyzer-guide"
                  />
                </h2>
                <p className="text-gray-600 mt-1">
                  Analyze your content for AI quote-readiness. AI assistants prefer quoting content that is:
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    134-167 words per paragraph
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Self-contained passages
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Specific numbers & statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Question-answer format
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Analysis Input */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Analyze Content</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={citabilityTitle}
                onChange={(e) => setCitabilityTitle(e.target.value)}
                placeholder="Content title (optional)"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
              <textarea
                value={citabilityInput}
                onChange={(e) => setCitabilityInput(e.target.value)}
                placeholder="Paste your content here to analyze for AI citability..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono text-sm"
              />
              <button
                onClick={analyzeCitability}
                disabled={isAnalyzing || !citabilityInput.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin">⏳</span> Analyzing...
                  </>
                ) : (
                  <>
                    ✨ Analyze Citability
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {currentAnalysis && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Analysis Results</h3>
                <div className={`text-3xl font-bold ${getScoreColor(currentAnalysis.overall_score || 0)}`}>
                  {currentAnalysis.overall_score}/100
                </div>
              </div>

              {/* Recommendations */}
              {currentAnalysis.recommendations.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1 text-sm text-amber-700">
                    {currentAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Paragraph Analysis */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800">Paragraph Analysis</h4>
                {currentAnalysis.paragraph_scores.map((para, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border ${getScoreBgColor(para.score)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${getScoreColor(para.score)}`}>
                          {para.score}
                        </span>
                        <span className="text-xs text-gray-500">
                          {para.wordCount} words
                        </span>
                        {para.quotable && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                            ✓ Quotable
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{para.text}</p>
                    {para.issues.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {para.issues.map((issue, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Analyses */}
          {citabilityAnalyses.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Previous Analyses</h3>
              <div className="space-y-2">
                {citabilityAnalyses.map(analysis => (
                  <div 
                    key={analysis.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => setCurrentAnalysis(analysis)}
                  >
                    <div>
                      <span className="font-medium text-gray-800">{analysis.content_title || 'Untitled'}</span>
                      <span className="text-xs text-gray-500 ml-3">
                        {new Date(analysis.analyzed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(analysis.overall_score || 0)}`}>
                      {analysis.overall_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand Authority Tab */}
      {activeTab === 'brand-authority' && (
        <div className="space-y-6">
          {/* Brand Authority Score */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  Brand Authority Score
                  <HelpTooltip 
                    title="What is Brand Authority?"
                    description="Brand authority measures how often your brand is mentioned on trusted platforms. Higher authority improves AI recommendations."
                    articleSlug="understanding-brand-authority"
                  />
                </h2>
                <p className="text-gray-600 mt-1">
                  Based on {brandMentions.length} tracked mentions across trusted platforms
                </p>
              </div>
              <div className={`text-5xl font-bold ${getScoreColor(brandAuthorityScore)}`}>
                {brandAuthorityScore}
                <span className="text-lg text-gray-400">/100</span>
              </div>
            </div>
            
            {/* Platform Breakdown */}
            <div className="mt-4 flex flex-wrap gap-3">
              {['reddit', 'youtube', 'linkedin', 'wikipedia', 'twitter', 'other'].map(platform => {
                const count = brandMentions.filter(m => m.platform === platform).length;
                return (
                  <div key={platform} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-pink-100">
                    <span>{getPlatformIcon(platform)}</span>
                    <span className="capitalize text-sm font-medium text-gray-700">{platform}</span>
                    <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Mention Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Track Brand Mentions</h3>
              <button
                onClick={() => setShowAddMention(!showAddMention)}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                <span>+</span> Add Mention
              </button>
            </div>

            {showAddMention && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      value={newMention.platform}
                      onChange={(e) => setNewMention({ ...newMention, platform: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    >
                      <option value="reddit">🟠 Reddit</option>
                      <option value="youtube">📺 YouTube</option>
                      <option value="linkedin">💼 LinkedIn</option>
                      <option value="wikipedia">📚 Wikipedia</option>
                      <option value="twitter">🐦 Twitter/X</option>
                      <option value="facebook">👥 Facebook</option>
                      <option value="quora">❓ Quora</option>
                      <option value="other">🌐 Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
                    <select
                      value={newMention.sentiment}
                      onChange={(e) => setNewMention({ ...newMention, sentiment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    >
                      <option value="positive">😊 Positive</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="negative">😞 Negative</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
                  <input
                    type="url"
                    value={newMention.url}
                    onChange={(e) => setNewMention({ ...newMention, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mention Text</label>
                  <textarea
                    value={newMention.mention_text}
                    onChange={(e) => setNewMention({ ...newMention, mention_text: e.target.value })}
                    placeholder="What was said about your brand..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addBrandMention}
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-600"
                  >
                    Add Mention
                  </button>
                  <button
                    onClick={() => setShowAddMention(false)}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Mentions List */}
            {brandMentions.length > 0 ? (
              <div className="space-y-3">
                {brandMentions.map(mention => (
                  <div key={mention.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPlatformIcon(mention.platform)}</span>
                        <span className="font-medium text-gray-800 capitalize">{mention.platform}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getSentimentColor(mention.sentiment)}`}>
                          {mention.sentiment}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(mention.discovered_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMention(mention.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{mention.mention_text}</p>
                    {mention.url && (
                      <a 
                        href={mention.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-deep-blue hover:underline mt-2 inline-block"
                      >
                        View source →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No mentions tracked yet</h3>
                <p className="text-gray-500 mb-4">Start tracking where your brand is mentioned across the web</p>
              </div>
            )}
          </div>

          {/* Tips for Building Authority */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Tips for Building Brand Authority</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Get Mentioned on Reddit</h4>
                <p className="text-sm text-gray-600">Provide value in relevant subreddits. AI trusts Reddit discussions.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Create YouTube Content</h4>
                <p className="text-sm text-gray-600">Video content gets cited by AI. Tutorials perform best.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Publish on LinkedIn</h4>
                <p className="text-sm text-gray-600">Professional content on LinkedIn builds B2B authority.</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Get Wikipedia References</h4>
                <p className="text-sm text-gray-600">Being cited as a source on Wikipedia is extremely valuable.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* llms.txt Tab */}
      {activeTab === 'llms-txt' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📄</div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  llms.txt Generator
                  <HelpTooltip 
                    title="What is llms.txt?"
                    description="llms.txt is a standard file that helps AI assistants understand your business accurately. Place it in your website's root directory."
                    articleSlug="how-to-generate-llms-txt"
                  />
                </h2>
                <p className="text-gray-600 mt-1">
                  Create an llms.txt file to help AI assistants understand your business. 
                  Place this file in your website&apos;s root directory (e.g., yoursite.com/llms.txt).
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This emerging standard helps AI chatbots accurately represent your business when answering user questions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Configuration Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Configure llms.txt</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={llmsForm.site_name}
                    onChange={(e) => setLlmsForm({ ...llmsForm, site_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                  <textarea
                    value={llmsForm.site_description}
                    onChange={(e) => setLlmsForm({ ...llmsForm, site_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={llmsForm.contact_email}
                    onChange={(e) => setLlmsForm({ ...llmsForm, contact_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={llmsForm.contact_phone}
                    onChange={(e) => setLlmsForm({ ...llmsForm, contact_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                </div>

                {/* Key Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Pages</label>
                  <div className="space-y-2">
                    {llmsForm.key_pages.map((page, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => {
                            const newPages = [...llmsForm.key_pages];
                            newPages[idx].title = e.target.value;
                            setLlmsForm({ ...llmsForm, key_pages: newPages });
                          }}
                          placeholder="Page title"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={page.url}
                          onChange={(e) => {
                            const newPages = [...llmsForm.key_pages];
                            newPages[idx].url = e.target.value;
                            setLlmsForm({ ...llmsForm, key_pages: newPages });
                          }}
                          placeholder="/path"
                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={page.description}
                          onChange={(e) => {
                            const newPages = [...llmsForm.key_pages];
                            newPages[idx].description = e.target.value;
                            setLlmsForm({ ...llmsForm, key_pages: newPages });
                          }}
                          placeholder="Description"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => {
                            const newPages = llmsForm.key_pages.filter((_, i) => i !== idx);
                            setLlmsForm({ ...llmsForm, key_pages: newPages });
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setLlmsForm({
                          ...llmsForm,
                          key_pages: [...llmsForm.key_pages, { title: '', url: '/', description: '' }]
                        });
                      }}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      + Add Page
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={saveLlmsTxt}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
                  >
                    💾 Save Configuration
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Preview llms.txt</h3>
                <button
                  onClick={copyLlmsTxt}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-[500px] font-mono">
                {generateLlmsTxt()}
              </pre>
              
              {/* Instructions */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">📍 Placement Instructions</h4>
                <ol className="text-sm text-amber-700 space-y-1">
                  <li>1. Copy the llms.txt content above</li>
                  <li>2. Create a file named <code className="bg-amber-100 px-1 rounded">llms.txt</code></li>
                  <li>3. Place it in your website&apos;s root directory</li>
                  <li>4. It should be accessible at <code className="bg-amber-100 px-1 rounded">yoursite.com/llms.txt</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Platforms Tab */}
      {activeTab === 'ai-platforms' && (
        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              Target AI Platforms
              <HelpTooltip 
                title="AI Platform Targeting"
                description="Different AI platforms have unique optimization strategies. Select which platforms you want to optimize for."
                articleSlug="ai-platform-targeting-explained"
              />
            </h3>
            <p className="text-gray-600 mb-6">
              Select which AI platforms you want to optimize for. Each platform has different optimization strategies.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                const isEnabled = platformTargets?.[`target_${key}` as keyof PlatformTargets] ?? true;
                return (
                  <div 
                    key={key}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isEnabled 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                    onClick={() => updatePlatformTargets(key as keyof typeof PLATFORM_INFO, !isEnabled)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.icon}</span>
                        <span className="font-bold text-gray-800">{info.name}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isEnabled ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}>
                        {isEnabled && '✓'}
                      </div>
                    </div>
                    <div className={`w-full h-1 rounded-full ${info.color}`}></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform-Specific Tips */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Platform-Specific Optimization Tips</h3>
            
            <div className="space-y-6">
              {Object.entries(PLATFORM_INFO).map(([key, info]) => {
                const isEnabled = platformTargets?.[`target_${key}` as keyof PlatformTargets] ?? true;
                if (!isEnabled) return null;
                
                return (
                  <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className={`px-4 py-3 ${info.color} text-white flex items-center gap-2`}>
                      <span className="text-xl">{info.icon}</span>
                      <span className="font-bold">{info.name}</span>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {info.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {platformsOptimized === 0 && (
              <div className="text-center py-8 text-gray-500">
                Select at least one platform to see optimization tips.
              </div>
            )}
          </div>

          {/* GEO Best Practices */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📚 GEO Best Practices (All Platforms)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">📊</span>
                  <div>
                    <h4 className="font-medium text-gray-800">Use Specific Data</h4>
                    <p className="text-sm text-gray-600">Include statistics, percentages, and specific numbers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">❓</span>
                  <div>
                    <h4 className="font-medium text-gray-800">Question-Answer Format</h4>
                    <p className="text-sm text-gray-600">Structure content as direct answers to questions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🎯</span>
                  <div>
                    <h4 className="font-medium text-gray-800">Be Authoritative</h4>
                    <p className="text-sm text-gray-600">Use definitive language and cite sources.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">📝</span>
                  <div>
                    <h4 className="font-medium text-gray-800">Optimal Paragraph Length</h4>
                    <p className="text-sm text-gray-600">Keep paragraphs between 134-167 words.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔗</span>
                  <div>
                    <h4 className="font-medium text-gray-800">Build Authority Signals</h4>
                    <p className="text-sm text-gray-600">Get mentioned on Reddit, LinkedIn, and Wikipedia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xl">📄</span>
                  <div>
                    <h4 className="font-medium text-gray-800">Create llms.txt</h4>
                    <p className="text-sm text-gray-600">Help AI understand your business with structured data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Engine Status */}
      {apiStatus?.connected && (
        <div className="mt-8 p-4 rounded-xl border bg-gradient-to-r from-deep-blue/5 to-vibrant-orange/5 border-deep-blue/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-deep-blue to-vibrant-orange rounded-lg flex items-center justify-center text-white font-bold">
                SEO
              </div>
              <div>
                <p className="font-medium text-gray-800">SEO Engine Active</p>
                <p className="text-sm text-gray-500">Real-time keyword data and ranking tracking enabled</p>
              </div>
            </div>
            <button
              onClick={checkRankings}
              disabled={isResearching || keywords.length === 0}
              className="bg-deep-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {isResearching ? '⏳ Checking...' : '📊 Check All Rankings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
