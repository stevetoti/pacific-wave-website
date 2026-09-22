import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { reportServerError } from './report-error';

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415, 'JSON content required');
  // Limit actual bytes, including chunked bodies, before parsing.
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'Request body required');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 131072) { await reader.cancel(); throw new HttpError(413, 'Request too large'); }
    chunks.push(value);
  }
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'Invalid JSON'); }
  const result = schema.safeParse(parsed);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message || 'Invalid request');
  return result.data;
}
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function apiError(error: unknown, route: string) {
  if (error instanceof HttpError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  await reportServerError(route, error);
  return NextResponse.json({ success: false, error: 'Service temporarily unavailable. Please try again.' }, { status: 503 });
}
