import { programs } from "../lms/programs";
import { money, type Course } from "../lms/types";
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function trainingTemplate({
  title,
  intro,
  action,
  url,
  details = [],
  courses = [],
  secondary,
}: {
  title: string;
  intro: string;
  action: string;
  url: string;
  details?: string[];
  courses?: Course[];
  secondary?: { action: string; url: string };
}) {
  const e = escapeHtml;
  const courseCards = courses
    .map((c) => {
      const link = c.cohort_id
        ? "https://pacificwavedigital.com/vanuatu-training"
        : programs[c.slug]
          ? `https://pacificwavedigital.com/training-center/programs/${encodeURIComponent(c.slug)}`
          : `https://pacificwavedigital.com/training-center/checkout?course=${encodeURIComponent(c.slug)}`;
      return `<tr><td style="padding:18px 0;border-top:1px solid #dde3eb"><h3 style="margin:0 0 7px;font-size:18px;color:#233c6f">${e(c.title)}</h3><p style="margin:0 0 8px;color:#586980;line-height:1.6">${e(c.description)}</p><p style="margin:0 0 10px;font-weight:bold">${c.enrollment_open ? e(money(c.amount, c.currency)) : "Coming soon · Enrolment not yet open"}</p><a href="${e(link)}" style="color:#ab3c18;font-weight:bold">Explore this course →</a></td></tr>`;
    })
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f2f5f9;font-family:Arial,sans-serif;color:#233c6f"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="600" style="width:100%;max-width:600px;background:white;border-radius:18px;overflow:hidden" cellpadding="0" cellspacing="0"><tr><td style="background:#233c6f;padding:28px;color:white"><img src="https://pacificwavedigital.com/images/training/pwd-logo.png" width="44" height="44" alt="Pacific Wave Digital"/><p style="font-size:12px;letter-spacing:2px;margin:14px 0 0">PACIFIC WAVE DIGITAL · TRAINING CENTRE</p></td></tr><tr><td style="padding:32px"><h1 style="font-size:29px;line-height:1.2;margin:0 0 20px">${e(title)}</h1><p style="font-size:16px;line-height:1.7;color:#586980">${e(intro)}</p>${details.map((d) => `<p style="font-size:15px;line-height:1.7;color:#586980">${e(d)}</p>`).join("")}<p style="margin:28px 0"><a href="${e(url)}" style="display:inline-block;padding:16px 24px;background:#233c6f;border-radius:8px;color:white;text-decoration:none;font-weight:bold">${e(action)} →</a></p><p style="font-size:12px;color:#586980;overflow-wrap:anywhere">Button not working? Copy this link into your browser:<br/><a href="${e(url)}">${e(url)}</a></p>${secondary ? `<p style="margin:20px 0"><a href="${e(secondary.url)}" style="color:#233c6f;font-weight:bold">${e(secondary.action)} →</a></p>` : ""}${courses.length ? `<h2 style="margin-top:32px;font-size:23px">Your next learning opportunity</h2><p style="line-height:1.6;color:#586980">Practical training in business, AI, websites, ecommerce and software development. Choose live group learning or personal mentorship, with projects, recordings and support from your instructor.</p><table role="presentation" width="100%">${courseCards}</table>` : ""}<p style="margin-top:30px;font-size:14px;line-height:1.6;color:#586980">Need help? Reply to this email or contact <a href="mailto:steve@pacificwavedigital.com">steve@pacificwavedigital.com</a>.<br/>Pacific Wave Digital · Port Vila, Vanuatu · +678 528 8141</p></td></tr></table></td></tr></table></body></html>`;
  const text = [
    title,
    intro,
    ...details,
    `${action}: ${url}`,
    secondary ? `${secondary.action}: ${secondary.url}` : "",
    courses.length
      ? "Explore practical business, AI, websites, ecommerce and software training:"
      : "",
    ...courses.map(
      (c) =>
        `${c.title}\n${c.description}\n${c.enrollment_open ? money(c.amount, c.currency) : "Coming soon"}\nhttps://pacificwavedigital.com/training-center`,
    ),
    "Need help? steve@pacificwavedigital.com · +678 528 8141\nPacific Wave Digital · Port Vila, Vanuatu",
  ]
    .filter(Boolean)
    .join("\n\n");
  return { html, text };
}
