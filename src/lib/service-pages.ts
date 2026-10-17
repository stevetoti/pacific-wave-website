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
  {
  "slug": "ai-automation",
  "label": "AI & Automation",
  "h1": "AI Automation in Vanuatu & the Pacific",
  "metaDescription": "AI chatbots, business assistants and workflow automation from Port Vila. Practical AI solutions for Vanuatu and Pacific businesses, with training and human oversight.",
  "keywords": [
    "AI automation Vanuatu",
    "AI chatbot Vanuatu",
    "business automation Vanuatu",
    "AI solutions Pacific Islands"
  ],
  "serviceType": "AI and Business Automation",
  "heroBadge": "AI & Business Automation",
  "heroSubtitle": "Connect customer enquiries, business information and everyday tasks with AI and workflow automation built around how your team works in Vanuatu and the Pacific.",
  "gradient": "from-orange-500 to-red-500",
  "icon": "🤖",
  "intro": [
    "An enquiry arrives on your website, a customer follows up on WhatsApp, and the same details are entered into a spreadsheet again. AI automation is useful when it removes that repeated work while keeping your team in control. Pacific Wave Digital builds AI chatbots, business assistants and connected workflows from Port Vila for Vanuatu and Pacific organisations.",
    "We start with a specific task: answering questions from approved business information, collecting an enquiry, routing a request to the right person, or preparing a routine report. Some tasks need AI to understand language; others need a straightforward integration. We help you choose an approach that fits the task rather than adding AI to every step.",
    "Before building, we agree what information the system may use, who can access it, and which actions need a person to approve them. We also scope connectivity, language, provider charges and maintenance. A working pilot lets your staff check the results before a wider rollout."
  ],
  "benefitsHeading": "Automation that serves your team",
  "benefitsIntro": "Start with a clear workflow and a measurable outcome, then expand once it works reliably.",
  "benefits": [
    {
      "icon": "💬",
      "title": "Customer enquiry assistants",
      "description": "Website or messaging assistants answer from your approved service information and hand enquiries to a person when needed."
    },
    {
      "icon": "🔗",
      "title": "Connected business workflows",
      "description": "Link forms, customer records, email and reporting tools to reduce duplicate entry. Integration depends on the access each provider supports."
    },
    {
      "icon": "📄",
      "title": "Document and report support",
      "description": "Help staff organise information and draft routine summaries, with review before important decisions or publication."
    },
    {
      "icon": "🛡️",
      "title": "Human oversight",
      "description": "Define approval steps, access permissions and escalation paths before the system handles live business tasks."
    },
    {
      "icon": "📶",
      "title": "Designed for your operating conditions",
      "description": "Assess device and connectivity needs during scoping. Cloud AI generally needs internet access; fallback workflows are planned where needed."
    },
    {
      "icon": "🎓",
      "title": "Training and handover",
      "description": "Staff learn how to use, check and maintain the workflow, including its limits and when to take over."
    }
  ],
  "processIntro": "A focused pilot helps establish value and limits before a larger investment.",
  "process": [
    {
      "step": "01",
      "title": "Choose a workflow",
      "description": "Map the task, the people involved and the cost of the current process. Agree the outcome and a practical first scope."
    },
    {
      "step": "02",
      "title": "Review tools and information",
      "description": "Confirm integrations, data access, privacy requirements, connectivity and provider costs before development."
    },
    {
      "step": "03",
      "title": "Build and test a pilot",
      "description": "Try representative enquiries and exceptions with your staff. Check accuracy, escalation and access before launch."
    },
    {
      "step": "04",
      "title": "Launch and improve",
      "description": "Train the team, document the workflow and review results against the agreed outcome. Scope ongoing support separately."
    }
  ],
  "faqs": [
    {
      "question": "Can you build an AI chatbot for my Vanuatu business?",
      "answer": "Yes. We can scope a website or messaging assistant around your approved business information and enquiry process. Channels, integrations and ongoing provider costs are agreed before development."
    },
    {
      "question": "Do all business automations need AI?",
      "answer": "No. Moving information between systems, sending reminders and generating standard reports often works best with ordinary workflow rules. AI is considered where understanding language or working with varied content adds value."
    },
    {
      "question": "Will an AI assistant work when the internet is down?",
      "answer": "Most cloud AI services need internet access. We assess connectivity during scoping and agree what users should see or do when a connection or provider is unavailable."
    },
    {
      "question": "Can you support businesses outside Vanuatu?",
      "answer": "We can scope projects remotely for Pacific businesses, with delivery, language, time zones and support arrangements agreed for each project. Our base is Port Vila; remote delivery does not imply a local office in another country."
    }
  ],
  "furtherReading": {
    "label": "AI business automation for Pacific Island enterprises",
    "href": "/blog/ai-business-automation-pacific-islands-2026"
  },
  "cardDescription": "AI chatbots, assistants and connected workflows from Port Vila, with human oversight and staff training."
},
  {
  "slug": "cloud-hosting",
  "label": "Hosting & Maintenance",
  "h1": "Website Hosting in Vanuatu & the Pacific",
  "metaDescription": "Managed website hosting, cloud setup, backups and maintenance from Port Vila. Practical hosting support for businesses in Vanuatu and the Pacific Islands.",
  "keywords": [
    "website hosting Vanuatu",
    "website maintenance Vanuatu",
    "managed hosting Pacific Islands",
    "cloud hosting Vanuatu"
  ],
  "serviceType": "Website Hosting and Maintenance",
  "heroBadge": "Hosting & Website Maintenance",
  "heroSubtitle": "Keep your website and business applications maintained with hosting, backups and support scoped around your users, budget and Pacific connectivity.",
  "gradient": "from-cyan-500 to-blue-500",
  "icon": "☁️",
  "intro": [
    "Your website needs attention after launch: domain renewals, updates, backups, security configuration and someone to help when a service fails. Pacific Wave Digital offers website hosting and maintenance from Port Vila for businesses in Vanuatu and the Pacific. We assess the site you have before recommending a hosting or support arrangement.",
    "A business website, an online shop and a custom application have different requirements. We review the technology, traffic, stored information and external services, then agree which parts we manage and which remain with your existing providers. Performance work considers visitors on mobile connections as well as overseas customers.",
    "For a move from an existing host, we plan content, database, email and DNS dependencies before switching. We also review redirects and search URLs so a hosting change does not unnecessarily break customer links. Backup frequency, restore arrangements, monitoring and support hours are specified in the agreed scope."
  ],
  "benefitsHeading": "A clear plan for keeping your site running",
  "benefitsIntro": "Hosting and maintenance should have defined responsibilities, recovery steps and costs.",
  "benefits": [
    {
      "icon": "☁️",
      "title": "Hosting matched to your website",
      "description": "Choose infrastructure around the application, audience and budget, including delivery networks where appropriate."
    },
    {
      "icon": "🔐",
      "title": "Updates and security configuration",
      "description": "Review certificates, supported software and access arrangements. Agree which updates and checks are included in maintenance."
    },
    {
      "icon": "💾",
      "title": "Backups and recovery planning",
      "description": "Define what is backed up, how often it is kept and how a restore will be tested. Include external services where the scope requires them."
    },
    {
      "icon": "⚡",
      "title": "Mobile performance",
      "description": "Review image weight, page delivery and caching so the website is more usable on slower connections."
    },
    {
      "icon": "🧭",
      "title": "Planned migrations",
      "description": "Map domain, DNS, email and database dependencies before moving a live site, with verification and rollback steps."
    },
    {
      "icon": "🤝",
      "title": "Support with clear boundaries",
      "description": "Agree support hours, responsibilities and escalation paths. Hosting-provider availability and support terms remain part of the plan."
    }
  ],
  "processIntro": "We establish the current setup and a recovery plan before changing a live service.",
  "process": [
    {
      "step": "01",
      "title": "Review the current setup",
      "description": "Check the website stack, domain, hosting, backups, traffic and any connected services."
    },
    {
      "step": "02",
      "title": "Agree the support scope",
      "description": "Confirm included maintenance, provider costs, access, support hours and recovery requirements."
    },
    {
      "step": "03",
      "title": "Set up or migrate carefully",
      "description": "Prepare backups, test the target setup and verify key pages and integrations before switching traffic."
    },
    {
      "step": "04",
      "title": "Maintain and review",
      "description": "Carry out agreed checks and updates, review recovery arrangements and adjust the plan when the site changes."
    }
  ],
  "faqs": [
    {
      "question": "Can you maintain a website built by another developer?",
      "answer": "We can assess an existing site and confirm whether its technology, source access and hosting can be supported. The assessment identifies any required repairs before an ongoing maintenance arrangement."
    },
    {
      "question": "Will changing hosting affect my email?",
      "answer": "It can if DNS or email settings are changed incorrectly. We review how your email is provided and include the required preservation or migration steps in the plan."
    },
    {
      "question": "Is hosting the same as website maintenance?",
      "answer": "No. Hosting provides the infrastructure serving the site. Maintenance covers agreed work such as software updates, checks and repairs. Your proposal should state clearly which services are included."
    },
    {
      "question": "Do you guarantee uninterrupted service?",
      "answer": "No provider can promise that every website, connection and external service will always be available. We agree suitable hosting, monitoring, backups and response arrangements for your requirements."
    }
  ],
  "cardDescription": "Managed hosting, website maintenance, backups and cloud setup with clearly agreed support and recovery arrangements."
},
{
  "slug": "online-payment-integration",
  "label": "Payment Integration",
  "h1": "Online Payment Integration in Vanuatu",
  "metaDescription": "Connect online checkout and mobile-wallet payment workflows for your Vanuatu business. Explore Stripe, MyCash, M-Vatu and PayPal with PWD. Contact us to assess your options.",
  "keywords": [
    "online payment integration Vanuatu",
    "payment gateway Vanuatu",
    "MyCash website integration",
    "M-Vatu payments Vanuatu",
    "Stripe integration Vanuatu",
    "PayPal integration Vanuatu",
    "online checkout Port Vila"
  ],
  "serviceType": "Online Payment Integration",
  "heroBadge": "Get paid online",
  "heroSubtitle": "Make it easier for customers to pay for orders, bookings and services. We connect your website or app with suitable card, wallet and mobile-money payment options. Contact us to find the right setup for your business.",
  "gradient": "from-teal-500 to-blue-600",
  "icon": "💳",
  "intro": [
    "Pacific Wave Digital builds online payment experiences for businesses in Vanuatu and the Pacific. Whether you run a shop in Port Vila, take resort deposits, sell tours or offer online services, we can connect the customer checkout with the order and payment workflow behind it.",
    "We work with Stripe, MyCash, M-Vatu and PayPal integration options according to your merchant eligibility and the facilities each provider makes available. This can include hosted checkout, payment links, local merchant QR instructions and order reconciliation. An automated gateway and a payment that staff confirm manually are different workflows; we agree which one your business will receive.",
    "Tell us where your business is registered, which bank or merchant accounts you use, what you sell and where your customers are based. We assess payment acceptance, settlement, currency and provider approval before proposing an implementation. You receive a clear scope for the website work and any account setup still required."
  ],
  "benefitsHeading": "A payment flow that fits your business",
  "benefitsIntro": "From the first checkout screen to confirmation and reconciliation, each step should be clear to customers and your team.",
  "benefits": [
    {
      "icon": "🛒",
      "title": "Website and app checkout",
      "description": "Connect payment collection to stores, bookings, invoices or custom applications, with clear order references and next steps."
    },
    {
      "icon": "📱",
      "title": "Local mobile-money workflows",
      "description": "Help customers follow approved MyCash or M-Vatu merchant payment steps, with QR or payment instructions and a confirmation process agreed for your setup."
    },
    {
      "icon": "🌍",
      "title": "International card and wallet options",
      "description": "Integrate Stripe or PayPal for eligible merchant accounts. We check account country, receiving capability, currency and settlement before choosing the flow."
    },
    {
      "icon": "✅",
      "title": "Reliable payment confirmation",
      "description": "Use verified provider notifications where available. Otherwise keep the order pending until staff check the payment; a browser redirect or uploaded receipt alone does not prove settlement."
    },
    {
      "icon": "🔐",
      "title": "Provider-hosted payment entry",
      "description": "Use supported hosted payment pages or provider components for card entry, alongside protected server credentials and verified callbacks where available."
    },
    {
      "icon": "🧾",
      "title": "Testing and handover",
      "description": "Check successful, failed and cancelled payment paths, confirmation messages and duplicate notifications as applicable, then document the workflow for your team."
    }
  ],
  "processIntro": "We scope the payment route first, then connect and test the experience your customers will use.",
  "process": [
    {
      "step": "01",
      "title": "Discuss your payment needs",
      "description": "Tell us about your website or app, products, customers, business registration and existing merchant accounts."
    },
    {
      "step": "02",
      "title": "Confirm provider eligibility",
      "description": "Review merchant approval, available integration facilities, currencies, settlement and provider charges. Agree any manual confirmation steps."
    },
    {
      "step": "03",
      "title": "Build and test the flow",
      "description": "Implement the approved checkout or payment workflow and verify the relevant success, failure, cancellation and confirmation paths."
    },
    {
      "step": "04",
      "title": "Launch and hand over",
      "description": "Complete the agreed launch checks and show your team how to review payments, reconcile orders and handle support or refund requests."
    }
  ],
  "faqs": [
    {
      "question": "Can you integrate Stripe, MyCash, M-Vatu and PayPal for a Vanuatu business?",
      "answer": "We assess all four options and integrate the suitable, approved payment workflow for your website or app. Availability depends on your merchant account, business registration, provider approval and supported integration facilities. Contact PWD so we can confirm what applies to you."
    },
    {
      "question": "Can a Vanuatu-registered business open a Stripe account directly?",
      "answer": "Vanuatu is not currently listed for direct Stripe merchant onboarding. Stripe integration requires an eligible merchant account in a supported country or region. We assess an existing eligible business and account setup; adding a checkout button does not create eligibility."
    },
    {
      "question": "Can I receive PayPal payments into a Vanuatu bank account?",
      "answer": "PayPal receiving, withdrawal and banking features depend on the account country and provider rules. We verify your eligible business account and settlement route before proposing PayPal checkout. We do not promise direct receiving or withdrawal to every Vanuatu bank account."
    },
    {
      "question": "Are MyCash and M-Vatu payments automatically confirmed?",
      "answer": "Both provide mobile-money services in Vanuatu. The website flow depends on the merchant facilities approved for your account. We can scope merchant QR or payment instructions with order references and staff confirmation; automatic status updates are included only where supported access and provider approval are available."
    },
    {
      "question": "Can you add payments to my existing website?",
      "answer": "Yes. We first review your website platform, checkout, hosting and current provider accounts. We then propose the appropriate integration, confirmation and reconciliation work."
    },
    {
      "question": "How much does payment integration cost?",
      "answer": "Contact us for a quote based on your platform, providers, checkout and confirmation requirements. Provider transaction charges, currency conversion and account fees are separate from PWD implementation work."
    }
  ],
  "furtherReading": {
    "label": "Explore our e-commerce website service",
    "href": "/services/ecommerce"
  },
  "cardDescription": "Online checkout and mobile-money workflows with Stripe, MyCash, M-Vatu and PayPal options, subject to merchant eligibility and provider approval."
},
];

export function getServicePage(slug: string): ServicePageData | undefined {
  return servicePages.find((service) => service.slug === slug);
}
