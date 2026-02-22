import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Generate embedding for search query
async function generateQueryEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function POST(request: NextRequest) {
  try {
    const { query, siteId = 'pwd', limit = 10, useRag = true } = await request.json();
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const searchTerm = query.trim();
    let results: Array<{
      id: string;
      title: string;
      slug: string;
      category: string;
      snippet: string;
      tags?: string[];
      similarity?: number;
    }> = [];

    // Try RAG search first if enabled and API key available
    if (useRag && process.env.OPENAI_API_KEY) {
      try {
        // Generate embedding for the query
        const queryEmbedding = await generateQueryEmbedding(searchTerm);

        // Call the vector similarity function
        const { data: ragResults, error: ragError } = await supabase.rpc('match_help_articles', {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: limit,
          p_site_id: siteId,
        });

        if (!ragError && ragResults && ragResults.length > 0) {
          results = ragResults.map((article: { id: string; title: string; slug: string; category: string; content: string; similarity: number }) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            category: article.category,
            snippet: article.content.slice(0, 200) + '...',
            similarity: article.similarity,
          }));

          // Log the RAG search
          await supabase.from('help_searches').insert({
            site_id: siteId,
            query: searchTerm,
            results_count: results.length,
            clicked_article_id: null,
          });

          return NextResponse.json({ 
            success: true, 
            data: results,
            total: results.length,
            method: 'rag'
          });
        }
      } catch (ragError) {
        console.warn('RAG search failed, falling back to text search:', ragError);
      }
    }

    // Fallback to text search
    const { data: articles, error } = await supabase
      .from('help_articles')
      .select('id, title, slug, category, content, tags, view_count')
      .eq('site_id', siteId)
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log the search for analytics
    await supabase.from('help_searches').insert({
      site_id: siteId,
      query: searchTerm,
      results_count: articles?.length || 0,
    });

    // Create snippets
    results = (articles || []).map(article => {
      const contentLower = article.content.toLowerCase();
      const queryLower = searchTerm.toLowerCase();
      let snippet = '';
      
      const index = contentLower.indexOf(queryLower);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(article.content.length, index + queryLower.length + 150);
        snippet = (start > 0 ? '...' : '') + article.content.slice(start, end) + (end < article.content.length ? '...' : '');
      } else {
        snippet = article.content.slice(0, 200) + '...';
      }
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        snippet,
        tags: article.tags,
      };
    });

    return NextResponse.json({ 
      success: true, 
      data: results,
      total: results.length,
      method: 'text'
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
