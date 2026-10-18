import { runScheduledRankings } from '@/lib/server/scheduled-rankings';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try { return Response.json(await runScheduledRankings(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { console.error('[weekly-rankings] Check failed; inspect private rank automation and daily run state'); return Response.json({ error: 'Scheduled ranking check failed' }, { status: 503 }); }
}
