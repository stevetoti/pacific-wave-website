'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TargetKeyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  priority: string;
  status: string;
  target_url: string | null;
  current_position?: number;
  change?: number;
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

export default function SEOHubPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'keywords' | 'opportunities' | 'tasks' | 'memory'>('dashboard');
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

  useEffect(() => {
    fetchAllData();
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/seo/dataforseo');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({ connected: false });
    }
  };

  const researchKeywordData = async (keyword: string) => {
    setIsResearching(true);
    try {
      // Get keyword data
      const response = await fetch('/api/seo/dataforseo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'keyword_data',
          keywords: [keyword.toLowerCase()],
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data.keywords?.[0]) {
        const kwData = result.data.keywords[0];
        
        // Update keyword in database with real data
        await supabase
          .from('seo_target_keywords')
          .update({
            search_volume: kwData.search_volume,
            difficulty: Math.round((kwData.competition || 0) * 100),
            cpc: kwData.cpc,
            updated_at: new Date().toISOString(),
          })
          .eq('keyword', keyword.toLowerCase())
          .eq('site_id', 'pwd');
        
        // Refresh data
        fetchAllData();
        
        return kwData;
      }
    } catch (error) {
      console.error('Research error:', error);
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
        // Add top opportunities to database
        const topSuggestions = result.data.suggestions
          .filter((s: any) => s.search_volume > 50)
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
        
        // Add to SEO memory
        await supabase
          .from('seo_memory')
          .insert({
            site_id: 'pwd',
            memory_type: 'research',
            title: `Keyword Research: ${researchKeyword}`,
            content: `Found ${topSuggestions.length} content opportunities related to "${researchKeyword}". Top keywords: ${topSuggestions.slice(0, 5).map((s: any) => s.keyword).join(', ')}`,
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
    try {
      for (const kw of keywords.slice(0, 5)) { // Check first 5 keywords
        const response = await fetch('/api/seo/dataforseo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'rank_tracker',
            keyword: kw.keyword,
            target_domain: 'pacificwavedigital.com',
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          const position = result.data.position;
          const previousPosition = kw.current_position;
          
          // Record ranking history
          await supabase
            .from('seo_rankings_history')
            .insert({
              site_id: 'pwd',
              keyword: kw.keyword,
              position: position,
              previous_position: previousPosition,
              change: previousPosition ? previousPosition - position : null,
              url: result.data.url,
            });
          
          // Update keyword status
          await supabase
            .from('seo_target_keywords')
            .update({
              status: position ? 'ranking' : 'tracking',
              updated_at: new Date().toISOString(),
            })
            .eq('id', kw.id);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      fetchAllData();
      alert('Ranking check complete!');
    } catch (error) {
      console.error('Ranking check error:', error);
    } finally {
      setIsResearching(false);
    }
  };

  const fetchAllData = async () => {
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

    setKeywords(kwData || []);
    setTasks(taskData || []);
    setOpportunities(oppData || []);
    setMemories(memData || []);
    setIsLoading(false);
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

  const completeTask = async (taskId: string) => {
    await supabase
      .from('seo_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId);
    fetchAllData();
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
        <p className="text-gray-500 mt-1">Track rankings, discover opportunities, and dominate search results</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-deep-blue to-dark-navy rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{keywords.length}</div>
          <div className="text-white/70 text-sm">Target Keywords</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{keywords.filter(k => k.status === 'ranking').length}</div>
          <div className="text-white/70 text-sm">Currently Ranking</div>
        </div>
        <div className="bg-gradient-to-br from-vibrant-orange to-soft-orange rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{opportunities.length}</div>
          <div className="text-white/70 text-sm">Content Opportunities</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{tasks.length}</div>
          <div className="text-white/70 text-sm">Pending Tasks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
        {[
          { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
          { id: 'keywords', label: '🔑 Keywords', icon: '🔑' },
          { id: 'opportunities', label: '💡 Opportunities', icon: '💡' },
          { id: 'tasks', label: '✅ Tasks', icon: '✅' },
          { id: 'memory', label: '🧠 SEO Memory', icon: '🧠' },
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

          {/* Content Opportunities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💡</span> Content Opportunities
            </h2>
            {opportunities.length > 0 ? (
              <div className="space-y-2">
                {opportunities.slice(0, 3).map(opp => (
                  <div key={opp.id} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                    <div className="font-medium text-gray-800">{opp.suggested_title || opp.keyword}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      {opp.search_volume && (
                        <span className="text-gray-500">Vol: {opp.search_volume.toLocaleString()}</span>
                      )}
                      {opp.opportunity_score && (
                        <span className="text-amber-600 font-medium">Score: {opp.opportunity_score}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Run keyword research to find opportunities</p>
            )}
          </div>

          {/* Recent SEO Memory */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🧠</span> SEO Memory
            </h2>
            {memories.length > 0 ? (
              <div className="space-y-2">
                {memories.slice(0, 3).map(mem => (
                  <div key={mem.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                        {mem.memory_type}
                      </span>
                      <span className="font-medium text-gray-800 text-sm">{mem.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{mem.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">SEO memory will build over time</p>
            )}
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Target Keywords</h2>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Keyword</th>
                    <th className="pb-3 font-medium text-right">Volume</th>
                    <th className="pb-3 font-medium text-right">Difficulty</th>
                    <th className="pb-3 font-medium text-center">Position</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-center">Priority</th>
                    <th className="pb-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map(kw => (
                    <tr key={kw.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{kw.keyword}</td>
                      <td className="py-3 text-right text-gray-600">
                        {kw.search_volume?.toLocaleString() || '-'}
                      </td>
                      <td className={`py-3 text-right ${getDifficultyColor(kw.difficulty)}`}>
                        {kw.difficulty || '-'}
                      </td>
                      <td className="py-3 text-center">
                        {kw.current_position ? (
                          <span className="font-bold text-green-600">#{kw.current_position}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          kw.status === 'ranking' ? 'bg-green-100 text-green-700' :
                          kw.status === 'tracking' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {kw.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(kw.priority)}`}>
                          {kw.priority}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => researchKeywordData(kw.keyword)}
                          disabled={isResearching}
                          className="text-xs text-vibrant-orange hover:underline disabled:opacity-50"
                          title="Fetch real data from DataForSEO"
                        >
                          🔍 Research
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <button className="bg-vibrant-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-soft-orange">
                Analyze Opportunities
              </button>
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
              <h2 className="text-lg font-bold text-gray-900">SEO Memory</h2>
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

      {/* DataForSEO Integration Status */}
      <div className={`mt-8 p-4 rounded-xl border ${
        apiStatus?.connected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{apiStatus?.connected ? '✅' : '🔌'}</span>
            <div>
              <p className={`font-medium ${apiStatus?.connected ? 'text-green-800' : 'text-yellow-800'}`}>
                {apiStatus?.connected ? 'DataForSEO Connected' : 'DataForSEO Integration'}
              </p>
              <p className={`text-sm ${apiStatus?.connected ? 'text-green-600' : 'text-yellow-600'}`}>
                {apiStatus?.connected 
                  ? `API Balance: $${apiStatus.balance?.toFixed(2) || '0.00'}`
                  : 'Checking connection status...'}
              </p>
            </div>
          </div>
          {apiStatus?.connected && (
            <button
              onClick={checkRankings}
              disabled={isResearching || keywords.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isResearching ? '⏳ Checking...' : '📊 Check Rankings'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
