import 'server-only';
import { getSupabaseAdmin } from './clients';
const lastAlert = new Map<string, number>();

/** Never include request bodies, credentials, or provider responses in alerts. */
export async function reportServerError(route: string, error: unknown) {
  const timestamp = new Date().toISOString();
  const name = error instanceof Error ? error.name : 'Error';
  const fingerprint = `${route}:${name}`;
  const event = { service: 'pacific-wave-website', route, severity: 'error', timestamp, action: 'request_failed', error: name };
  console.error(JSON.stringify(event));
  if (Date.now() - (lastAlert.get(fingerprint) || 0) < 300000) return;
  if (lastAlert.size > 100) lastAlert.clear();
  lastAlert.set(fingerprint, Date.now());
  try {
    await getSupabaseAdmin().from('server_errors').insert({ site_id: 'pwd', route, error_name: name });
  } catch { /* Reporting must not replace the original response. */ }
  const recipients = process.env.ERROR_NOTIFICATION_EMAILS?.split(',').map(x => x.trim()).filter(Boolean);
  if (!process.env.RESEND_API_KEY || !recipients?.length) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || 'Pacific Wave Digital <noreply@pacificwavedigital.com>', to: recipients,
        subject: 'Pacific Wave website needs attention', text: JSON.stringify(event, null, 2) }),
    });
  } catch { /* Fail open. */ }
}
