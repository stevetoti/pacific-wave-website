import { z } from 'zod';

export const BLOG_ORIGIN = 'https://pacificwavedigital.com';
export const WEEKLY_CATEGORY = 'Weekly review';
export const EDITORIAL_VERSION = '2026-10-18';
export const articleSchema = z.object({
  title: z.string().trim().min(25).max(100),
  excerpt: z.string().trim().min(100).max(170),
  content: z.string().min(2000).max(35000),
  tags: z.array(z.string().trim().min(2).max(80)).min(2).max(8),
}).strict();
export type EditorialArticle = z.infer<typeof articleSchema>;
export interface Brief { id: string; keyword: string; title: string; target: string; image: string; angle: string; sources: string[] }
const brief = (id: string, keyword: string, title: string, service: string, image: string, angle: string): Brief => ({
  id, keyword, title, target: `${BLOG_ORIGIN}/services/${service}`, image,
  angle, sources: [`${BLOG_ORIGIN}/services/${service}`, `${BLOG_ORIGIN}/portfolio`],
});
export const EDITORIAL_BRIEFS: Brief[] = [
  brief('payment-readiness', 'online payments for Vanuatu businesses', 'Accepting online payments in Vanuatu: a merchant readiness checklist', 'online-payment-integration', '/images/payments/couple-laptop-card-hero.webp', 'Explain merchant eligibility, settlement, supported integration versus QR/manual reconciliation. Stripe does not directly onboard Vanuatu businesses; PayPal receiving/withdrawal must be verified. MyCash and M-Vatu merchant access does not establish a public API. No tax, legal or financial advice.'),
  brief('website-project-brief', 'planning a business website in Vanuatu', 'What to prepare before commissioning a business website in Vanuatu', 'web-design', '/images/blog/web-editorial.webp', 'Practical project brief: audiences, content, photos, contact details, mobile journeys and maintenance ownership. No invented prices.'),
  brief('resort-enquiries', 'Pacific resort booking enquiry workflow', 'Planning a resort booking enquiry workflow for Pacific travellers', 'web-development', '/images/blog/web-editorial.webp', 'Enquiry versus confirmed reservation, dates, availability, follow-up ownership and mobile testing. Public resort features are not evidence of revenue or booking outcomes.'),
  brief('enquiry-measurement', 'website enquiry tracking Vanuatu', 'Measuring forms, phone calls and WhatsApp enquiries on a Vanuatu website', 'digital-marketing', '/images/blog/marketing-editorial.webp', 'Explain saved submission versus click intent, avoiding duplicate events, privacy and baseline comparison. No private Analytics figures.'),
  brief('local-profile', 'Google Business Profile checklist Vanuatu', 'A practical Google Business Profile checklist for Vanuatu businesses', 'seo', '/images/blog/marketing-editorial.webp', 'Accurate name, categories, visits versus service area, real photographs and honest reviews; no ranking promise or incentives.'),
  brief('automation-handoff', 'business automation handover Pacific Islands', 'Planning a reliable automation handover for a Pacific business', 'ai-automation', '/images/blog/ai-editorial.webp', 'Map repetitive tasks, human approval, exceptions, audit logs and ownership. Distinguish AI from rules-based steps and avoid unsupported product availability.'),
  brief('store-catalogue', 'online store product catalogue Vanuatu', 'Preparing a product catalogue for a Vanuatu online store', 'ecommerce', '/images/blog/commerce-editorial.webp', 'Product fields, stock, photos, variants, fulfilment zones, returns information and checkout testing. Distinct from the existing repetitive ecommerce overview drafts.'),
  brief('hosting-handover', 'website maintenance handover Vanuatu', 'Website maintenance handover: a checklist for Vanuatu business owners', 'cloud-hosting', '/images/blog/web-editorial.webp', 'Account ownership, backups, restore checks, updates, monitoring and support scope. No uptime or round-the-clock guarantees.'),
  brief('software-discovery', 'custom software planning Vanuatu', 'Questions to answer before building custom business software in Vanuatu', 'software-development', '/images/blog/web-editorial.webp', 'Roles, data, workflows, permissions, acceptance criteria and support. No invented client evidence or savings.'),
  brief('mobile-requirements', 'mobile app requirements Pacific Islands', 'Writing mobile app requirements for Pacific Island users', 'mobile-apps', '/images/blog/web-editorial.webp', 'Define user tasks, connectivity assumptions, privacy, device testing and app-store responsibilities without invented market statistics.'),
  brief('payment-reconciliation', 'payment reconciliation website Vanuatu', 'Payment confirmations and reconciliation: designing a clear website workflow', 'online-payment-integration', '/images/payments/couple-laptop-card-hero.webp', 'Distinct operational guide: pending versus paid, trusted provider notifications, matching references, duplicate handling, refunds ownership and reconciliation. Eligibility checks remain mandatory.'),
  brief('pacific-content', 'Pacific Islands website content planning', 'Planning useful website content for customers across the Pacific', 'web-design', '/images/blog/web-editorial.webp', 'Clear service scope, genuine delivery areas, language and support contacts; avoid cloned country pages or invented overseas offices.'),
];

