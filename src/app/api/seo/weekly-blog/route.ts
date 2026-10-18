import { authorize, READ_ROLES } from '@/lib/server/auth';
import { weeklyBlogStatus } from '@/lib/server/weekly-blog';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const access = await authorize(request, READ_ROLES);
  if (access.response) return access.response;
  try { return Response.json(await weeklyBlogStatus()); }
  catch { return Response.json({ error: 'Publishing health unavailable' }, { status: 503 }); }
}
