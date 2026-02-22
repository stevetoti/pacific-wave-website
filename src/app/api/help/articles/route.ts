import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId') || 'pwd';
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('help_articles')
      .select('*')
      .eq('site_id', siteId)
      .order('category')
      .order('title')
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    if (published === 'true') {
      query = query.eq('is_published', true);
    } else if (published === 'false') {
      query = query.eq('is_published', false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('List articles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list articles' }, { status: 500 });
  }
}

// POST: Create article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, tags, related_feature, is_published, siteId = 'pwd' } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, content, and category are required' 
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data, error } = await supabase
      .from('help_articles')
      .insert({
        site_id: siteId,
        title,
        slug,
        content,
        category,
        tags: tags || [],
        related_feature,
        is_published: is_published ?? true,
      })
      .select()
      .single();

    if (error) {
      // Check for duplicate slug
      if (error.code === '23505') {
        return NextResponse.json({ 
          success: false, 
          error: 'An article with this title already exists' 
        }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create article' }, { status: 500 });
  }
}
