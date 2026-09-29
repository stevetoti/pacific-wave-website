import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Link2, Share2, Wallet, Check } from "lucide-react";
export const metadata: Metadata = {
  title: { absolute: "Affiliate Programme | Pacific Wave Digital Training" },
  description:
    "Earn 15% commission by referring people to Pacific Wave Digital courses in Vanuatu and the Pacific. Free to join. You don't need to be a student.",
  alternates: { canonical: "/affiliates" },
};
const join = "/training-center/account?mode=signup&next=affiliate";
const signIn = "/training-center/account?mode=signin&next=affiliate";
const steps = [
  {
    Icon: Link2,
    title: "Apply for free",
    body: "Create a free account and tell us how you'll share our courses. We review applications within 2 working days.",
  },
  {
    Icon: Share2,
    title: "Share your links",
    body: "Get your own link for each course. Share it on WhatsApp, Facebook, in your church, school or community groups.",
  },
  {
    Icon: Wallet,
    title: "Earn 15% commission",
    body: "When someone pays for a course through your link, you earn 15% of what they paid. We pay you by bank transfer or mobile money.",
  },
];
const faqs = [
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
    "Your commission appears in your dashboard as soon as the student's payment is confirmed. After we check it, we pay you by bank transfer or mobile money and mark it paid.",
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
export default function AffiliatesPage() {
  return (
    <main className="bg-white text-slate-800">
      <section className="bg-[#233C6F] px-4 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold tracking-widest text-[#EF5E33]">
            PACIFIC WAVE DIGITAL TRAINING · AFFILIATE PROGRAMME
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Share our courses. Earn 15% on every enrolment.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Help people in Vanuatu and the Pacific learn digital and AI skills,
            and get paid for every student you bring. Free to join. You don&apos;t
            need to be a student.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={join}
              className="inline-flex items-center gap-2 rounded-full bg-[#EF5E33] px-8 py-4 font-semibold text-white transition hover:bg-[#d94d24]"
            >
              Become an affiliate <ArrowRight size={18} />
            </Link>
            <Link href={signIn} className="font-medium text-blue-100 underline-offset-4 hover:underline">
              Already have an account? Sign in to apply
            </Link>
          </div>
        </div>
      </section>
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {steps.map(({ Icon, title, body }, i) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#EF5E33]">
                <Icon size={22} />
              </div>
              <p className="text-sm font-semibold text-[#EF5E33]">Step {i + 1}</p>
              <h2 className="mt-1 text-xl font-bold text-[#233C6F]">{title}</h2>
              <p className="mt-2 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-[#233C6F]">What you can earn</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {[
              ["Build Your Online Business in 30 Days", "VUV 35,000", "VUV 5,250"],
              ["One on One Mentorship Program", "VUV 250,000", "VUV 37,500"],
            ].map(([course, fee, earn]) => (
              <div key={course} className="flex flex-col gap-1 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#233C6F]">{course}</p>
                  <p className="text-sm text-slate-500">Course fee {fee}</p>
                </div>
                <p className="font-bold text-[#EF5E33]">You earn {earn}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            Commission is 15% of the amount the student actually pays, after
            any discount. Current fees are shown on each course page.
          </p>
        </div>
      </section>
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-[#233C6F]">Questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-slate-200 p-5">
                <summary className="cursor-pointer font-semibold text-[#233C6F]">{q}</summary>
                <p className="mt-3 text-slate-600">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-[#233C6F] p-8 text-center text-white">
            <ul className="mx-auto mb-6 grid max-w-md gap-2 text-left text-blue-100">
              {["Free to join", "Your own link for every course", "Track visits, sign-ups and earnings in your dashboard"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check size={18} className="text-[#EF5E33]" /> {t}
                </li>
              ))}
            </ul>
            <Link
              href={join}
              className="inline-flex items-center gap-2 rounded-full bg-[#EF5E33] px-8 py-4 font-semibold text-white transition hover:bg-[#d94d24]"
            >
              Apply now — it&apos;s free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
