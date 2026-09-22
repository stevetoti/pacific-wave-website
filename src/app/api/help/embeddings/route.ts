import { z } from 'zod';
import { readJson, apiError } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { authorize, EDIT_ROLES } from '@/lib/server/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { getOpenAI } from '@/lib/server/clients';



// Generate embedding for text
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// POST: Generate embeddings for all articles or specific one
export async function POST(request: NextRequest) {
  const access = await authorize(request, EDIT_ROLES);
  if (access.response) return access.response;
  try {
    const { articleId, regenerateAll } = await readJson(request, z.object({ articleId: z.string().uuid().optional(), regenerateAll: z.boolean().optional() }));
    await rateLimit(request, 'embeddings', 5);

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Get articles to process
    let query = getSupabaseAdmin()
      .from('help_articles')
      .select('id, title, content, category')
      .eq('is_published', true).eq('site_id', 'pwd').limit(50);

    if (articleId) {
      query = query.eq('id', articleId);
    } else if (!regenerateAll) {
      // Only get articles without embeddings
      query = query.is('content_embedding', null);
    }

    const { data: articles, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No articles need embeddings',
        processed: 0 
      });
    }

    // Process each article
    const results = [];
    for (const article of articles) {
      try {
        // Combine title and content for embedding
        const textToEmbed = `${article.title}\n\n${article.category}\n\n${article.content}`;
        
        // Generate embedding
        const embedding = await generateEmbedding(textToEmbed);
        
        // Update the article with embedding
        const { error: updateError } = await getSupabaseAdmin()
          .from('help_articles')
          .update({ content_embedding: embedding })
          .eq('id', article.id);

        if (updateError) {
          results.push({ id: article.id, title: article.title, success: false, error: updateError.message });
        } else {
          results.push({ id: article.id, title: article.title, success: true });
        }
      } catch (embedError: unknown) {
        const errMsg = embedError instanceof Error ? embedError.message : 'Unknown error';
        results.push({ id: article.id, title: article.title, success: false, error: errMsg });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Generated embeddings for ${successCount}/${articles.length} articles`,
      processed: successCount,
      total: articles.length,
      results,
    });
  } catch (error) { return apiError(error, '/api/help/embeddings'); }
}
