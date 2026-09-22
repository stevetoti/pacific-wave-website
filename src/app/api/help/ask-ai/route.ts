import { z } from 'zod';
import { readJson, apiError } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { authorize, READ_ROLES } from '@/lib/server/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { getOpenAI } from '@/lib/server/clients';



// Generate embedding for query
async function generateQueryEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function POST(request: NextRequest) {
  const access = await authorize(request, READ_ROLES);
  if (access.response) return access.response;
  try {
    const { question } = await readJson(request, z.object({ question: z.string().trim().min(1).max(2000), siteId: z.literal('pwd').optional() }));
    await rateLimit(request, 'ask-ai', 30);
    const searchTerm = question.replace(/[,().%_*\\]/g, ' ').trim();
    
    if (!question || question.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Question is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 500 });
    }

    const siteId = 'pwd';
    // Step 1: Find relevant articles using RAG
    let context = '';
    let relevantArticles: Array<{ title: string; slug: string; category: string }> = [];

    try {
      const queryEmbedding = await generateQueryEmbedding(question);

      const { data: articles, error } = await getSupabaseAdmin().rpc('match_help_articles', {
        query_embedding: queryEmbedding,
        match_threshold: 0.4,
        match_count: 3,
        p_site_id: siteId,
      });

      if (!error && articles && articles.length > 0) {
        relevantArticles = articles.map((a: { title: string; slug: string; category: string }) => ({
          title: a.title,
          slug: a.slug,
          category: a.category,
        }));

        // Build context from top articles
        context = articles
          .map((article: { title: string; content: string }) => `## ${article.title}\n\n${article.content}`)
          .join('\n\n---\n\n');
      }
    } catch (ragError) {
      console.warn('RAG lookup failed:', ragError);
      // Continue without context
    }

    // If no context from RAG, try text search
    if (!context) {
      const { data: textResults } = await getSupabaseAdmin()
        .from('help_articles')
        .select('title, slug, category, content')
        .eq('site_id', siteId)
        .eq('is_published', true)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .limit(3);

      if (textResults && textResults.length > 0) {
        relevantArticles = textResults.map(a => ({
          title: a.title,
          slug: a.slug,
          category: a.category,
        }));
        context = textResults
          .map(article => `## ${article.title}\n\n${article.content}`)
          .join('\n\n---\n\n');
      }
    }

    // Step 2: Generate AI response
    const systemPrompt = `You are a helpful AI assistant for Pacific Wave Digital's SEO Hub platform. 
You help users understand how to use the platform's features including:
- SEO Hub for tracking keywords and rankings
- GEO (Generative Engine Optimization) for AI search visibility
- Citability Analyzer for measuring AI citation potential
- Brand Authority monitoring
- llms.txt generation for AI crawlers
- Blog management
- SEO Memory for ranking history

Be concise, friendly, and accurate. If you don't know something specific, suggest checking the help documentation or contacting support.
${context ? `\n\nUse the following documentation to answer the question:\n\n${context}` : ''}`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.';

    // Log the AI query for analytics
    await getSupabaseAdmin().from('help_searches').insert({
      site_id: siteId,
      query: `[AI] ${question}`,
      results_count: relevantArticles.length,
    });

    return NextResponse.json({
      success: true,
      answer,
      relatedArticles: relevantArticles,
      hasContext: !!context,
    });
  } catch (error) { return apiError(error, '/api/help/ask-ai'); }
}
