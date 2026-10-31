import { socialMetadata } from "@/lib/seo/social-metadata";
import { personalOffers } from "@/lib/lms/personal-programs";
import { money } from "@/lib/lms/types";
import "./affiliates.css";
import AffiliateTermsContent from "@/components/lms/AffiliateTermsContent";
import { affiliatePayoutSummary, affiliateTermsUpdated } from "@/lib/lms/affiliate-terms";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Link2, Share2, Wallet, Check, Clock3, Globe2, ShieldCheck, Banknote, CalendarDays, ChevronDown } from "lucide-react";
export const metadata: Metadata = {
  title: { absolute: "Affiliate Programme | Pacific Wave Digital Training" },
  description:
    "Join the Pacific Wave Digital affiliate programme worldwide. Earn 15% on eligible paid course referrals, with monthly payouts from a US$50 equivalent balance.",
  alternates: { canonical: "/affiliates" },
  ...socialMetadata("/affiliates"),
};
const join = "/training-center/account?mode=signup&next=affiliate";
const signIn = "/training-center/account?mode=signin&next=affiliate";
const steps = [
  {
    Icon: Link2,
    image: "/images/affiliates/apply.webp",
    alt: "A man applying online at his laptop in a bright Port Vila office",
    title: "Join for free",
    body: "Create a free account and tell us how you'll share our courses. You're approved instantly, and your links are ready straight away.",
  },
  {
    Icon: Share2,
    image: "/images/affiliates/share.webp",
    alt: "Two friends sharing a link on a phone by the Port Vila waterfront",
    title: "Share your links",
    body: "Get your own link for each course. Share it on WhatsApp, Facebook, in your church, school or community groups.",
  },
  {
    Icon: Wallet,
    image: "/images/affiliates/earn.webp",
    alt: "A small-business owner smiling at a payment notification on her phone",
    title: "Earn 15% commission",
    body: "When someone pays for a course through your link, you earn 15% of what they paid. Payouts are monthly once your approved balance reaches US$50 or its equivalent.",
  },
];
const faqs = [
  ["Which currency can I receive?", "Commission is recorded in the course payment currency. Global Digital Prime Inc., our USA company, pays in USD or a suitable local currency agreed with you. We confirm the conversion rate and amount before transfer."],
  ["What is the minimum payout?", "US$50 or its equivalent in your payout currency, in approved unpaid commissions. Lower balances carry forward."],
  ["Are fees deducted from my commission?", "No. We transfer your full approved commission and cover transfer and currency-conversion fees."],
  ["What verification is needed?", "Before your first payout, we verify your legal name, account email, phone, country, payout currency and receiving-account details. The account must be in your name or your registered business’s name. Additional documents are requested securely only when necessary. Read the affiliate terms."],
  [
    "Do I need to be a student?",
    "No. Anyone can join: community leaders, teachers, business owners, or anyone who knows people who want to learn digital and AI skills.",
  ],
  [
    "How long does my link remember someone?",
    "30 days. If someone opens your link and registers and pays within 30 days, the sale is credited to you.",
  ],
  [
    "When do I get paid?",
    affiliatePayoutSummary,
  ],
  [
    "What if the student gets a refund?",
    "Commission is only earned on payments that stay paid. If a course fee is refunded, the commission for it is cancelled.",
  ],
  [
    "Can I use my own link to buy a course?",
    "No. Purchases made with your own account don't earn commission.",
  ],
];
const earnings = [
  { title: "Build Your Business in 30 Days with AI", category: "LIVE GROUP TRAINING", image: "/images/training/hero.webp", alt: "Illustration of Pacific entrepreneurs learning business and AI skills", fee: "VUV 35,000", earn: "VUV 5,250" },
  ...personalOffers.map(p=>({title:p.title,category:p.teachingWeeks===12?"BOTH PHASES":"ONE-ON-ONE TRAINING",image:p.image,alt:"Illustrative business and technology learning scene",fee:money(p.amount,"VUV"),earn:money(Math.floor(p.amount*0.15),"VUV")})),
];
const payoutFacts = [
  { Icon: CalendarDays, value: "Monthly", label: "One payout cycle each month", detail: "After commission review and payout verification." },
  { Icon: Wallet, value: "US$50", label: "Minimum approved balance", detail: "Or its equivalent. Smaller balances carry forward." },
  { Icon: Globe2, value: "Your currency", label: "USD or an agreed local currency", detail: "Conversion rate and amount confirmed before transfer." },
  { Icon: Banknote, value: "Full commission", label: "No transfer-fee deductions", detail: "We cover transfer and currency-conversion fees." },
];
export default function AffiliatesPage() {
  return (
    <div className="affiliate-page">
      <section className="af-hero">
        <div className="af-shell af-hero-grid">
          <div className="af-hero-copy">
            <p className="af-kicker af-kicker-light"><span /> PACIFIC ROOTS. GLOBAL CONNECTIONS.</p>
            <h1>Connect people.<br />Earn <span>15%.</span></h1>
            <p className="af-hero-lead">Introduce your network to practical business, digital and AI training. Get rewarded when an eligible student joins through your link and pays.</p>
            <div className="af-hero-actions">
              <Link href={join} className="af-button af-button-orange">Become an affiliate <ArrowUpRight size={20} /></Link>
              <Link href={signIn} className="af-signin">Already a member? Sign in <ArrowRight size={16} /></Link>
            </div>
            <div className="af-hero-notes"><span><Check size={16} /> Free to join</span><span><Globe2 size={16} /> Open worldwide</span><span><Clock3 size={16} /> 30-day tracking</span></div>
          </div>
          <div className="af-hero-visual">
            <div className="af-hero-photo"><Image src="/images/affiliates/hero.webp" alt="Illustration of two Pacific entrepreneurs sharing course information in a café" fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" /></div>
            <div className="af-photo-caption"><span className="af-caption-icon"><Link2 size={23} /></span><div><strong>A good connection can open doors.</strong><span>Share training with people who could benefit.</span></div></div>
            <div className="af-photo-label"><Globe2 size={16} /> Across the Pacific & beyond</div>
          </div>
        </div>
      </section>
      <nav className="af-section-nav" aria-label="Affiliate page sections"><div className="af-shell">
        <span className="af-nav-label">AFFILIATE PROGRAMME</span>
        <div>{[["How it works", "how-it-works"], ["Earnings", "earnings"], ["Payouts", "payouts"], ["Terms", "affiliate-terms"], ["FAQs", "affiliate-faqs"]].map(([label, id]) => <a href={`#${id}`} key={id}>{label} <ArrowUpRight size={14} /></a>)}</div>
      </div></nav>
      <section className="af-section" id="how-it-works">
        <div className="af-shell">
          <div className="af-section-heading"><div><p className="af-kicker">A SIMPLE WAY TO START</p><h2>Your network.<br />A new opportunity.</h2></div><p>You don’t need to be a student or a digital expert. Recommend useful training to your community, wherever you are in the world.</p></div>
          <div className="af-steps">{steps.map(({ Icon, image, alt, title, body }, i) => <article key={title}>
            <div className="af-step-photo"><Image src={image} alt={`Illustrative scene: ${alt}`} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover" /><span>0{i + 1}</span></div>
            <div className="af-step-title"><Icon size={20} /><h3>{title}</h3></div><p>{body}</p>
          </article>)}</div>
        </div>
      </section>
      <section className="af-section af-earnings" id="earnings">
        <div className="af-shell">
          <div className="af-section-heading"><div><p className="af-kicker">A CLEAR REWARD FOR YOUR REFERRALS</p><h2>See what you can earn.</h2></div><p>Your standard commission is 15% of what an eligible referred student actually pays. Here’s what that looks like at the full course fee.</p></div>
          <div className="af-earnings-grid">{earnings.map(({ title, category, image, alt, fee, earn }) => <article key={title} className="af-earning-card">
            <div className="af-earning-photo"><Image src={image} alt={alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" /><span>{category}</span></div>
            <div className="af-earning-body"><h3>{title}</h3><div className="af-earning-values"><div><span>Course fee</span><strong>{fee}</strong></div><div><span>Your commission · 15%</span><strong>{earn}</strong></div></div></div>
          </article>)}</div>
          <p className="af-fine-print">Examples reflect full-price enrolments, not guaranteed earnings. Discounts change the commission. Current course fees apply; unpaid or refunded enrolments do not qualify for payout.</p>
        </div>
      </section>
      <section className="af-section af-payouts" id="payouts">
        <div className="af-shell">
          <div className="af-section-heading"><div><p className="af-kicker af-kicker-light">CLEAR TERMS. NO GUESSWORK.</p><h2>Your work deserves<br />a clear payout.</h2></div><p>Paid through Global Digital Prime Inc., our USA company. Our affiliate programme welcomes people worldwide, across the Pacific and beyond.</p></div>
          <div className="af-payout-grid">{payoutFacts.map(({ Icon, value, label, detail }) => <div className="af-payout-fact" key={value}><Icon size={25} /><h3>{value}</h3><strong>{label}</strong><p>{detail}</p></div>)}</div>
          <div className="af-verification"><ShieldCheck size={30} /><div><h3>A simple check before your first payout.</h3><p>Provide your legal name, verified email, phone, country and receiving-account details. The account must be in your or your registered business’s name. Additional documents are requested securely only when necessary.</p></div><a href="#affiliate-terms">Read verification terms <ArrowUpRight size={17} /></a></div>
        </div>
      </section>
      <section className="af-section af-terms-section" id="affiliate-terms">
        <div className="af-shell af-terms-grid">
          <aside className="af-terms-intro"><p className="af-kicker">THE DETAILS, IN PLAIN ENGLISH</p><h2>Affiliate terms<br />and conditions</h2><p>Everything you need to know before you start sharing.</p><span>Updated {affiliateTermsUpdated}</span><div><Link href="/terms#affiliate-programme">Terms of Service <ArrowUpRight size={16} /></Link><Link href="/privacy#affiliate-information">Affiliate privacy notice <ArrowUpRight size={16} /></Link></div></aside>
          <AffiliateTermsContent accordion />
        </div>
      </section>
      <section className="af-section af-faq-section" id="affiliate-faqs">
        <div className="af-shell af-faq-grid"><div><p className="af-kicker">A FEW MORE ANSWERS</p><h2>Good questions.<br />Clear answers.</h2><p>Need a hand? <a href="mailto:steve@pacificwavedigital.com">Talk to our team <ArrowUpRight size={16} /></a></p></div><div className="af-faqs">{faqs.map(([q, a]) => <details key={q}><summary>{q}<ChevronDown size={18} aria-hidden="true" /></summary><p>{a}</p></details>)}</div></div>
      </section>
      <section className="af-final"><div className="af-shell af-final-inner"><div><p className="af-kicker">YOUR NEXT CHAPTER STARTS WITH A LINK</p><h2>Make your connections count.</h2><p>Free to join. Open worldwide. A personal link for every eligible course.</p></div><Link href={join} className="af-button af-button-navy">Join the affiliate programme <ArrowUpRight size={20} /></Link></div></section>
    </div>
  );
}
