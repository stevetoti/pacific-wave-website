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

// Generate embedding for text
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// POST: Generate embeddings for all articles or specific one
export async function POST(request: NextRequest) {
  try {
    const { articleId, regenerateAll } = await request.json();

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Get articles to process
    let query = supabase
      .from('help_articles')
      .select('id, title, content, category')
      .eq('is_published', true);

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
        const { error: updateError } = await supabase
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
  } catch (error) {
    console.error('Embeddings error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate embeddings' 
    }, { status: 500 });
  }
}
