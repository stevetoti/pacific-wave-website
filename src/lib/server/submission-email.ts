import 'server-only';
import type { SubmissionInput } from '../submission-schema';

export async function sendSubmissionEmail(id: string, data: SubmissionInput) {
  if (!process.env.RESEND_API_KEY) throw new Error('Email service is not configured');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inquiry-${id}` },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Pacific Wave Digital <noreply@pacificwavedigital.com>',
      to: Array.from(new Set(['steve@pacificwavedigital.com', ...(process.env.SUBMISSION_NOTIFICATION_EMAILS || 'toti@pacificwavedigital.com').split(',').map(x => x.trim()).filter(Boolean)])),
      reply_to: data.contact_email,
      subject: `New project inquiry: ${data.project_type}`,
      text: `A new inquiry has been saved.\n\nName: ${data.contact_name}\nEmail: ${data.contact_email}\nPhone: ${data.contact_phone || ''}\nCompany: ${data.company_name || ''}\nBudget: ${data.budget_range || ''}\nTimeline: ${data.timeline || ''}\n\n${data.project_description || ''}\n\nReview: https://pacificwavedigital.com/admin/submissions\nReference: ${id}`,
    }),
  });
  if (!response.ok) throw new Error(`Email provider rejected notification (${response.status})`);
}
