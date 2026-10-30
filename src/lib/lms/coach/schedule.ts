import { personalOffer } from "../personal-programs";
import { programs } from "../programs";
export function spokenTime(label: string) {
  const words = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  return label.replace(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[–—-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi,
    (_m, a, am, ap, b, bm, bp) => {
      const time = (h: string, m: string, p: string) => `${words[Number(h) % 12]}${m && m !== "00" ? ` ${Number(m) < 10 ? "oh " : ""}${Number(m)}` : ""} ${p.toLowerCase() === "pm" ? "p.m." : "a.m."}`;
      return `from ${time(a, am, ap || bp)} to ${time(b, bm, bp)}`;
    });
}
export function coachingWindow(course: { slug: string; coaching_ends_on?: string | null; private_sessions?: boolean }, cohort: { actionEnd?: string; teachingEnd?: string; timezone?: string } | null, lessonStarts: (string | null)[], now = new Date()) {
  let end = course.coaching_ends_on || cohort?.actionEnd || cohort?.teachingEnd?.slice(0, 10) || null;
  const personal = personalOffer(course.slug);
  if (!end && personal) {
    const first = lessonStarts.filter((x): x is string => !!x).sort()[0];
    if (first) {
      const date = new Date(first);
      date.setUTCDate(date.getUTCDate() + personal.teachingWeeks * 7);
      const day = date.getUTCDate();
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() + personal.mentorshipMonths);
      const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth()+1, 0)).getUTCDate();
      date.setUTCDate(Math.min(day,last));
      end = date.toISOString().slice(0, 10);
    }
  }
  const today = new Intl.DateTimeFormat("en-CA", {timeZone: cohort?.timezone || "Pacific/Efate", year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
  return { ends_on: end, active: !end || today <= end };
}
export function programOutline(slug: string) { return programs[slug]?.modules || []; }
