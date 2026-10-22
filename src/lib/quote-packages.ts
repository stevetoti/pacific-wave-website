// Packages and running costs for the unlisted /quote page.
// Prices and inclusions follow the PWD master quotation (PWD-MQ-2026). Provider costs are
// rounded estimates at about VUV 118 to USD 1 (October 2026). Never name the underlying
// vendors or AI models here: describe what each item is and why it is needed.

export interface QuotePackage {
  id: 'starter' | 'essential' | 'professional' | 'enterprise';
  name: string;
  tagline: string;
  bestFor: string;
  price: number;
  delivery: string;
  includes: string[];
  everythingIn?: string;
  popular?: boolean;
  note?: string;
}

export interface RunningCost {
  item: string;
  purpose: string;
  when: string;
  cost: string;
}

export const quoteCurrency = 'VUV';

export const quotePackages: QuotePackage[] = [
  {
    id: 'starter',
    name: 'Starter Special',
    tagline: 'Small businesses, startups & community groups',
    bestFor: 'Organisations just getting started online',
    price: 350000,
    delivery: '2 – 3 weeks',
    includes: [
      'Professional template-based website, up to 5 pages',
      'Mobile-friendly design',
      'Contact form & WhatsApp button',
      'Basic SEO setup',
      'SSL security, hosting & domain setup',
      '1 revision round',
      '14 days post-launch support',
    ],
    note: 'Available on request, subject to eligibility.',
  },
  {
    id: 'essential',
    name: 'Essential',
    tagline: 'Digital Presence',
    bestFor: 'Organisations that need a professional, secure online presence',
    price: 500000,
    delivery: '3 – 4 weeks',
    includes: [
      'Custom-designed website, up to 8 pages',
      'Mobile-responsive, fast-loading build',
      'Easy content management (edit your own pages)',
      'Contact & enquiry forms with email alerts',
      'Keyword research for your main services and location',
      'On-page SEO setup + Google Business Profile',
      'AI chat assistant that answers visitors in any language and passes chats to your team',
      'SSL security, hosting & domain setup',
      'Google Analytics integration',
      '1 staff training session',
      '30 days post-launch support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Digital Growth',
    bestFor: 'Organisations ready to serve clients and take bookings or payments online',
    price: 750000,
    delivery: '5 – 7 weeks',
    popular: true,
    everythingIn: 'Essential',
    includes: [
      'Website up to 15 pages',
      'Online booking, payments, e-commerce OR membership module',
      'AI chat assistant trained on your organisation’s content that books, reschedules and cancels appointments, or sends product links and checks orders',
      'Chat inbox where your team can take over any conversation, with instant alerts',
      'WhatsApp Business integration',
      'One SEO article a week, researched and written for your approval',
      'Email marketing / newsletter setup',
      'Admin dashboard with monthly reporting',
      '2 staff training sessions + user guide',
      '60 days support + 3 months website management',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Digital Transformation',
    bestFor: 'Organisations digitising internal operations end to end',
    price: 1000000,
    delivery: '8 – 10 weeks',
    everythingIn: 'Professional',
    includes: [
      'Custom web system (e.g. staff portal, records, HR, client or case management)',
      'Role-based user access & secure data storage',
      'AI assistant across website + WhatsApp',
      'Two SEO articles a week, researched and written for your approval',
      'Up to 5 automated workflows (approvals, notifications, reports)',
      'Data migration from spreadsheets / existing systems',
      'Management dashboard & analytics',
      '3 training sessions + full manuals',
      '90 days support + 6 months system management',
    ],
  },
];

export const monthlyRetainer = {
  price: 50000,
  includes: [
    'Website security: SSL, malware scanning, firewall and patches',
    'SEO management',
    'Content and booking-system updates',
    'Speed optimisation and uptime monitoring',
    'Monthly performance reports',
  ],
  note: 'Starts after any management period included in your package.',
};

export const runningCosts: RunningCost[] = [
  { item: 'Hosting renewal', purpose: 'Keeps your website online, fast and secure. Included for the first 12 months.', when: 'From year 2', cost: 'About VUV 2,000 – 3,100 a month' },
  { item: 'Domain renewal', purpose: 'Your web address (for example yourname.com).', when: 'Every year', cost: 'About VUV 2,400 a year for a .com' },
  { item: 'Page editor licence', purpose: 'Lets your team edit pages themselves without a developer.', when: 'Every year, if your site uses our visual editor', cost: 'About VUV 7,100 a year' },
  { item: 'SEO toolkit', purpose: 'Scores every page and article against Google’s on-page checks.', when: 'Covered while on the monthly retainer', cost: 'Otherwise about VUV 1,100 a month' },
  { item: 'AI usage', purpose: 'Powers your chat assistant and SEO articles. Billed by use, with a spending limit you control.', when: 'Monthly, by use', cost: 'About VUV 1,200 – 2,400 per 100 chats, plus VUV 30 – 60 per article' },
  { item: 'Email delivery service', purpose: 'Makes sure enquiry alerts and booking confirmations reach inboxes, not spam.', when: 'Monthly', cost: 'Free for most organisations' },
  { item: 'WhatsApp messaging fees', purpose: 'Charged by the messaging network per business conversation.', when: 'By use (Professional and Enterprise)', cost: 'Estimated with you from your expected volume' },
  { item: 'Online payment fees', purpose: 'A small percentage of each online payment, set by your bank or payment provider.', when: 'Per payment', cost: 'Set by your provider' },
  { item: 'Business email (optional)', purpose: 'Mailboxes on your own domain (you@yourname.com).', when: 'Monthly', cost: 'About VUV 850 per mailbox a month' },
  { item: 'System hosting & database', purpose: 'Runs custom web systems, staff portals and secure records.', when: 'Monthly (Enterprise)', cost: 'From about VUV 5,400 a month' },
];

export const quoteTerms: string[] = [
  'All prices are in Vanuatu Vatu (VUV). A USD quotation is available on request.',
  'Formal quotations are valid for 30 days from the date of issue.',
  'Work begins once the quotation is accepted in writing and the 70% deposit is received.',
  'Third-party costs (domain renewals, premium plugins, AI usage, SMS or WhatsApp messaging fees and payment-gateway charges) are not included and are billed at cost or paid directly by the client.',
  'Annual hosting is included for the first 12 months; renewal is quoted separately.',
  'Each package includes two rounds of revisions per milestone. Additional features or pages outside the agreed scope are quoted separately before work proceeds.',
  'On full payment, the client owns its website content, branding, domain and data.',
  'Timelines assume timely provision of content, feedback and approvals by the client.',
];

export function formatVuv(amount: number): string {
  return `VUV ${amount.toLocaleString('en-US')}`;
}
