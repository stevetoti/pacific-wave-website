import 'server-only';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from './clients';

export const REVIEW_KIND = 'pwd_weekly_review_v1';
export const TOTI_SEO_URL = 'https://totiroom.pacificwavedigital.com/seo';
interface ReviewPost {
  id: string; site_id: string; title: string; content: string; excerpt: string | null;
  slug: string; focus_keyword: string | null; image_url: string | null; image_alt: string | null;
  published: boolean | null; updated_at: string | null;
}
export function reviewFingerprint(post: ReviewPost) {
  return createHash('sha256').update(JSON.stringify([post.site_id, post.id, post.title, post.content, post.excerpt, post.slug, post.focus_keyword, post.image_url, post.image_alt])).digest('hex');
}
export async function ensureTotiBlogReview(postId: string, sources: string[] = []) {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from('blog_posts').select('id,site_id,title,content,excerpt,slug,focus_keyword,image_url,image_alt,published,updated_at').eq('id', postId).eq('site_id', 'pwd').single();
  if (error || !data) throw new Error('Cannot verify article for Toti Room review');
  const post = data as ReviewPost;
  const { data: existing, error: readError } = await db.from('pending_actions').select('id,action_type,status,payload').eq('id', postId).maybeSingle();
  if (readError) throw new Error('Cannot read Toti Room approval record');
  const fingerprint = reviewFingerprint(post);
  if (existing) {
    if (existing.action_type !== 'custom' || existing.payload?.kind !== REVIEW_KIND || existing.payload?.post_id !== postId) throw new Error('Approval identity conflict; operator review required');
    if (existing.payload?.fingerprint !== fingerprint) throw new Error('Article changed after review preparation; refresh its Toti Room approval before publication');
    return { approvalId: existing.id, status: existing.status };
  }
  if (post.published) throw new Error('Cannot create a draft approval for a published article');
  const { data: company, error: companyError } = await db.from('companies').select('id').eq('slug', 'pacific-wave-digital').single();
  if (companyError || !company) throw new Error('Cannot identify PWD approval owner');
  const payload = { kind: REVIEW_KIND, site_id: 'pwd', post_id: post.id, title: post.title, keyword: post.focus_keyword || '', content: post.content, excerpt: post.excerpt || '', fingerprint, sources, editor_url: `https://pacificwavedigital.com/admin/blog/edit/${post.id}`, prepared_at: new Date().toISOString(), publication: 'Approval records consent only. A separate operator must verify this exact revision before publishing.' };
  const { error: insertError } = await db.from('pending_actions').insert({ id: post.id, action_type: 'custom', status: 'pending', payload, company_id: company.id, trigger_source: 'pwd-weekly-blog-v2', trigger_id: post.id, expires_at: null, ai_reasoning: 'Weekly Vanuatu/Pacific article. Read the complete draft and verify facts, sources, eligibility, links and imagery. Approval is recorded here; publication is separate.' });
  if (insertError?.code === '23505') return ensureTotiBlogReview(postId, sources);
  if (insertError) throw new Error('Toti Room approval could not be saved');
  const { data: receipt, error: receiptError } = await db.from('pending_actions').select('id,status,payload').eq('id', post.id).single();
  if (receiptError || receipt?.status !== 'pending' || receipt?.payload?.fingerprint !== fingerprint) throw new Error('Toti Room approval read-back failed');
  return { approvalId: post.id, status: 'pending' };
}