// Calendar weeks begin Monday in Vanuatu; use UTC arithmetic on the local date.
export function vanuatuWeek(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Efate', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)!.value;
  const day = new Date(`${part('year')}-${part('month')}-${part('day')}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}
export function nextWeeklyRun(now: Date): string {
  const start = new Date(`${vanuatuWeek(now)}T22:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 1); // Monday 09:00 = Sunday 22:00 UTC
  if (start <= now) start.setUTCDate(start.getUTCDate() + 7);
  return start.toISOString();
}
export interface ExistingArticle { title: string; focus_keyword?: string | null; keywords?: string[] | null }
export function overlap(a: string, b: string): number {
  const tokens = (s: string) => new Set(s.toLowerCase().match(/[a-z0-9]+/g)?.filter(t => t.length > 3) || []);
  const x = tokens(a), y = tokens(b);
  return Array.from(x).filter(t => y.has(t)).length / Math.max(1, new Set(Array.from(x).concat(Array.from(y))).size);
}
export function chooseBrief(posts: ExistingArticle[]): Brief | undefined {
  return EDITORIAL_BRIEFS.find(b => !posts.some(p => p.keywords?.includes(`pwd-brief:${b.id}`) || p.focus_keyword?.toLowerCase() === b.keyword.toLowerCase() || overlap(p.title, b.title) >= 0.65));
}
export function checkArticle(article: EditorialArticle, b: Brief, posts: ExistingArticle[]): string[] {
  const issues: string[] = [];
  const text = article.content.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  if (words < 650 || words > 2500) issues.push(`Editorial length is ${words} words; develop a complete useful guide (650–2500 words).`);
  if ((article.content.match(/<h2[ >]/gi) || []).length < 4) issues.push('Use at least four useful section headings.');
  if (!/Vanuatu|Pacific/i.test(article.title + text)) issues.push('Missing relevant local context.');
  if (/<(?:script|iframe|form|style|object|embed|h1)\b|\bon\w+\s*=|javascript:|data:/i.test(article.content)) issues.push('Unsafe or unsupported HTML.');
  if (/guarantee.{0,30}(rank|sales|uptime)|rank.{0,15}(number one|#1)|Marie Johnson|David Kalsakau|Sarah Natuman|50\+ projects|25\+ active clients/i.test(text)) issues.push('Unsupported outcome or legacy claim.');
  if (/(?:quicker|faster|instant|longer) settlements?|settlement.{0,30}(?:faster|quicker)|typically offer quicker/i.test(text)) issues.push('Unverified provider settlement-speed comparison.');
  if (posts.some(p => overlap(p.title, article.title) >= 0.65)) issues.push('Article title overlaps the existing backlog.');
  const allowed = new Set([...b.sources, b.target, `${BLOG_ORIGIN}/contact`]);
  const links = Array.from(article.content.matchAll(/href=["']([^"']+)["']/gi)).map(m => m[1]);
  if (!links.includes(b.target)) issues.push('Missing mapped service link.');
  if (!links.includes(`${BLOG_ORIGIN}/contact`)) issues.push('Missing contact next step.');
  if (links.some(url => !allowed.has(url))) issues.push('Link is outside the verified brief sources.');
  if (/<img\b/i.test(article.content)) issues.push('Images are attached from verified local assets by the worker.');
  return issues;
}
