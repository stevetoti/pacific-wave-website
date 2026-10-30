import { personalOffers, personalDuration, type PersonalOffer } from "./personal-programs";
import { novemberCourseSlug } from "../training/config";
import { novemberOutline } from "../training/outline";
import { blpSlug, blpModules } from "./blp-workshop";
export const mentorshipSlug = "one-on-one-mentorship";
export const businessSlug = "how-to-start-a-profitable-business";
export const programs: Record<
  string,
  {
    image: string;
    alt: string;
    label: string;
    duration: string;
    headline: string;
    audience: string;
    outcomes: string[];
    modules: { title: string; body: string }[];
    personal?: PersonalOffer;
  }
> = {
  [blpSlug]: {
    image: "/images/training/blp/scene-01.webp", alt: "Illustration of Ni-Vanuatu business owners learning together",
    label: "PRIVATE BLP WORKSHOP", duration: "21 October 2026 · 9 am–4 pm", headline: "Bring your business online.",
    audience: "Invited Business Link Pacific participants", outcomes: [], modules: blpModules,
  },
  "vanuatu-october-2026": {
    image: "/images/training/hero.webp",
    alt: "Pacific learners building digital skills together",
    label: "LIVE OCTOBER COHORT",
    duration: "5–31 October · 12 live sessions",
    headline: "Turn your business idea into an online presence.",
    audience: "Aspiring entrepreneurs and business owners in Vanuatu.",
    outcomes: [
      "Develop your business idea",
      "Build your online presence",
      "Learn alongside a live cohort",
    ],
    modules: [],
  },
  [novemberCourseSlug]: {
    image: "/images/training/hero.webp",
    alt: "Pacific learners building digital skills together",
    label: "NOVEMBER–DECEMBER COHORT",
    duration: "16 November–19 December · 15 live sessions · 30 hours",
    headline: "Build Your Business in 30 Days with AI",
    audience: "Aspiring entrepreneurs and owners of shops, local services, tourism ventures and digital businesses in Vanuatu and the Pacific.",
    outcomes: ["Develop your offer, reach customers and use AI in everyday business", "Complete the same 12 practical lessons", "Revise and improve your project in three final sessions"],
    modules: novemberOutline.map(([title, body], i) => ({title: `Week ${i + 1}: ${title}`, body})),
  },
  ...Object.fromEntries(personalOffers.map(p => [p.slug, {
    image: p.image, alt: "Illustrative business and technology learning scene",
    label: p.teachingWeeks === 12 ? "BOTH PHASES · BEST VALUE" : "ONE-ON-ONE TRAINING",
    duration: personalDuration(p), headline: p.headline, audience: p.audience,
    outcomes: p.outcomes, modules: p.modules, personal: p,
  }])),
};
