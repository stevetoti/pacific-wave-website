// Shared affiliate guidance used by the welcome email and the affiliate dashboard.
export const affiliatePractices: { title: string; body: string }[] = [
  {
    title: "Share your own story",
    body: "Say why you recommend the course and who it's for. A personal message gets far more replies than a copied advert.",
  },
  {
    title: "Pick the right people",
    body: "Think of people starting or growing a business, job seekers, students and community leaders who want digital and AI skills.",
  },
  {
    title: "Use WhatsApp and Facebook well",
    body: "Post on your WhatsApp status, share in groups where it's welcome, and send one-to-one messages to people who would benefit.",
  },
  {
    title: "Share regularly, with a reason",
    body: "Post once or twice a week, and remind people before enrolment closes or a new class starts. Steady beats one big burst.",
  },
  {
    title: "Follow up and help",
    body: "Answer questions, send the course page and help people finish registration. Most enrolments come after a second conversation.",
  },
  {
    title: "Always use your link",
    body: "Referrals are only credited when people open your link. Send the course-specific link when you know which course suits them.",
  },
];
export const affiliateRules = [
  "Be honest. Never promise income, jobs or results, and never invent discounts or deadlines.",
  "No spam. Don't add people to groups without asking or message strangers repeatedly.",
  "Don't run paid ads on the Pacific Wave Digital name, or pretend to be Pacific Wave Digital staff.",
  "Purchases with your own account don't earn commission.",
  "Commission is earned on what the student actually pays. Refunded enrolments are cancelled.",
];
export function shareMessage(link: string) {
  return `I'm recommending Pacific Wave Digital's practical training in digital, AI and online business skills, in Port Vila and online. Have a look here: ${link}`;
}
// Public page each course is sold from; cohort courses have their own landing page.
export function affiliateDestination(course: { slug: string; cohort_id: string | null }, hasProgramPage: boolean) {
  return course.cohort_id
    ? "/vanuatu-training"
    : hasProgramPage
      ? `/training-center/programs/${course.slug}`
      : "/training-center";
}
export const affiliateLink = (origin: string, code: string, to: string) =>
  `${origin}/go/${code}${to === "/training-center" ? "" : `?to=${to}`}`;
