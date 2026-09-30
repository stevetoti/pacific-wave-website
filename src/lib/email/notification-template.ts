import { escapeHtml as e } from "./training-template";
// Branded notification email: sender card, message preview and one clear action.
export function notificationTemplate({
  heading,
  intro,
  actorName,
  actorHeadline,
  actorAvatar,
  quote,
  action,
  url,
  settingsUrl,
}: {
  heading: string;
  intro: string;
  actorName: string;
  actorHeadline: string;
  actorAvatar: string;
  quote: string;
  action: string;
  url: string;
  settingsUrl: string;
}) {
  const initial = e((actorName || "?").slice(0, 1).toUpperCase());
  const avatar = actorAvatar
    ? `<img src="${e(actorAvatar)}" width="52" height="52" alt="" style="display:block;width:52px;height:52px;border-radius:26px;object-fit:cover"/>`
    : `<div style="width:52px;height:52px;line-height:52px;border-radius:26px;background:#233c6f;color:#ffffff;text-align:center;font-weight:bold;font-size:22px">${initial}</div>`;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#f2f5f9;font-family:Arial,Helvetica,sans-serif;color:#233c6f">
<div style="display:none;max-height:0;overflow:hidden">${e(quote.slice(0, 120))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="560" style="width:100%;max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td style="background:#233c6f;padding:20px 26px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td><img src="https://pacificwavedigital.com/images/training/pwd-logo.png" width="36" height="36" alt="Pacific Wave Digital"/></td>
<td style="padding-left:12px;color:#ffffff;font-size:12px;letter-spacing:2px;font-weight:bold">PACIFIC WAVE DIGITAL<br/><span style="color:#ef5e33">TRAINING CENTRE</span></td></tr></table></td></tr>
<tr><td style="padding:28px 26px 8px">
<h1 style="font-size:22px;line-height:1.3;margin:0 0 6px;color:#233c6f">${e(heading)}</h1>
<p style="font-size:15px;line-height:1.6;margin:0;color:#586980">${e(intro)}</p>
</td></tr>
<tr><td style="padding:18px 26px 4px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e7ef;border-radius:14px"><tr><td style="padding:16px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td valign="top">${avatar}</td>
<td style="padding-left:12px" valign="middle"><div style="font-weight:bold;font-size:16px;color:#233c6f">${e(actorName)}</div>${actorHeadline ? `<div style="font-size:13px;color:#586980;margin-top:2px">${e(actorHeadline)}</div>` : ""}</td></tr></table>
${quote ? `<div style="margin-top:14px;padding:12px 14px;background:#f6f8fc;border-left:4px solid #ef5e33;border-radius:0 10px 10px 0;font-size:15px;line-height:1.6;color:#233c6f;white-space:pre-wrap;overflow-wrap:anywhere">${e(quote)}</div>` : ""}
</td></tr></table>
</td></tr>
<tr><td style="padding:22px 26px 8px"><a href="${e(url)}" style="display:inline-block;padding:14px 26px;background:#ef5e33;border-radius:10px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px">${e(action)} →</a></td></tr>
<tr><td style="padding:18px 26px 26px"><p style="font-size:12px;line-height:1.6;color:#8793a8;margin:0;border-top:1px solid #e2e7ef;padding-top:16px">You're receiving this because you have a Pacific Wave Digital Training Centre account. <a href="${e(settingsUrl)}" style="color:#586980">Turn off message emails</a>.<br/>Pacific Wave Digital · Port Vila, Vanuatu</p></td></tr>
</table></td></tr></table></body></html>`;
  const text = [heading, intro, `${actorName}${actorHeadline ? ` (${actorHeadline})` : ""}`, quote ? `“${quote}”` : "", `${action}: ${url}`, `Turn off message emails: ${settingsUrl}`, "Pacific Wave Digital · Port Vila, Vanuatu"]
    .filter(Boolean)
    .join("\n\n");
  return { html, text };
}
