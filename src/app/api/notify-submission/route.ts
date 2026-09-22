import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authorize } from '@/lib/server/auth';
import { apiError, HttpError, readJson } from '@/lib/server/http';
import { sendSubmissionEmail } from '@/lib/server/submission-email';

// Authenticated retry for a previously saved inquiry; never accept arbitrary email payloads.
export async function POST(request: Request) {
  const access = await authorize(request);
  if (access.response) return access.response;
  try {
    const { id } = await readJson(request, z.object({ id: z.string().uuid() }));
    const { data, error } = await access.db.from('project_submissions').select('*').eq('id', id).eq('site_id', 'pwd').maybeSingle();
    if (error) throw error;
    if (!data) throw new HttpError(404, 'Inquiry not found');
    if (data.notification_status !== 'sent') {
      await sendSubmissionEmail(id, data);
      const { error: updateError } = await access.db.from('project_submissions').update({ notification_status: 'sent' }).eq('id', id).eq('site_id', 'pwd');
      if (updateError) throw updateError;
    }
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error, '/api/notify-submission'); }
}
