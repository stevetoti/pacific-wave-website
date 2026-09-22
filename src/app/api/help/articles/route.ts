import { NextResponse } from 'next/server';
import { authorize, EDIT_ROLES, READ_ROLES } from '@/lib/server/auth';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { apiError, HttpError, readJson } from '@/lib/server/http';
import { articleColumns, articleFields, slugify } from '@/lib/server/help';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  // Anonymous requests can only read published articles for this site.
  const wantsPrivate = params.get('published') !== 'true' && request.headers.has('authorization');
  if (wantsPrivate) {
    const access = await authorize(request, READ_ROLES);
    if (access.response) return access.response;
  }
  try {
    if (params.has('siteId') && params.get('siteId') !== 'pwd') throw new HttpError(403, 'Invalid site');
    const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 50));
    let query = getSupabaseAdmin().from('help_articles').select(articleColumns).eq('site_id', 'pwd').order('category').order('title').limit(limit);
    if (!wantsPrivate || params.get('published') === 'true') query = query.eq('is_published', true);
    else if (params.get('published') === 'false') query = query.eq('is_published', false);
    if (params.get('category')) query = query.eq('category', params.get('category'));
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error, '/api/help/articles'); }
}
export async function POST(request: Request) {
  const access = await authorize(request, EDIT_ROLES);
  if (access.response) return access.response;
  try {
    const { siteId: _site, ...body } = await readJson(request, articleFields);
    const slug = slugify(body.title);
    if (!slug) throw new HttpError(400, 'Title must contain letters or numbers');
    const { data, error } = await access.db.from('help_articles').insert({ ...body, slug, site_id: 'pwd', is_published: body.is_published ?? false }).select(articleColumns).single();
    if (error?.code === '23505') throw new HttpError(409, 'An article with this title already exists');
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error, '/api/help/articles'); }
}
