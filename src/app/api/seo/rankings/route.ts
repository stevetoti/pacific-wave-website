import { authorize, ADMIN_ROLES } from '@/lib/server/auth';
import { refreshPWDRankings } from '@/lib/server/pwd-rankings';
import { rateLimit } from '@/lib/server/rate-limit';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';
const origin = 'https://totiroom.pacificwavedigital.com';
function headers() { return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Cache-Control': 'no-store', Vary: 'Origin' }; }
export function OPTIONS(request: Request) { return new Response(null, { status: request.headers.get('origin') === origin ? 204 : 403, headers: headers() }); }
export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== origin) return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: headers() });
  const access = await authorize(request, ADMIN_ROLES);
  if (access.response) return new Response(access.response.body, { status: access.response.status, headers: { ...headers(), 'Content-Type': 'application/json' } });
  const operator = await access.db.from('toti_operator_access').select('user_id').eq('user_id', access.user.id).maybeSingle();
  if (operator.error || !operator.data) return Response.json({ error: 'Toti Room owner access required' }, { status: 403, headers: headers() });
  try { await rateLimit(request, 'pwd-rankings', 3); return Response.json(await refreshPWDRankings(), { headers: headers() }); }
  catch { return Response.json({ error: 'Rank check unavailable. Check the private run status; no missing position has been recorded as zero.' }, { status: 503, headers: headers() }); }
}
