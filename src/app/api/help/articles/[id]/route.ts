import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Single article by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId') || 'pwd';
    const bySlug = searchParams.get('bySlug') === 'true';
    const incrementView = searchParams.get('view') === 'true';

    let query = supabase
      .from('help_articles')
      .select('*')
      .eq('site_id', siteId);

    if (bySlug) {
      query = query.eq('slug', id);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    // Increment view count if requested
    if (incrementView) {
      await supabase
        .from('help_articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get article' }, { status: 500 });
  }
}

// PUT: Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, category, tags, related_feature, is_published } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updates.title = title;
      updates.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (related_feature !== undefined) updates.related_feature = related_feature;
    if (is_published !== undefined) updates.is_published = is_published;

    const { data, error } = await supabase
      .from('help_articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE: Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('help_articles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete article' }, { status: 500 });
  }
}
