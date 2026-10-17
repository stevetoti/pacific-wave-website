// Only fixed, non-personal dimensions are sent to Analytics. Never pass form data.
export type EnquiryForm = 'contact' | 'project_quote';
type ContactEvent = 'contact_phone_click' | 'contact_whatsapp_click';
type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};
const trackedReceipts = new Set<string>();

export function isMarketingPath(path: string): boolean {
  return ['/', '/contact', '/get-started', '/about', '/portfolio', '/products', '/affiliates', '/services', '/blog', '/vanuatu-training'].includes(path)
    || /^\/(services|blog)\/[^/]+\/?$/.test(path);
}

function emit(name: 'generate_lead' | ContactEvent, dimensions: Record<string, string>): boolean {
  if (typeof window === 'undefined' || !isMarketingPath(window.location.pathname)) return false;
  try {
    if (window.location.pathname === '/vanuatu-training' && window.sessionStorage.getItem('pwd-training-analytics') !== 'granted') return false;
    const w = window as AnalyticsWindow;
    const parameters = { ...dimensions, page_location: window.location.origin + window.location.pathname, transport_type: 'beacon' };
    if (w.gtag) w.gtag('event', name, parameters);
    else (w.dataLayer ??= []).push(['event', name, parameters]);
    return true;
  } catch { return false; } // Tracking must never break an enquiry or contact link.
}

export function trackSavedEnquiry(result: unknown, form: EnquiryForm, status: number): void {
  if (status !== 201 || !result || typeof result !== 'object') return;
  const receipt = result as { success?: unknown; submission_id?: unknown };
  if (receipt.success !== true || typeof receipt.submission_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(receipt.submission_id)) return;
  const key = `pwd-enquiry:${receipt.submission_id}`;
  if (trackedReceipts.has(key)) return;
  try { if (window.sessionStorage.getItem(key)) return; } catch { /* Storage can be unavailable. */ }
  if (!emit('generate_lead', { form_id: form, lead_source: 'website' })) return;
  trackedReceipts.add(key);
  try { window.sessionStorage.setItem(key, 'tracked'); } catch { /* In-memory deduplication remains. */ }
}

export function businessContactEvent(href: string): ContactEvent | null {
  if (/^tel:\+?6785288141$/i.test(href.replace(/[\s()-]/g, ''))) return 'contact_phone_click';
  try {
    const url = new URL(href);
    if (url.protocol !== 'https:') return null;
    if (url.hostname === 'wa.me' && url.pathname.replace(/\D/g, '') === '6785288141') return 'contact_whatsapp_click';
    if (url.hostname === 'api.whatsapp.com' && url.pathname === '/send' && url.searchParams.get('phone')?.replace(/\D/g, '') === '6785288141') return 'contact_whatsapp_click';
  } catch { /* Relative links and unrelated destinations are not contact events. */ }
  return null;
}

export function trackBusinessContact(href: string): void {
  const name = businessContactEvent(href);
  if (name) emit(name, { contact_method: name === 'contact_phone_click' ? 'phone' : 'whatsapp' });
}
