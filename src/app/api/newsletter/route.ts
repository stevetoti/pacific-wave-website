import { queueOwnerNotification, sendOwnerNotifications } from '@/lib/server/owner-notifications';
import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { readJson, apiError } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { guardPublicForm } from '@/lib/security/form-guard';
import { clientIpFromHeaders } from '@/lib/security/turnstile';
import { HttpError } from '@/lib/server/http';
export async function POST(request: Request) {
  try {
    const { email, website, form_started_at, turnstile_token } = await readJson(request, z.object({ email: z.string().trim().email().max(254), website: z.string().max(200).optional(), form_started_at: z.number().optional(), turnstile_token: z.string().max(2048).optional() }));
    const guard = await guardPublicForm({ honeypot: website, formStartedAt: form_started_at, turnstileToken: turnstile_token, ip: clientIpFromHeaders(request.headers), skipMessageCheck: true });
    if (!guard.ok) {
      if (guard.reason === 'honeypot') return NextResponse.json({ success: true });
      throw new HttpError(400, guard.message);
    }
    await rateLimit(request, 'newsletter');
    const { data: added, error } = await getSupabaseAdmin().from('pwd_newsletter_subscribers').upsert({ email: email.toLowerCase(), site_id: 'pwd', consent_at: new Date().toISOString() }, { onConflict: 'site_id,email', ignoreDuplicates: true }).select("id,email");
    if (error) throw error;
    if (added?.[0]) {
      await queueOwnerNotification(`newsletter-${added[0].id}`, 'New website newsletter signup', `Email: ${added[0].email}\nThe subscriber has joined the Pacific Wave Digital newsletter.`);
      after(sendOwnerNotifications);
    }
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error, '/api/newsletter'); }
}
