import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authorize } from '@/lib/server/auth';
import { getAllSettings, upsertSetting } from '@/lib/server/google-settings';
import { readJson, apiError } from '@/lib/server/http';
export async function GET(request: Request) {
  const access = await authorize(request);
  if (access.response) return access.response;
  try {
    const settings = await getAllSettings();
    return NextResponse.json({ clientId: settings.google_client_id || '', hasSecret: !!settings.google_client_secret });
  } catch (error) { return apiError(error, '/api/admin/google-credentials'); }
}
export async function POST(request: Request) {
  const access = await authorize(request);
  if (access.response) return access.response;
  try {
    const data = await readJson(request, z.object({ clientId: z.string().trim().min(1).max(500), clientSecret: z.string().trim().max(500) }));
    await upsertSetting('google_client_id', data.clientId);
    if (data.clientSecret) await upsertSetting('google_client_secret', data.clientSecret);
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error, '/api/admin/google-credentials'); }
}
