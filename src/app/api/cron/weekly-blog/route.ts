import { runWeeklyBlog } from '@/lib/server/weekly-blog';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { return Response.json(await runWeeklyBlog()); }
  catch { console.error('[weekly-blog] Generation failed; inspect protected SEO Hub status'); return Response.json({ error: 'Weekly draft failed. See SEO Hub status.' }, { status: 503 }); }
}
