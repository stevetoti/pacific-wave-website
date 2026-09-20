// Content and metadata for the dedicated SEO service pages under /services/<slug>.
// Each entry drives one statically generated page (src/app/(website)/services/[slug]),
// its metadata, and its Service + FAQPage JSON-LD.

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface ServiceProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServicePageData {
  slug: string;
  /** Short label used in nav, footer, and related-services cards. */
  label: string;
  /** The H1 and the metadata title phrase (the root layout template appends "| Pacific Wave Digital"). */
  h1: string;
  metaDescription: string;
  keywords: string[];
  /** serviceType for the Service JSON-LD schema. */
  serviceType: string;
  heroBadge: string;
  heroSubtitle: string;
  /** Tailwind gradient classes for the icon accent, matching the hub page cards. */
  gradient: string;
  icon: string;
  intro: string[];
  benefitsHeading: string;
  benefitsIntro: string;
  benefits: ServiceBenefit[];
  processIntro: string;
  process: ServiceProcessStep[];
  faqs: ServiceFaq[];
  furtherReading?: { label: string; href: string };
  /** Short description for the /services hub card and related-services block. */
  cardDescription: string;
}

export const servicePages: ServicePageData[] = [
  {
    slug: 'web-design',
    label: 'Web Design',
    h1: 'Web Design in Vanuatu',
    metaDescription:
      'Professional web design in Vanuatu from a Port Vila based team. Mobile-first website design for tourism, retail, and professional businesses across the Pacific.',
    keywords: [
      'web design Vanuatu',
      'website design Vanuatu',
      'web design Port Vila',
      'website designers Vanuatu',
      'Pacific Islands web design',
    ],
    serviceType: 'Web Design',
    heroBadge: 'Web Design',
    heroSubtitle:
      'Beautiful, mobile-first websites designed in Port Vila for Vanuatu businesses — built to load fast on island connections and convert visitors into customers.',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '🎨',
    intro: [
      'Your website is often the first meeting a customer has with your business. For a resort in Port Vila, a tour operator on Santo, or a professional firm serving clients across the Pacific, that first impression is made in seconds — usually on a phone screen, often on a slow connection. Good website design in Vanuatu has to respect those realities, not fight them.',
      'Pacific Wave Digital designs websites from Port Vila, for the market we live in. We know most of your visitors will arrive on mobile data, that overseas travellers research Vanuatu months before they book, and that a heavy, cluttered page simply will not load for someone browsing from an outer island. So we design light, fast, and mobile-first — clear layouts, honest photography, and a single obvious next step on every page.',
      'Whether you need a five-page brochure site, a redesign of a dated site that no longer reflects your business, or a full brand refresh with logo and colours to match, our web design process is built around one goal: a site that looks professional, works everywhere, and makes it easy for customers to contact you, book you, or buy from you.',
    ],
    benefitsHeading: 'What good web design looks like in Vanuatu',
    benefitsIntro:
      'Design is more than decoration. Every choice we make serves a practical purpose for a Pacific business.',
    benefits: [
      {
        icon: '📱',
        title: 'Mobile-first, always',
        description:
          'Most browsing in Vanuatu happens on phones over mobile data. We design for the small screen first, so your site works perfectly for the majority of your audience.',
      },
      {
        icon: '⚡',
        title: 'Fast on island connections',
        description:
          'Lightweight pages, compressed images, and global content delivery mean your site loads quickly even on modest connections — in Vila, on the islands, or overseas.',
      },
      {
        icon: '🧭',
        title: 'Clear paths to action',
        description:
          'Every page guides visitors toward one thing: contacting you, booking, or buying. No dead ends, no confusion, no buried phone numbers.',
      },
      {
        icon: '🏝️',
        title: 'Designed for your market',
        description:
          'Tourism sites that sell the experience to travellers in Australia and New Zealand. Local business sites that build trust with customers in Vanuatu. Different audiences, different designs.',
      },
      {
        icon: '🔍',
        title: 'Search-ready structure',
        description:
          'Proper headings, metadata, and page structure from day one, so Google can find and rank your site — design and SEO working together, not as an afterthought.',
      },
      {
        icon: '🛠️',
        title: 'Easy to keep updated',
        description:
          'A content management setup that lets your team change prices, photos, and opening hours without calling a developer every time.',
      },
    ],
    processIntro:
      'A clear, staged process — you see the design before we build, and nothing goes live without your approval.',
    process: [
      {
        step: '01',
        title: 'Discovery',
        description:
          'We sit down with you — in person in Port Vila or by video call — to understand your business, your customers, and what the site needs to achieve.',
      },
      {
        step: '02',
        title: 'Design concepts',
        description:
          'You get visual designs of the key pages to review and refine before any code is written. Revisions happen here, where they are cheap.',
      },
      {
        step: '03',
        title: 'Build & content',
        description:
          'We build the approved design, load your content and photography, and test it on real phones and real connection speeds.',
      },
      {
        step: '04',
        title: 'Launch & handover',
        description:
          'We launch on reliable hosting, connect your domain, submit the site to Google, and show your team how to manage it.',
      },
    ],
    faqs: [
      {
        question: 'How much does a website design cost in Vanuatu?',
        answer:
          'It depends on the size and complexity of the site — a simple brochure site is a very different project from a booking-enabled tourism site. We scope every project first and give you a fixed quote in advance, so there are no surprises. Staged payments are available so the cost fits your cash flow.',
      },
      {
        question: 'How long does it take to design and launch a website?',
        answer:
          'A typical small business website takes a few weeks from our first meeting to launch, depending mostly on how quickly content and photos come together. Larger sites with bookings or e-commerce take longer. We agree on a timeline up front and keep you updated at every stage.',
      },
      {
        question: 'Will my website work well on slow internet connections?',
        answer:
          'Yes — this is central to how we design. We keep pages light, compress every image, and serve your site from a global content delivery network, so it loads quickly whether your visitor is in Port Vila, on an outer island, or researching their holiday from Sydney.',
      },
      {
        question: 'Can I update the website myself after it launches?',
        answer:
          'Absolutely. We set up a content management system and train your team to change text, photos, prices, and opening hours themselves. For anything bigger, we offer ongoing support arrangements.',
      },
    ],
    cardDescription:
      'Mobile-first website design from Port Vila — fast-loading, search-ready sites that turn visitors into customers.',
  },
  {
    slug: 'web-development',
    label: 'Web Development',
    h1: 'Web Development in Vanuatu',
    metaDescription:
      'Web development in Vanuatu by a Port Vila based website development company. Modern, fast, secure websites and web applications for Pacific Island businesses.',
    keywords: [
      'web development Vanuatu',
      'website development company Vanuatu',
      'web developers Port Vila',
      'web application development Pacific',
      'Next.js developers Vanuatu',
    ],
    serviceType: 'Web Development',
    heroBadge: 'Web Development',
    heroSubtitle:
      'A website development company based in Port Vila, building modern, secure websites and web applications that stay fast and reliable — even across Pacific distances.',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '💻',
    intro: [
      'There is a difference between a website that merely exists and one that works hard for your business every day. As a website development company based in Vanuatu, Pacific Wave Digital builds the second kind: fast, secure, properly engineered sites and web applications that keep working through slow connections, power cuts, and cyclone season.',
      'We build with modern technology — React, Next.js, and TypeScript — the same stack used by leading companies worldwide, deployed on global hosting infrastructure. That matters here more than almost anywhere: because Vanuatu sits at the end of long undersea cables, a site hosted on a single distant server feels slow. We deploy to content delivery networks with edge locations close to your visitors, so your site is quick for a customer in Port Vila and a traveller in Melbourne alike.',
      'Beyond standard websites, we develop web applications: customer portals, booking systems, membership areas, dashboards, and integrations that connect your website to the tools you already use. If your business runs on spreadsheets and manual emails, a well-built web application can quietly remove hours of work every week.',
    ],
    benefitsHeading: 'Why businesses choose our web development',
    benefitsIntro:
      'Engineering decisions made for the realities of running a business in the Pacific.',
    benefits: [
      {
        icon: '🚀',
        title: 'Modern technology stack',
        description:
          'React, Next.js, and TypeScript — proven, actively maintained technology that will not leave you stranded on an abandoned platform in three years.',
      },
      {
        icon: '🌏',
        title: 'Hosting built for the Pacific',
        description:
          'Global content delivery and reliable cloud hosting, so island connectivity issues on our end never take your site down or slow it to a crawl.',
      },
      {
        icon: '🔒',
        title: 'Security as standard',
        description:
          'SSL encryption, secure authentication, and hardened infrastructure on every project — not an optional extra.',
      },
      {
        icon: '🔗',
        title: 'Integrations that save time',
        description:
          'We connect your site to booking engines, payment providers, email tools, and accounting systems, so information flows without manual re-typing.',
      },
      {
        icon: '📈',
        title: 'Built to grow with you',
        description:
          'Clean, well-structured code means adding a new feature next year is straightforward, not a rebuild.',
      },
      {
        icon: '🤝',
        title: 'Local team, local accountability',
        description:
          'You are dealing with a company in Port Vila, in your time zone, that understands your market — not a faceless offshore ticket queue.',
      },
    ],
    processIntro:
      'From first conversation to a live, tested website — with clear milestones you can hold us to.',
    process: [
      {
        step: '01',
        title: 'Scope & plan',
        description:
          'We map out exactly what the site or application needs to do, agree on features, and give you a fixed quote and timeline.',
      },
      {
        step: '02',
        title: 'Design & architecture',
        description:
          'Interface designs for you to approve, and a technical architecture chosen for performance, security, and future growth.',
      },
      {
        step: '03',
        title: 'Development & testing',
        description:
          'We build in short cycles you can review, and test on real devices and realistic connection speeds before anything ships.',
      },
      {
        step: '04',
        title: 'Launch & support',
        description:
          'Deployment to production hosting, monitoring, and ongoing support — we stay available after launch, not just until the invoice is paid.',
      },
    ],
    faqs: [
      {
        question: 'What technology do you build websites with?',
        answer:
          'Primarily React and Next.js with TypeScript, deployed on modern cloud hosting with a global content delivery network. It is the same technology used by major companies worldwide, and it produces sites that are fast, secure, and easy to extend. Where an existing platform genuinely fits better, we will tell you.',
      },
      {
        question: 'Can you take over or rebuild an existing website?',
        answer:
          'Yes. We regularly work with businesses whose sites were built years ago or by developers who are no longer around. We audit what you have, tell you honestly whether it is worth improving or rebuilding, and preserve your domain, content, and search rankings through any transition.',
      },
      {
        question: 'Where will my website be hosted, and is it reliable?',
        answer:
          'On global cloud infrastructure with servers close to your audience — not on a single machine in one country. That means your site stays up and fast even when local connectivity in Vanuatu has a bad day, and it is backed up and monitored continuously.',
      },
      {
        question: 'Do you build web applications, or just websites?',
        answer:
          'Both. Alongside marketing websites we build customer portals, booking and reservation systems, internal dashboards, and other web applications. If your team runs on spreadsheets and email chains, that is usually where we can help most.',
      },
    ],
    furtherReading: {
      label: 'Web Development in Vanuatu — our full guide on the blog',
      href: '/blog/web-development-in-vanuatu',
    },
    cardDescription:
      'Modern, secure websites and web applications engineered in Port Vila with React and Next.js.',
  },
  {
    slug: 'software-development',
    label: 'Software Development',
    h1: 'Custom Software Development in Vanuatu',
    metaDescription:
      'Custom software development in Vanuatu. A Port Vila software company building business systems, portals, and automation for Pacific companies, NGOs, and government.',
    keywords: [
      'custom software development Vanuatu',
      'software company Vanuatu',
      'business systems Vanuatu',
      'software developers Port Vila',
      'business automation Pacific Islands',
    ],
    serviceType: 'Custom Software Development',
    heroBadge: 'Custom Software',
    heroSubtitle:
      'A software company in Port Vila building the business systems Pacific organisations actually need — replacing spreadsheets, paper, and manual processes with tools that fit how you work.',
    gradient: 'from-indigo-500 to-purple-500',
    icon: '⚙️',
    intro: [
      'Most businesses in Vanuatu run on a familiar mix: spreadsheets, paper forms, WhatsApp messages, and one person who knows where everything is. It works — until it doesn’t. Orders get missed, reports take days to assemble, and when that key person is on leave, things stall. Custom software development is how you fix that permanently: business systems built around your actual processes, not the other way around.',
      'As a software company based in Vanuatu, Pacific Wave Digital builds systems for the organisations that keep this country running — retailers and wholesalers managing stock across locations, tourism operators juggling bookings and agents, professional firms tracking clients and compliance, and NGOs and government teams that need reliable records and reporting. We have seen off-the-shelf software fail here because it assumes perfect connectivity, foreign tax rules, or workflows that do not match Pacific reality. Custom software does not make those assumptions.',
      'We design for local conditions from the start: systems that tolerate connectivity dropouts, work well on the devices your staff already have, handle VUV alongside other currencies, and produce the reports your board, your bank, or your donors actually ask for. And because we are in Port Vila, support means a conversation in your time zone — not a ticket lodged with a vendor twelve hours away.',
    ],
    benefitsHeading: 'What custom software can do for your business',
    benefitsIntro:
      'The goal is simple: less manual work, fewer errors, and information you can trust.',
    benefits: [
      {
        icon: '📋',
        title: 'Replace spreadsheet chaos',
        description:
          'One system, one source of truth. Stock, sales, clients, or cases — recorded once, visible to everyone who needs them, impossible to overwrite by accident.',
      },
      {
        icon: '🔄',
        title: 'Automate repetitive work',
        description:
          'Invoices generated, reminders sent, reports compiled automatically. The hours your team spends re-typing information come back every single week.',
      },
      {
        icon: '📊',
        title: 'Reports on demand',
        description:
          'Management, board, bank, or donor reports produced in minutes from live data — not assembled by hand at the end of the month.',
      },
      {
        icon: '📶',
        title: 'Built for imperfect connectivity',
        description:
          'Systems designed to cope with dropouts and slow links, so work continues at a branch on Santo or a site visit on Tanna.',
      },
      {
        icon: '🔐',
        title: 'Your data, protected',
        description:
          'Role-based access, encrypted storage, and automatic backups — a serious upgrade from a shared spreadsheet anyone can edit or delete.',
      },
      {
        icon: '🧩',
        title: 'Fits your existing tools',
        description:
          'We integrate with the accounting, email, and payment tools you already use rather than forcing you to abandon them.',
      },
    ],
    processIntro:
      'Custom software is an investment, so we de-risk it: small steps, working software early, and no surprises.',
    process: [
      {
        step: '01',
        title: 'Understand the workflow',
        description:
          'We spend time with the people who do the work — not just management — to map how things really operate and where the pain is.',
      },
      {
        step: '02',
        title: 'Design the system',
        description:
          'Screens and workflows designed around your process, reviewed with your team before development starts.',
      },
      {
        step: '03',
        title: 'Build in stages',
        description:
          'We deliver the most valuable piece first and put it in your hands early, so you see returns before the full system is finished.',
      },
      {
        step: '04',
        title: 'Train & refine',
        description:
          'Hands-on training for your staff, then refinements based on real use — because the first month of feedback is gold.',
      },
      {
        step: '05',
        title: 'Support & evolve',
        description:
          'Ongoing local support, and the system grows as your business does — new features, new locations, new requirements.',
      },
    ],
    faqs: [
      {
        question: 'Is custom software too expensive for a small Vanuatu business?',
        answer:
          'Not necessarily. We build in stages, starting with the piece that saves you the most time or money, so you see value before committing to a large system. For many businesses, the cost of staying on manual processes — errors, lost hours, missed sales — quietly exceeds the cost of fixing them.',
      },
      {
        question: 'What if our internet connection goes down — can we still work?',
        answer:
          'We design for that from the start. Depending on your needs, systems can queue work locally and sync when the connection returns, so a dropout in Vila or on an outer island does not stop your team.',
      },
      {
        question: 'Can the software connect to our accounting package?',
        answer:
          'In most cases, yes. We build integrations with common accounting, email, and payment tools so data entered once flows everywhere it is needed. We confirm exactly what is possible with your specific tools during scoping.',
      },
      {
        question: 'Who owns the software once it is built?',
        answer:
          'You do. You are paying for a business asset, and we hand over the code and documentation accordingly. We are happy to keep supporting and extending it, but you are never locked in to us.',
      },
    ],
    furtherReading: {
      label: 'Unlocking growth with custom software in Vanuatu — on the blog',
      href: '/blog/unlocking-growth-with-custom-software-in-vanuatu-tailored-solutions-for-pacific-island-businesses-1783548048640',
    },
    cardDescription:
      'Business systems built in Port Vila — replace spreadsheets and manual processes with software that fits how you work.',
  },
  {
    slug: 'digital-marketing',
    label: 'Digital Marketing',
    h1: 'Digital Marketing in Vanuatu',
    metaDescription:
      'Digital marketing in Vanuatu: social media marketing, online advertising, and content strategy from a Port Vila agency that knows the Pacific market.',
    keywords: [
      'digital marketing Vanuatu',
      'social media marketing Vanuatu',
      'online advertising Port Vila',
      'Facebook marketing Vanuatu',
      'digital marketing agency Pacific Islands',
    ],
    serviceType: 'Digital Marketing',
    heroBadge: 'Digital Marketing',
    heroSubtitle:
      'Social media marketing and online advertising run from Port Vila — campaigns built for how people in Vanuatu and your overseas customers actually spend their time online.',
    gradient: 'from-green-500 to-emerald-500',
    icon: '📈',
    intro: [
      'Digital marketing in Vanuatu is its own discipline. The tactics that fill a marketing blog written for American audiences often miss what matters here: that social media — Facebook above all — is where local customers spend their time online; that for tourism businesses, the buying decision is made in Australia or New Zealand months before the flight; and that every vatu of ad spend has to be justified, because budgets here are real money, not a rounding error.',
      'Pacific Wave Digital runs digital marketing from Port Vila for businesses across Vanuatu and the wider Pacific. For local-facing businesses — retailers, restaurants, service companies — that usually means disciplined social media marketing: a consistent presence, content people actually want to see, and targeted advertising that reaches customers in Port Vila and beyond without wasting spend. For tourism and export businesses, it means online advertising and content aimed at overseas audiences, timed to the seasons when they plan and book.',
      'We do not sell vanity metrics. Likes are nice; enquiries, bookings, and sales pay wages. Every campaign we run is tied to something you can count, reported plainly each month, and adjusted based on what the numbers say. If a channel is not working for your business, we will tell you and move the budget somewhere that does.',
    ],
    benefitsHeading: 'Digital marketing that fits the Pacific',
    benefitsIntro:
      'Strategy grounded in how your customers — local and overseas — actually behave online.',
    benefits: [
      {
        icon: '💬',
        title: 'Social media, done properly',
        description:
          'Facebook and Instagram presence managed consistently: content calendars, community responses, and pages that make your business look as good online as it is in person.',
      },
      {
        icon: '🎯',
        title: 'Targeted online advertising',
        description:
          'Paid campaigns aimed at exactly the audience you need — households in Port Vila, travellers in Sydney planning a Pacific holiday, or both.',
      },
      {
        icon: '🗓️',
        title: 'Seasonal campaign planning',
        description:
          'Tourism booking windows, holiday trading peaks, back-to-school — campaigns planned around the calendar that actually drives your revenue.',
      },
      {
        icon: '✍️',
        title: 'Content that earns attention',
        description:
          'Photography, video, and writing that show real people and real places — not stock-photo sameness your customers scroll straight past.',
      },
      {
        icon: '📧',
        title: 'Email that keeps customers',
        description:
          'Newsletters and automated follow-ups that turn one-time buyers and past guests into repeat business — often the cheapest revenue you will ever earn.',
      },
      {
        icon: '📊',
        title: 'Plain-language reporting',
        description:
          'A monthly report that says what we spent, what it produced, and what we are changing — in language you do not need a marketing degree to read.',
      },
    ],
    processIntro:
      'No lock-in retainers before we have proven anything — we start focused and scale what works.',
    process: [
      {
        step: '01',
        title: 'Audit & strategy',
        description:
          'We review your current presence, your competitors, and your customers, then agree on realistic goals and the channels most likely to reach them.',
      },
      {
        step: '02',
        title: 'Set the foundations',
        description:
          'Profiles polished, tracking installed, and content prepared — so we can measure everything from day one.',
      },
      {
        step: '03',
        title: 'Launch campaigns',
        description:
          'Content and advertising go live in a focused first push, sized to your budget and aimed at your best audience.',
      },
      {
        step: '04',
        title: 'Measure & scale',
        description:
          'Monthly reporting on real outcomes — enquiries, bookings, sales — and budget shifted toward what the data proves is working.',
      },
    ],
    faqs: [
      {
        question: 'Which social media platforms should my Vanuatu business be on?',
        answer:
          'For most local businesses, Facebook is where the audience is, with Instagram close behind for visual businesses like food, fashion, and tourism. Tourism operators targeting Australia and New Zealand often add Google advertising and TripAdvisor presence. We recommend the shortlist that fits your customers rather than spreading you thin across every platform.',
      },
      {
        question: 'How much should I budget for online advertising?',
        answer:
          'Less than you might fear — online advertising is one of the few channels where you can start small, measure results, and scale only what works. We will recommend a starting budget based on your goals and market, and you can adjust it month to month.',
      },
      {
        question: 'Can you market my tourism business to Australia and New Zealand?',
        answer:
          'Yes — that is one of our most common briefs. We build campaigns that reach travellers while they are researching and planning, with content that answers their questions and advertising timed to booking seasons.',
      },
      {
        question: 'How will I know whether the marketing is working?',
        answer:
          'You will see it in numbers you care about: enquiries, bookings, foot traffic, and sales — reported monthly alongside spend. We set up tracking at the start precisely so results are measured, not guessed.',
      },
    ],
    furtherReading: {
      label: 'Digital marketing strategies for Pacific SMEs — on the blog',
      href: '/blog/digital-marketing-strategies-pacific-smes',
    },
    cardDescription:
      'Social media marketing and online advertising from Port Vila — measured in enquiries and sales, not likes.',
  },
  {
    slug: 'seo',
    label: 'SEO Services',
    h1: 'SEO Services in Vanuatu & the Pacific Islands',
    metaDescription:
      'SEO services in Vanuatu and the Pacific Islands. Local SEO for Pacific businesses: rank on Google, win the map pack, and reach customers before competitors do.',
    keywords: [
      'SEO services Vanuatu',
      'SEO Pacific Islands',
      'local SEO Pacific businesses',
      'search engine optimization Vanuatu',
      'Google ranking Port Vila',
    ],
    serviceType: 'Search Engine Optimization',
    heroBadge: 'SEO Services',
    heroSubtitle:
      'Local SEO for Pacific businesses — practical search engine optimisation that puts you in front of customers in Vanuatu and travellers overseas at the moment they search.',
    gradient: 'from-orange-500 to-red-500',
    icon: '🔍',
    intro: [
      'When someone searches "accountant Port Vila", "Vanuatu tours", or "hardware store near me", Google decides who gets that customer. SEO — search engine optimisation — is the work of making sure it is you. In smaller Pacific markets this is a genuine opportunity: many local businesses have weak or non-existent search presence, so a business that does SEO properly can own its category in a way that is nearly impossible in Sydney or Auckland.',
      'Local SEO for Pacific businesses has two distinct battlegrounds. The first is local: your Google Business Profile, the map results, reviews, and the searches people in Vanuatu make every day. The second, for tourism and export businesses, is international: the traveller in Brisbane searching "things to do in Port Vila", or the overseas buyer looking for Pacific suppliers. Each needs its own strategy, and we build both from Port Vila — with first-hand knowledge of the market being searched for.',
      'Our SEO services are deliberately unglamorous: getting the technical foundations of your site right so Google can read it, writing pages that genuinely answer what your customers search for, building out your Google Business Profile, and earning credible links and reviews. No tricks, no "guaranteed #1" promises — just the steady, compounding work that moves rankings and keeps them.',
    ],
    benefitsHeading: 'What our SEO work covers',
    benefitsIntro:
      'A complete approach — technical, content, and local — because rankings come from all three.',
    benefits: [
      {
        icon: '🧱',
        title: 'Technical foundations',
        description:
          'Site speed, mobile performance, indexing, sitemaps, and structured data — the plumbing Google requires before it will rank anyone.',
      },
      {
        icon: '📍',
        title: 'Local SEO & Google Business Profile',
        description:
          'Your profile built out, categories and photos optimised, and a review strategy — so you show up in the map results local customers actually click.',
      },
      {
        icon: '📝',
        title: 'Content that answers searches',
        description:
          'Service pages and articles written around what your customers really type into Google — in Vanuatu and in your overseas markets.',
      },
      {
        icon: '🌐',
        title: 'International visibility for tourism',
        description:
          'Targeting the searches travellers make while planning a Pacific trip, so your business is on the shortlist before they ever land in Vila.',
      },
      {
        icon: '🔗',
        title: 'Credible links & citations',
        description:
          'Listings and links from directories, industry sites, and partners that tell Google your business is real and established.',
      },
      {
        icon: '📈',
        title: 'Honest measurement',
        description:
          'Rankings, traffic, and — most importantly — enquiries from search, reported monthly so you can see the compounding return.',
      },
    ],
    processIntro:
      'SEO is a campaign, not a switch. Here is how we run it.',
    process: [
      {
        step: '01',
        title: 'Audit & keyword research',
        description:
          'We find out exactly what your customers search for, where you currently rank, and what is holding your site back.',
      },
      {
        step: '02',
        title: 'Fix the technical base',
        description:
          'Speed, mobile experience, indexing, and structured data corrected first — quick wins that everything else builds on.',
      },
      {
        step: '03',
        title: 'Build content & local presence',
        description:
          'Pages targeting your commercial keywords, plus a fully optimised Google Business Profile and review pipeline.',
      },
      {
        step: '04',
        title: 'Earn authority & report',
        description:
          'Ongoing links, citations, and content — with monthly reporting on rankings, traffic, and the enquiries search now sends you.',
      },
    ],
    faqs: [
      {
        question: 'How long does SEO take to show results in Vanuatu?',
        answer:
          'Expect early movement within a few months and meaningful results over six to twelve — SEO compounds rather than spikes. The encouraging news is that competition in many Pacific niches is light, so well-executed work often moves rankings faster here than it would in a large overseas market.',
      },
      {
        question: 'Can you guarantee a #1 ranking on Google?',
        answer:
          'No — and you should be wary of anyone who says they can, because Google’s results are not for sale that way. What we can guarantee is honest, proven work: technical fixes, genuinely useful content, and local signals, with transparent monthly reporting on exactly where you stand.',
      },
      {
        question: 'Is SEO worth it for a small local business?',
        answer:
          'Often it is the single best-value marketing a small business can do, because a good ranking keeps sending customers month after month without ongoing ad spend. A strong Google Business Profile alone can transform how often local customers find and call you.',
      },
      {
        question: 'Can you help my tourism business rank for overseas searches?',
        answer:
          'Yes. We target the searches travellers make while planning — destination questions, activity searches, comparison queries — so your site is part of their research long before they arrive in Vanuatu.',
      },
    ],
    cardDescription:
      'Local SEO for Pacific businesses — own the searches your customers make, in Vanuatu and overseas.',
  },
  {
    slug: 'ecommerce',
    label: 'E-commerce',
    h1: 'E-commerce Website Development in Vanuatu',
    metaDescription:
      'E-commerce website development in Vanuatu. Online stores built in Port Vila with payment options that work locally — sell to Vanuatu, the Pacific, and the world.',
    keywords: [
      'ecommerce website Vanuatu',
      'online store Vanuatu',
      'payments in Vanuatu',
      'e-commerce development Pacific Islands',
      'sell online Vanuatu',
    ],
    serviceType: 'E-commerce Development',
    heroBadge: 'E-commerce',
    heroSubtitle:
      'Online stores built in Port Vila — with payment and delivery options designed around how commerce actually works in Vanuatu, not how it works in Silicon Valley.',
    gradient: 'from-purple-500 to-pink-500',
    icon: '🛒',
    intro: [
      'Selling online from Vanuatu is absolutely possible — but it has to be designed for Vanuatu. The standard e-commerce playbook assumes every customer has a credit card, every address is deliverable by a courier API, and any payment gateway is a five-minute signup. None of that holds neatly here, which is why so many "off the shelf" store setups stall at the checkout. Building an online store that actually takes money requires local knowledge.',
      'Pacific Wave Digital builds e-commerce websites from Port Vila with the payments question answered first, not last. Depending on your business and your customers, that can mean card payments through a gateway that supports Vanuatu merchants, direct bank transfer with automated order confirmation, mobile-friendly ordering with payment on pickup or delivery, or a combination — international cards for overseas customers, practical local options for customers at home. We map the options with you honestly before a single page is designed.',
      'The opportunity runs both ways. An online store lets a Port Vila retailer serve customers across Efate and the outer islands without opening branches, and it lets exporters — kava, coffee, cocoa, handicrafts — sell directly to overseas buyers instead of waiting for them to visit. Add the tourism angle, where guests want to book and pay for activities before they arrive, and e-commerce becomes one of the highest-leverage investments a Vanuatu business can make.',
    ],
    benefitsHeading: 'E-commerce built for Pacific realities',
    benefitsIntro:
      'Every store we build answers the hard local questions — payments, delivery, and trust — up front.',
    benefits: [
      {
        icon: '💳',
        title: 'Payments that actually work here',
        description:
          'We design your checkout around options genuinely available to Vanuatu merchants and customers — cards, bank transfer, pay-on-pickup — instead of assuming a gateway that is not offered here.',
      },
      {
        icon: '🌍',
        title: 'Sell locally and overseas',
        description:
          'One store can serve customers in Port Vila and buyers in Australia — with currencies, shipping, and payment options that adjust to each.',
      },
      {
        icon: '🚚',
        title: 'Delivery your way',
        description:
          'Pickup in store, local delivery zones, inter-island shipping, or international freight — the checkout reflects how you really fulfil orders.',
      },
      {
        icon: '📦',
        title: 'Stock and orders in one place',
        description:
          'Inventory tracking, order management, and automatic customer notifications — no more reconciling sales from three notebooks.',
      },
      {
        icon: '📱',
        title: 'Checkout built for mobile',
        description:
          'Most of your local customers will shop on a phone over mobile data, so the entire buying journey is designed for small screens and light pages.',
      },
      {
        icon: '🛡️',
        title: 'Trust signals that convert',
        description:
          'Clear pricing, secure checkout, honest delivery times, and simple policies — the details that make a first-time customer comfortable paying online.',
      },
    ],
    processIntro:
      'We answer the risky questions first, so you never end up with a beautiful store that cannot take payment.',
    process: [
      {
        step: '01',
        title: 'Payments & logistics first',
        description:
          'Before design, we confirm exactly how you will take money and deliver orders — locally, inter-island, and internationally.',
      },
      {
        step: '02',
        title: 'Store design & catalogue',
        description:
          'A storefront designed for your brand and products, and your catalogue structured so customers find things fast.',
      },
      {
        step: '03',
        title: 'Build & test real orders',
        description:
          'We build the store and run genuine end-to-end test orders — payment, notification, fulfilment — before launch.',
      },
      {
        step: '04',
        title: 'Launch & grow',
        description:
          'Go live with training for your team, then grow with marketing, SEO, and features guided by real sales data.',
      },
    ],
    faqs: [
      {
        question: 'How can customers pay online in Vanuatu?',
        answer:
          'It depends on your bank, your customers, and where they are. Options typically include card payments via gateways available to Vanuatu merchants, direct bank transfer with automated confirmation, and payment on pickup or delivery for local orders. We map what is genuinely available for your situation during scoping — before the store is designed around it.',
      },
      {
        question: 'Can I sell to customers in Australia and New Zealand?',
        answer:
          'Yes. We build stores that take international card payments from overseas buyers and handle international shipping options — a common setup for exporters of kava, coffee, and handicrafts, and for tourism operators selling bookings ahead of travel.',
      },
      {
        question: 'What about delivery to the outer islands?',
        answer:
          'We design the checkout around your real fulfilment options — pickup points, local delivery zones around Port Vila, and inter-island shipping where you offer it, each with its own pricing and timeframes so customers know exactly what to expect.',
      },
      {
        question: 'Do I need a big product range to justify an online store?',
        answer:
          'No. Some of the most effective stores sell a handful of products or bookable services. What matters is demand and a checkout that works — a single-product export store or a tour-booking page can pay for itself quickly.',
      },
    ],
    furtherReading: {
      label: 'Building a successful e-commerce website in the Pacific Islands — on the blog',
      href: '/blog/building-a-successful-ecommerce-website-in-the-pacific-islands-a-guide-for-local-businesses-1784412043051',
    },
    cardDescription:
      'Online stores with payments and delivery designed for Vanuatu — sell locally, inter-island, and overseas.',
  },
  {
    slug: 'mobile-apps',
    label: 'Mobile Apps',
    h1: 'Mobile App Development in Vanuatu & the Pacific',
    metaDescription:
      'Mobile app development in Vanuatu and the Pacific. Android and iOS apps built in Port Vila — offline-capable, data-light, and designed for Pacific Island users.',
    keywords: [
      'mobile app development Vanuatu',
      'Android apps Pacific Islands',
      'iOS app development Vanuatu',
      'app developers Port Vila',
      'mobile apps Pacific',
    ],
    serviceType: 'Mobile App Development',
    heroBadge: 'Mobile Apps',
    heroSubtitle:
      'Android and iOS apps built in Port Vila for the Pacific — data-light, offline-capable, and designed for the phones your customers actually carry.',
    gradient: 'from-purple-500 to-pink-500',
    icon: '📱',
    intro: [
      'In Vanuatu and across the Pacific Islands, the phone is the computer. Most people’s entire digital life — banking, news, business, family — runs through a mobile device, frequently an affordable Android handset on prepaid data. A mobile app that understands that context can reach customers in a way nothing else matches; one that ignores it gets uninstalled the first time it burns through someone’s data bundle.',
      'Pacific Wave Digital develops Android and iOS apps from Port Vila using cross-platform technology, so one codebase serves both app stores — which roughly halves the cost and the ongoing maintenance compared with building each separately. We engineer for Pacific conditions as a matter of course: small download sizes, minimal data use, graceful behaviour when the connection drops, and offline-first design where the app keeps working on a boat between islands and syncs when coverage returns.',
      'The use cases keep growing: customer-facing apps for ordering, bookings, and loyalty; field apps for staff doing inspections, deliveries, or data collection away from the office; and internal tools for organisations whose teams work across islands. If your business or organisation needs to put a capability in people’s pockets — customers’ or staff’s — an app built for Pacific realities is how you do it.',
    ],
    benefitsHeading: 'Apps engineered for the Pacific',
    benefitsIntro:
      'Every technical decision serves users on real Pacific networks and real Pacific phones.',
    benefits: [
      {
        icon: '🤖',
        title: 'Android and iOS from one codebase',
        description:
          'Cross-platform development delivers both apps for far less than building twice — and every future update ships to both stores at once.',
      },
      {
        icon: '📴',
        title: 'Offline-first design',
        description:
          'The app keeps working without a connection and syncs automatically when coverage returns — essential for outer-island and at-sea use.',
      },
      {
        icon: '🪶',
        title: 'Light on data and storage',
        description:
          'Small downloads and frugal data use, because your users are on prepaid bundles and modest handsets — and they notice.',
      },
      {
        icon: '🔔',
        title: 'Direct line to customers',
        description:
          'Push notifications for offers, updates, and reminders — reaching customers without paying for ads or fighting a social feed algorithm.',
      },
      {
        icon: '🧰',
        title: 'Field tools for distributed teams',
        description:
          'Inspections, deliveries, surveys, and data collection captured on a phone in the field — even offline — instead of on paper forms.',
      },
      {
        icon: '🚀',
        title: 'App store launch handled',
        description:
          'We manage the Google Play and Apple App Store submission process end to end — accounts, requirements, review, and release.',
      },
    ],
    processIntro:
      'From idea to the app stores — with a working app in your hands early, not just mockups.',
    process: [
      {
        step: '01',
        title: 'Define the app',
        description:
          'We work out what the app must do, who will use it, and on what devices and connections — and trim it to a focused first version.',
      },
      {
        step: '02',
        title: 'Design the experience',
        description:
          'Screen designs you can tap through and react to before development begins.',
      },
      {
        step: '03',
        title: 'Build & test on real devices',
        description:
          'Development in short cycles, tested on real phones — including modest Android handsets and throttled connections, not just the latest iPhone.',
      },
      {
        step: '04',
        title: 'Launch on both stores',
        description:
          'We handle Google Play and App Store submission, then support the app with updates as your needs and the platforms evolve.',
      },
    ],
    faqs: [
      {
        question: 'Should I build for Android, iOS, or both?',
        answer:
          'In the Pacific, Android handsets are what most local customers carry, while iOS matters more for tourists and some professional audiences. Because we build cross-platform, you usually get both from one codebase for close to the cost of one — so the real question is which to prioritise for launch, and we help you answer it with your actual audience in mind.',
      },
      {
        question: 'Will the app work without an internet connection?',
        answer:
          'If your use case needs it, yes — we design offline-first apps that store work locally and sync when a connection is available. For field teams and outer-island users, this is usually the single most important requirement.',
      },
      {
        question: 'Does my business actually need an app, or is a website enough?',
        answer:
          'Honest answer: sometimes a mobile-friendly website is the right call, and we will tell you so. An app earns its place when you need offline capability, push notifications, device features like GPS and camera, or a tool your customers or staff will use repeatedly.',
      },
      {
        question: 'Who publishes the app, and who owns it?',
        answer:
          'You do, on both counts. We set up or use your Google Play and Apple developer accounts so the app is published under your business name, and you own the code and the accounts outright.',
      },
    ],
    cardDescription:
      'Android and iOS apps from one codebase — offline-capable, data-light, and built for Pacific users.',
  },
];

export function getServicePage(slug: string): ServicePageData | undefined {
  return servicePages.find((service) => service.slug === slug);
}
