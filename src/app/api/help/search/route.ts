import { z } from 'zod';
import { readJson, apiError } from '@/lib/server/http';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/clients';



export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10 } = await readJson(request, z.object({ query: z.string().trim().min(1).max(300), limit: z.number().int().min(1).max(50).optional(), siteId: z.literal('pwd').optional(), useRag: z.boolean().optional() }));
    const siteId = 'pwd';
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const searchTerm = query.trim().replace(/[,().%_*\\]/g, ' ').trim();
    if (!searchTerm) return NextResponse.json({ success: true, data: [], total: 0 });
    let results: Array<{
      id: string;
      title: string;
      slug: string;
      category: string;
      snippet: string;
      tags?: string[];
      similarity?: number;
    }> = [];

    // Fallback to text search
    const { data: articles, error } = await getSupabaseAdmin()
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
    return apiError(error, '/api/help/search');
  }
}
