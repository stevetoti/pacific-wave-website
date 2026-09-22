import 'server-only';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from './clients';
import { HttpError } from './http';

export async function rateLimit(request: Request, bucket: string, max = 5) {
  const ip = (request.headers.get(process.env.VERCEL ? 'x-vercel-forwarded-for' : 'x-forwarded-for') || 'local').split(',')[0].trim();
  const key = createHash('sha256').update(`${bucket}:${ip}`).digest('hex');
  const { data, error } = await getSupabaseAdmin().rpc('pwd_rate_limit', { bucket_key: key, max_requests: max, window_seconds: 600 });
  if (error) throw error;
  if (!data) throw new HttpError(429, 'Too many requests. Please try again in a few minutes.');
}
