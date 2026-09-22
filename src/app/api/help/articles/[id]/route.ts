import { NextResponse } from 'next/server';
import { authorize, EDIT_ROLES, READ_ROLES } from '@/lib/server/auth';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { apiError, HttpError, readJson } from '@/lib/server/http';
import { articleColumns, articleFields, slugify } from '@/lib/server/help';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  const authenticated = request.headers.has('authorization');
  if (authenticated) {
    const access = await authorize(request, READ_ROLES);
    if (access.response) return access.response;
  }
  try {
    const { id } = await context.params;
    const params = new URL(request.url).searchParams;
    if (params.has('siteId') && params.get('siteId') !== 'pwd') throw new HttpError(403, 'Invalid site');
    let query = getSupabaseAdmin().from('help_articles').select(articleColumns).eq('site_id', 'pwd').eq(params.get('bySlug') === 'true' ? 'slug' : 'id', id);
    if (!authenticated) query = query.eq('is_published', true);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Article not found');
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error, '/api/help/articles/[id]'); }
}
export async function PUT(request: Request, context: Context) {
  const access = await authorize(request, EDIT_ROLES);
  if (access.response) return access.response;
  try {
    const { id } = await context.params;
    const { siteId: _site, ...body } = await readJson(request, articleFields.partial());
    const updates = { ...body, ...(body.title ? { slug: slugify(body.title) } : {}), updated_at: new Date().toISOString(), ...((body.title || body.content) ? { content_embedding: null } : {}) };
    if ('slug' in updates && !updates.slug) throw new HttpError(400, 'Title must contain letters or numbers');
    const { data, error } = await access.db.from('help_articles').update(updates).eq('site_id', 'pwd').eq('id', id).select(articleColumns).maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Article not found');
    return NextResponse.json({ success: true, data });
  } catch (error) { return apiError(error, '/api/help/articles/[id]'); }
}
export async function DELETE(request: Request, context: Context) {
  const access = await authorize(request, EDIT_ROLES);
  if (access.response) return access.response;
  try {
    const { id } = await context.params;
    const { data, error } = await access.db.from('help_articles').delete().eq('site_id', 'pwd').eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) throw new HttpError(404, 'Article not found');
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error, '/api/help/articles/[id]'); }
}
