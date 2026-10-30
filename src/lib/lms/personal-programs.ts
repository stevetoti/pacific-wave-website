import data from "./personal-programs.json";
export const foundationsSlug = data.foundations.slug;
export const softwareSlug = data.software.slug;
export const fullProgramSlug = data.full.slug;
export type PersonalSession = { title: string; body: string };
export type PersonalOffer = {
  slug: string; title: string; amount: number; teachingWeeks: number; mentorshipMonths: number;
  image: string; headline: string; audience: string; outcomes: string[];
  modules: PersonalSession[]; sessions: PersonalSession[];
};
export const personalOffers: PersonalOffer[] = [data.foundations, data.software, {
  ...data.full,
  modules: [...data.foundations.modules, ...data.software.modules.map(m => ({...m,title:m.title.replace(/Week (\d+)/,(_,n:string)=>`Week ${Number(n)+6}`).replace('Weeks 4–5','Weeks 10–11')}))],
  sessions: [...data.foundations.sessions, ...data.software.sessions],
}];
export function personalOffer(slug: string) { return personalOffers.find(p => p.slug === slug); }
export const lessonSchedule = "Three scheduled one-on-one lessons per week, 90 minutes each.";
export const mentorshipExplanation = "Mentorship follows the scheduled lessons. Steve guides you as you apply what you learned, review your project and solve problems. Meet about once a week, or arrange additional help when needed during your included mentorship period. Meeting times are agreed together; this is not another block of three formal lessons every week.";
export function personalDuration(p: PersonalOffer) {
  return `${p.teachingWeeks === 6 ? '1½ months' : '3 months'} · ${p.sessions.length} lessons · ${p.mentorshipMonths} month${p.mentorshipMonths === 1 ? '' : 's'} follow-up mentorship`;
}
export function personalCheckoutNote(p: PersonalOffer) {
  return `Includes ${p.sessions.length} one-on-one lessons over ${p.teachingWeeks} weeks (${p.sessions.length*1.5} teaching hours), then ${p.mentorshipMonths} month${p.mentorshipMonths===1?'':'s'} of follow-up mentorship${p.slug===fullProgramSlug?' after both phases':''}. ${lessonSchedule} Private session recordings are published to your own enrolment. ${mentorshipExplanation}`;
}
