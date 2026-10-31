import { servicePages } from "../service-pages";
import { projectCaseStudies } from "../project-case-studies";
import { personalOffers } from "../lms/personal-programs";
import { novemberCohort, initialCohort, feeLabel, dayMonth } from "../training/config";

import { siteOrigin, socialVersion } from "./social-constants";
export { siteOrigin, socialVersion } from "./social-constants";
export type SocialCard = { path: string; key: string; title: string; description: string; label: string; photo: string; detail: string };
const entry = (path: string, key: string, title: string, description: string, photo: string, label = "PACIFIC WAVE DIGITAL", detail = "Websites · Software · AI · Training"): SocialCard => ({ path, key, title, description, photo, label, detail });
export const socialCards: SocialCard[] = [
  entry("/", "home", "Digital skills. Practical solutions.", "Websites, software, apps and AI automation from Port Vila for Vanuatu and Pacific businesses.", "/images/custom/coastal.webp"),
  entry("/about", "about", "Technology with a Pacific perspective", "Meet Pacific Wave Digital, our work and our approach to practical digital solutions.", "/images/team-meeting.jpg", "ABOUT US"),
  entry("/services", "services", "Digital services for your next step", "Web development, software, AI automation and digital marketing for Pacific businesses.", "/images/custom/brand.webp", "OUR SERVICES"),
  entry("/products", "products", "Explore our apps & platforms", "Discover the digital products and platforms in the Pacific Wave Digital ecosystem.", "/images/training/personal/apps.png", "PRODUCTS & PLATFORMS"),
  entry("/portfolio", "portfolio", "See what we’ve built", "Explore our website projects and software case studies in Vanuatu.", "/images/projects/pwd-training-centre-desktop.webp", "SELECTED WORK"),
  entry("/blog", "blog", "Ideas you can put to work", "Practical guides to websites, AI and digital tools for Pacific Island businesses.", "/images/blog/ai-editorial.webp", "BLOG & INSIGHTS"),
  entry("/contact", "contact", "Let’s talk about your next project", "Contact Pacific Wave Digital in Port Vila about websites, apps, software and AI.", "/images/team-meeting.jpg", "CONTACT OUR TEAM"),
  entry("/get-started", "get-started", "Bring your project to life", "Tell Pacific Wave Digital what you want to build and plan your next step.", "/images/custom/brand.webp", "START A PROJECT"),
  entry("/quote", "quote", "Packages & pricing", "Website and digital system packages, payment schedule and running costs.", "/images/training/personal/websites.png", "PLAN YOUR PROJECT", "Clear scope · Practical options · VUV pricing"),
  entry("/privacy", "privacy", "Your privacy matters", "How Pacific Wave Digital collects, uses and protects your personal information.", "/images/custom/brand.webp", "PRIVACY POLICY"),
  entry("/terms", "terms", "Clear terms. Clear expectations.", "Terms for using Pacific Wave Digital’s website, services and affiliate programme.", "/images/custom/brand.webp", "TERMS OF SERVICE"),
  entry("/affiliates", "affiliates", "Share practical skills. Earn commission.", "Join the Pacific Wave Digital affiliate programme worldwide and recommend eligible training.", "/images/affiliates/hero.webp", "AFFILIATE PROGRAMME", "15% on eligible paid course referrals · Open worldwide"),
  entry("/training-center", "training", "Learn. Build. Grow.", "Explore practical business and AI courses, private programmes and live training.", "/images/training/hero.webp", "TRAINING CENTRE", "Business creation · AI · Coding · Practical projects"),
  entry("/vanuatu-training", "november-course", novemberCohort.title, `Practical business and AI training in Vanuatu, ${dayMonth(novemberCohort.start)}–${dayMonth(novemberCohort.teachingEnd)}.`, "/images/training/hero.webp", "VANUATU · LIVE TRAINING", `${dayMonth(novemberCohort.start)}–${dayMonth(novemberCohort.teachingEnd)} · ${feeLabel(novemberCohort)}`),
  entry("/training-center/programs/vanuatu-november-2026", "november-programme", novemberCohort.title, "Practical business and AI training with final revision sessions.", "/images/training/hero.webp", "NOVEMBER–DECEMBER COHORT", `${dayMonth(novemberCohort.start)}–${dayMonth(novemberCohort.teachingEnd)} · ${feeLabel(novemberCohort)}`),
  entry("/training-center/programs/vanuatu-october-2026", "october-course", initialCohort.title, "Practical business, website, marketing and AI training from Pacific Wave Digital.", "/images/training/hero.webp", "OCTOBER COHORT", "12 practical sessions · Business & AI skills"),
  ...personalOffers.map(p => entry(`/training-center/programs/${p.slug}`, `course-${p.slug}`, p.title.replace(" — One-on-One", "").replace(" — Both Phases", ""), p.headline+" "+p.audience, p.image, p.teachingWeeks === 12 ? "BOTH PHASES · PRIVATE TRAINING" : "ONE-ON-ONE TRAINING", `VUV ${p.amount.toLocaleString("en-US")} · ${p.teachingWeeks} weeks of lessons + ${p.mentorshipMonths} month${p.mentorshipMonths===1?"":"s"} mentorship`)),
  ...servicePages.map(s => entry(`/services/${s.slug}`, `service-${s.slug}`, s.h1, s.metaDescription, s.slug === "online-payment-integration" ? "/images/payments/couple-laptop-card-hero.webp" : ["web-design","web-development","ecommerce"].includes(s.slug) ? "/images/custom/commerce.webp" : s.slug === "digital-marketing" || s.slug === "seo" ? "/images/digital-marketing.jpg" : "/images/custom/brand.webp", "OUR SERVICES", "Port Vila · Vanuatu · The Pacific")),
  ...projectCaseStudies.map(p => entry(`/portfolio/${p.slug}`, `project-${p.slug}`, p.name, p.summary, `/images/projects/${p.slug}-desktop.webp`, "PROJECT CASE STUDY", p.category+" · "+p.location)),
  entry("/portfolio/pwd-training-centre", "project-training", "The PWD training platform", "Course enrolment, payments, live classes and private student workspaces.", "/images/projects/pwd-training-centre-desktop.webp", "SOFTWARE CASE STUDY", "Built in Vanuatu · Practical digital learning"),
];
export function socialCard(path: string) { return socialCards.find(c => c.path === path) || socialCards[0]; }
export function socialImage(path: string) { return `${siteOrigin}/images/social/${socialVersion}/${socialCard(path).key}.jpg`; }
