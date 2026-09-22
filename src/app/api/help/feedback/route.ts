import { authorize, READ_ROLES } from '@/lib/server/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/clients';


export async function POST(request: NextRequest) {
  const access = await authorize(request, READ_ROLES);
  if (access.response) return access.response;
  try {
    const { articleId, helpful } = await request.json();

    if (!articleId || typeof helpful !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'Article ID and helpful (boolean) are required' 
      }, { status: 400 });
    }

    // Get current counts
    const { data: article, error: fetchError } = await getSupabaseAdmin()
      .from('help_articles')
      .select('helpful_yes, helpful_no')
      .eq('site_id', 'pwd').eq('is_published', true).eq('id', articleId)
      .single();

    if (fetchError || !article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    // Update the appropriate counter
    const updates = helpful
      ? { helpful_yes: (article.helpful_yes || 0) + 1 }
      : { helpful_no: (article.helpful_no || 0) + 1 };

    const { error: updateError } = await getSupabaseAdmin()
      .from('help_articles')
      .update(updates)
      .eq('site_id', 'pwd').eq('is_published', true).eq('id', articleId);

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
