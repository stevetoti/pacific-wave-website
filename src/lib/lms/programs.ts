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
  }
> = {
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
  [businessSlug]: {
    image: "/images/team-meeting.jpg",
    alt: "Entrepreneurs collaborating on their business projects",
    label: "COMING SOON",
    duration: "Schedule to be announced",
    headline: "Start with an idea. Build a business with purpose.",
    audience:
      "Aspiring founders, side-hustle builders and small business owners who want a practical path from an idea to their first offer.",
    outcomes: [
      "Find a customer problem worth solving",
      "Validate an idea before investing heavily",
      "Create an offer, pricing and a simple business plan",
      "Use AI for research, content and everyday operations",
      "Plan your website, marketing and first sales",
    ],
    modules: [
      {
        title: "01 · Find your business opportunity",
        body: "Explore your skills, identify customer problems, research competitors and test demand with real conversations.",
      },
      {
        title: "02 · Design an offer people understand",
        body: "Define your audience, shape your product or service, estimate costs and build a practical pricing model.",
      },
      {
        title: "03 · Build your brand and online presence",
        body: "Develop your positioning, map out a website and learn how ecommerce can support your business.",
      },
      {
        title: "04 · Work smarter with AI",
        body: "Use AI to support research, write useful content and organise repeatable business tasks.",
      },
      {
        title: "05 · Launch, measure and improve",
        body: "Prepare a launch plan, start customer outreach and track the numbers that help you improve.",
      },
    ],
  },
  [mentorshipSlug]: {
    image: "/images/diverse-team.jpg",
    alt: "A learner working on a digital project on a laptop",
    label: "PERSONAL MENTORSHIP",
    duration: "3 months · One-on-one training",
    headline: "Your idea. Your pace. A mentor beside you.",
    audience:
      "Entrepreneurs, professionals and ambitious beginners who want personal guidance building a business with AI. Your learning plan is tailored to your starting point and project.",
    outcomes: [
      "Validate a business idea and build a clear offer",
      "Create a website and ecommerce customer journey",
      "Build WordPress sites with AI-assisted workflows",
      "Build one software project during the programme with your mentor",
      "Get three months free of Digi Assist AI Pro",
      "Connect useful automations, APIs and business tools",
      "Replay your own recorded sessions from your dashboard",
    ],
    modules: [
      {
        title: "Month 1 · Business foundations & AI",
        body: "Clarify your business idea, customers, offer and pricing. Learn AI research, prompting, content creation and practical business workflows. Define a project to build with your mentor.",
      },
      {
        title: "Month 2 · Websites, WordPress & ecommerce",
        body: "Plan and build a professional website. Explore AI-assisted WordPress development, product pages, checkout journeys and the basics of search visibility and conversion.",
      },
      {
        title: "Month 3 · AI coding, software & launch",
        body: "Build one software project during the programme using AI-assisted coding, databases, APIs and automation. Work with your mentor on testing, debugging and deployment, then create a launch and improvement plan.",
      },
    ],
  },
};
