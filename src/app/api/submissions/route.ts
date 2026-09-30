import { NextResponse } from 'next/server';
import { submissionSchema } from '@/lib/submission-schema';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { apiError, readJson } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { sendSubmissionEmail } from '@/lib/server/submission-email';
import { reportServerError } from '@/lib/server/report-error';
import { guardPublicForm } from '@/lib/security/form-guard';
import { clientIpFromHeaders } from '@/lib/security/turnstile';
import { HttpError } from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    const { website, form_started_at, turnstile_token, ...data } = await readJson(request, submissionSchema);
    // Bot defence (2026-09-30, form-bot-defence skill): honeypot + fill time +
    // content sanity + server-verified Turnstile, BEFORE the rate limit, the
    // database and the owner email. Bots were leaving the honeypot empty and
    // sending digit-only messages in under a second.
    const guard = await guardPublicForm({ honeypot: website, formStartedAt: form_started_at, turnstileToken: turnstile_token, ip: clientIpFromHeaders(request.headers), message: data.project_description || data.additional_notes || '', name: data.contact_name });
    if (!guard.ok) {
      if (guard.reason === 'honeypot') return NextResponse.json({ success: true });
      throw new HttpError(400, guard.message);
    }
    await rateLimit(request, 'submission');
    const db = getSupabaseAdmin();
    const { data: saved, error } = await db.from('project_submissions').insert({ ...data, site_id: 'pwd', status: 'new', notification_status: 'pending' }).select('id').single();
    if (error) throw error;
    // A saved inquiry remains successful even if email is temporarily unavailable.
    let notification = 'pending';
    try {
      await sendSubmissionEmail(saved.id, data, guard.flags);
      const { error: updateError } = await db.from('project_submissions').update({ notification_status: 'sent' }).eq('id', saved.id).eq('site_id', 'pwd');
      if (updateError) throw updateError;
      notification = 'sent';
    } catch (error) { await reportServerError('/api/submissions/notification', error); }
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) { return apiError(error, '/api/submissions'); }
}
