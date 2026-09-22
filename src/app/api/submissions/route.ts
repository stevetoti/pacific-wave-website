import { NextResponse } from 'next/server';
import { submissionSchema } from '@/lib/submission-schema';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { apiError, readJson } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { sendSubmissionEmail } from '@/lib/server/submission-email';
import { reportServerError } from '@/lib/server/report-error';

export async function POST(request: Request) {
  try {
    const { website, ...data } = await readJson(request, submissionSchema);
    if (website) return NextResponse.json({ success: true });
    await rateLimit(request, 'submission');
    const db = getSupabaseAdmin();
    const { data: saved, error } = await db.from('project_submissions').insert({ ...data, site_id: 'pwd', status: 'new', notification_status: 'pending' }).select('id').single();
    if (error) throw error;
    // A saved inquiry remains successful even if email is temporarily unavailable.
    let notification = 'pending';
    try {
      await sendSubmissionEmail(saved.id, data);
      const { error: updateError } = await db.from('project_submissions').update({ notification_status: 'sent' }).eq('id', saved.id).eq('site_id', 'pwd');
      if (updateError) throw updateError;
      notification = 'sent';
    } catch (error) { await reportServerError('/api/submissions/notification', error); }
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) { return apiError(error, '/api/submissions'); }
}
