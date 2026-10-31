import { siteOrigin, socialCard, socialCards, socialImage, socialVersion } from "./social-cards";
// Share crawlers need a complete HTML document; they must not count as human referrals.
export function isPreviewCrawler(userAgent: string | null) {
  return /bot|crawler|spider|preview|WhatsApp|facebookexternalhit|vkShare|SkypeUriPreview|Viber/i.test(userAgent || "");
}
const escape = (value: string) => value.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function affiliatePreview(request: Request, code: string, destination: string): Response | null {
  if (!isPreviewCrawler(request.headers.get("user-agent"))) return null;
  // Private/account destinations never disclose course or student information.
  const cardPath = destination === "/vanuatu-training" || destination === "/training-center" || destination.startsWith("/training-center/programs/") && !destination.endsWith("/blp-digital-skills-workshop") ? destination : "/training-center";
  const card = socialCards.find(c => c.path === cardPath) || socialCard("/training-center");
  const image = socialImage(card.path);
  const shareUrl = new URL(`/go/${encodeURIComponent(code)}`,siteOrigin);
  shareUrl.searchParams.set("to",destination);
  shareUrl.searchParams.set("v",socialVersion);
  const title=escape(card.title),description=escape(card.description),url=escape(shareUrl.href),src=escape(image);
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | Pacific Wave Digital</title><meta name="robots" content="noindex,nofollow"><meta name="description" content="${description}"><meta property="og:type" content="website"><meta property="og:site_name" content="Pacific Wave Digital"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="${src}"><meta property="og:image:secure_url" content="${src}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${title}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${src}"></head><body><h1>${title}</h1><p>${description}</p><a href="${url}">View this programme at Pacific Wave Digital</a></body></html>`,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Vary":"User-Agent","X-Robots-Tag":"noindex, nofollow","Content-Security-Policy":"default-src 'none'; base-uri 'none'; frame-ancestors 'none'","X-Content-Type-Options":"nosniff"}});
}
