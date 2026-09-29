import { escapeHtml as e } from "./training-template";
import {
  affiliatePractices,
  affiliateRules,
  shareMessage,
} from "../lms/affiliate-guide";
export type AffiliateWelcomeLink = { title: string; url: string; earn?: string };
// Email-safe (table + inline style) welcome email for newly approved affiliates.
export function affiliateWelcomeTemplate({
  name,
  code,
  rate,
  links,
  dashboardUrl,
}: {
  name: string;
  code: string;
  rate: number;
  links: AffiliateWelcomeLink[];
  dashboardUrl: string;
}) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const main = links[0]?.url || dashboardUrl;
  const message = shareMessage(main);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const stat = (value: string, label: string) =>
    `<td width="33%" class="stat" style="padding:16px 8px;text-align:center;background:#f6f8fc;border-radius:12px"><div style="font-size:20px;font-weight:bold;color:#233c6f">${e(value)}</div><div style="font-size:12px;color:#586980;margin-top:4px">${e(label)}</div></td>`;
  const gap = `<td width="8" class="gap" style="font-size:0">&nbsp;</td>`;
  const linkRows = links
    .map(
      (l) =>
        `<tr><td style="padding:14px 16px;border:1px solid #e2e7ef;border-radius:12px;background:#ffffff"><div style="font-weight:bold;color:#233c6f;font-size:15px">${e(l.title)}</div>${l.earn ? `<div style="font-size:13px;color:#ab3c18;margin-top:3px">You earn ${e(l.earn)} per enrolment</div>` : ""}<a href="${e(l.url)}" style="display:block;margin-top:6px;font-size:13px;color:#233c6f;overflow-wrap:anywhere;word-break:break-all;max-width:100%">${e(l.url)}</a></td></tr><tr><td style="height:10px;font-size:0">&nbsp;</td></tr>`,
    )
    .join("");
  const practiceRows = affiliatePractices
    .map(
      (p, i) =>
        `<tr><td width="40" valign="top" style="padding:0 0 18px"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:#ef5e33;color:#ffffff;text-align:center;font-weight:bold;font-size:14px">${i + 1}</div></td><td valign="top" style="padding:0 0 18px"><div style="font-weight:bold;color:#233c6f;font-size:15px">${e(p.title)}</div><div style="font-size:14px;line-height:1.6;color:#586980;margin-top:2px">${e(p.body)}</div></td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/><style>@media only screen and (max-width:480px){.px{padding-left:20px!important;padding-right:20px!important}.stat{display:block!important;width:auto!important;margin-bottom:8px!important}.gap{display:none!important}.outer{padding:12px 6px!important}h1{font-size:26px!important}}</style></head><body style="margin:0;background:#f2f5f9;font-family:Arial,Helvetica,sans-serif;color:#233c6f">
<div style="display:none;max-height:0;overflow:hidden">You're approved. Your affiliate links are ready: earn ${rate}% on every paid enrolment.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" class="outer" style="padding:28px 12px">
<table role="presentation" width="600" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td class="px" style="background:#233c6f;padding:28px 32px 36px;color:#ffffff">
<img src="https://pacificwavedigital.com/images/training/pwd-logo.png" width="44" height="44" alt="Pacific Wave Digital"/>
<p style="font-size:12px;letter-spacing:2px;margin:14px 0 18px;color:#ef5e33;font-weight:bold">PACIFIC WAVE DIGITAL · AFFILIATE PROGRAMME</p>
<div style="display:inline-block;background:#ef5e33;color:#ffffff;font-size:12px;font-weight:bold;letter-spacing:1px;padding:6px 12px;border-radius:20px">✓ APPROVED</div>
<h1 style="font-size:30px;line-height:1.2;margin:16px 0 10px;color:#ffffff">Welcome aboard, ${e(first)}.</h1>
<p style="font-size:16px;line-height:1.6;margin:0;color:#d6def0">Your affiliate account is active. Share your links, help people learn digital and AI skills, and earn on every paid enrolment you bring.</p>
</td></tr>
<tr><td class="px" style="padding:0 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:-18px"><tr>${stat(`${rate}%`, "commission")}${gap}${stat("30 days", "referral tracking")}${gap}${stat(code, "your code")}</tr></table></td></tr>
<tr><td class="px" style="padding:28px 32px 8px">
<h2 style="font-size:20px;margin:0 0 6px">Your share links</h2>
<p style="font-size:14px;line-height:1.6;color:#586980;margin:0 0 16px">Anyone who opens one of these links is credited to you for 30 days. Use the course link when you know which course suits someone.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${linkRows}</table>
<p style="margin:18px 0 8px"><a href="${e(dashboardUrl)}" style="display:inline-block;padding:15px 24px;background:#ef5e33;border-radius:10px;color:#ffffff;text-decoration:none;font-weight:bold">Open my affiliate dashboard →</a></p>
<p style="font-size:13px;color:#586980;margin:0">Track visits, sign-ups and earnings, and copy your links any time.</p>
</td></tr>
<tr><td class="px" style="padding:24px 32px 4px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f1;border:1px solid #fbd6c8;border-radius:14px"><tr><td style="padding:20px">
<div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#ab3c18">READY TO SEND</div>
<p style="font-size:15px;line-height:1.6;color:#233c6f;margin:8px 0 14px;overflow-wrap:anywhere;word-break:break-word">“${e(message)}”</p>
<a href="${e(whatsapp)}" style="display:inline-block;padding:11px 18px;background:#25d366;border-radius:8px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px">Share on WhatsApp</a>
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:28px 32px 4px">
<h2 style="font-size:20px;margin:0 0 16px">How top affiliates succeed</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${practiceRows}</table>
</td></tr>
<tr><td class="px" style="padding:8px 32px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fc;border-radius:14px"><tr><td style="padding:20px">
<h3 style="font-size:16px;margin:0 0 10px">How you get paid</h3>
<p style="font-size:14px;line-height:1.6;color:#586980;margin:0">When a student you referred pays, a commission appears in your dashboard as <strong>pending</strong>. Once the payment is final, we approve it and pay you by bank transfer or mobile money, using the payout details you gave us.</p>
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:20px 32px 8px">
<h3 style="font-size:16px;margin:0 0 10px">Programme rules</h3>
${affiliateRules.map((r) => `<p style="font-size:14px;line-height:1.6;color:#586980;margin:0 0 6px">• ${e(r)}</p>`).join("")}
</td></tr>
<tr><td class="px" style="padding:20px 32px 32px">
<p style="font-size:14px;line-height:1.6;color:#586980;margin:0;border-top:1px solid #e2e7ef;padding-top:20px">Questions? Reply to this email or contact <a href="mailto:steve@pacificwavedigital.com" style="color:#233c6f">steve@pacificwavedigital.com</a>.<br/>Pacific Wave Digital · Port Vila, Vanuatu · +678 528 8141</p>
</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    `Welcome aboard, ${first}. You're approved as a Pacific Wave Digital affiliate.`,
    `Commission: ${rate}% of what each referred student pays · Referral tracking: 30 days · Your code: ${code}`,
    "YOUR SHARE LINKS",
    ...links.map((l) => `${l.title}${l.earn ? ` (you earn ${l.earn})` : ""}\n${l.url}`),
    `Affiliate dashboard: ${dashboardUrl}`,
    `READY TO SEND\n${message}`,
    "HOW TOP AFFILIATES SUCCEED",
    ...affiliatePractices.map((p, i) => `${i + 1}. ${p.title}: ${p.body}`),
    "HOW YOU GET PAID\nWhen a referred student pays, your commission shows as pending. Once the payment is final we approve it and pay you by bank transfer or mobile money.",
    "PROGRAMME RULES",
    ...affiliateRules.map((r) => `- ${r}`),
    "Questions? steve@pacificwavedigital.com · +678 528 8141\nPacific Wave Digital · Port Vila, Vanuatu",
  ].join("\n\n");
  return { html, text };
}
