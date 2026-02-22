import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { articleId, helpful } = await request.json();

    if (!articleId || typeof helpful !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'Article ID and helpful (boolean) are required' 
      }, { status: 400 });
    }

    // Get current counts
    const { data: article, error: fetchError } = await supabase
      .from('help_articles')
      .select('helpful_yes, helpful_no')
      .eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    // Update the appropriate counter
    const updates = helpful
      ? { helpful_yes: (article.helpful_yes || 0) + 1 }
      : { helpful_no: (article.helpful_no || 0) + 1 };

    const { error: updateError } = await supabase
      .from('help_articles')
      .update(updates)
      .eq('id', articleId);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback recorded. Thank you!' 
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record feedback' }, { status: 500 });
  }
}
