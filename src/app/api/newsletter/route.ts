import { queueOwnerNotification, sendOwnerNotifications } from '@/lib/server/owner-notifications';
import { after, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/server/clients';
import { readJson, apiError } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
export async function POST(request: Request) {
  try {
    const { email } = await readJson(request, z.object({ email: z.string().trim().email().max(254) }));
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
