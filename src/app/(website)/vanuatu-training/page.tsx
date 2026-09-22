import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Globe2,
  Store,
  Compass,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  MapPin,
  Video,
  Play,
  MessageCircle,
  Gift,
} from "lucide-react";

import {
  initialCohort,
  isOpen,
  feeLabel,
  dateLabel,
  monthLabel,
  dayMonth,
} from "@/lib/training/config";
import { getTrainingCohort } from "@/lib/server/training";
import "./training.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Vanuatu AI Business Training | Pacific Wave Digital" },
  description:
    `Build your online business with practical AI training in Vanuatu. Starts ${dayMonth(initialCohort.start)} ${new Date(initialCohort.start).getUTCFullYear()}. In person and online. ${feeLabel(initialCohort)}. Register your interest.`,
  alternates: { canonical: "/vanuatu-training" },
  openGraph: {
    title: "Build Your Online Business in 30 Days",
    description:
      `Vanuatu • ${monthLabel(initialCohort,true)}. Practical AI training, in person and online. Course fee: ${feeLabel(initialCohort)}.`,
    url: "/vanuatu-training",

  },
  twitter: {
    card: "summary_large_image",

  },
};
const builds = [
  "A clear business idea, customer and offer",
  "A website or online store for your business",
  "A booking, order or customer enquiry process",
  "An AI chatbot to answer common questions",
  "A simple system to manage leads and follow up",
  "Launch content and a plan to approach your first customers",
];
const paths = [
  [
    "Choose & build",
    "Choose your customer, validate your idea, create your offer and first website.",
  ],
  [
    "Connect & automate",
    "Set up bookings or orders, customer enquiries, chatbot and follow-up.",
  ],
  [
    "Prepare your launch",
    "Create launch content, promote your offer and practise sales conversations.",
  ],
  [
    "Launch & improve",
    "Test delivery, improve your business and present your launch project.",
  ],
];
export default async function TrainingPage() {
  let c = initialCohort;
  let available = true;
  try {
    c = await getTrainingCohort();
  } catch {
    available = false;
  }
  const open = available && isOpen(c);
  const faqs = [
    [
      "How much does the course cost?",
      `The one-month course fee is ${feeLabel(c)}, including the listed bonuses. This is not a monthly course subscription.`,
    ],
    [
      "Can I join from another island?",
      "Yes. Online attendance is available through Zoom and Google Meet.",
    ],
    [
      "What if I miss a session?",
      "Every session is recorded for enrolled students to replay after training. Replay access does not depend on maintaining a Pro subscription.",
    ],
    [
      "What business can I create?",
      "Examples include digital services, ecommerce, tourism/travel and businesses based on existing skills.",
    ],
    [
      "Do I need an existing business?",
      "No. You can work on a new idea or improve an existing business.",
    ],
    [
      "What equipment should I prepare?",
      "A laptop and reliable internet are recommended for building and practising. Online participants also need audio access. Detailed preparation instructions will follow.",
    ],
    [
      "What happens after the free Pro period?",
      `A paid subscription is required to continue using Digi Assist AI Pro after the ${c.softwareMonths} free months. If payment stops, the platform remains but its tools cannot be used. Renewal arrangements will be explained separately.`,
    ],
    [
      "How do I pay?",
      "Continue to the training centre to create your student account and view available payment options. Bank transfer proof is verified before paid lessons unlock. Confirmed card payments unlock access automatically.",
    ],
    [
      "Will I earn money in the first month?",
      "The course helps you launch and work toward first customers; income is not guaranteed.",
    ],
  ];
  return (
    <div className="training">
      {open && <div className="sticky top-20 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3"><div className="max-w-6xl mx-auto flex items-center justify-between gap-3"><div className="text-sm font-semibold">{monthLabel(c)} training<span className="block text-xs font-normal">{feeLabel(c)} · Online or in person</span></div><Link className="training-button !py-3 !px-5" href="/training-center/account?mode=signup&course=vanuatu-october-2026">Join class <ArrowUpRight size={18}/></Link></div></div>}
      <section className="training-section !pt-10 md:!pt-16 !pb-12">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="training-eyebrow text-[#b73d19] mb-5">
              Vanuatu • {monthLabel(c,true)}
            </div>
            <h1 className="font-extrabold text-[43px] sm:text-6xl xl:text-[66px] leading-[1.05] tracking-[-.045em]">
              Build Your Online Business{" "}
              <span className="text-[#b73d19]">in 30 Days</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Turn your idea into a working business with practical AI training.
              Learn to build your website, set up bookings and customer
              enquiries, create a chatbot, and launch your first offer using
              Digi Assist AI.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold mt-7">
              <span className="flex gap-2">
                <CalendarDays size={18} />
                Starts {dayMonth(c.start)}
              </span>
              <span>Mon, Thu & Sat</span>
              <span className="flex gap-2">
                <Clock3 size={18} />
                {c.timeLabel}
              </span>
              <span>In person + online</span>
            </div>
            <p className="mt-7 text-sm">
              Course fee:{" "}
              <strong className="text-2xl ml-2">{feeLabel(c)}</strong>
            </p>
            <div className="flex flex-col sm:items-start gap-4 mt-6">
              <a href={open ? "/training-center/account?mode=signup&course=vanuatu-october-2026" : "#register"} className="training-button">
                {open
                  ? `Register for the ${monthLabel(c)} Class`
                  : "View registration information"}{" "}
                <ArrowUpRight size={19} />
              </a>
              <a
                href={c.whatsapp}
                className="flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
              >
                <MessageCircle size={18} />
                Ask on WhatsApp
              </a>
            </div>
          </div>
          <div>
            <div className="relative overflow-hidden rounded-[24px] bg-[#e3e8ee] aspect-[4/4.15]">
              <Image
                src="/images/training/hero.webp"
                alt="Illustrative scene of Ni-Vanuatu entrepreneurs collaborating around a laptop"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 550px"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-5 flex items-center gap-4">
                <span className="w-10 h-10 bg-orange-50 text-[#b73d19] rounded-full flex items-center justify-center">
                  <Globe2 size={23} />
                </span>
                <div>
                  <p className="font-bold">Your idea. Your business.</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Practical skills for your next chapter.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 text-right">
              Illustrative campaign image
            </p>
          </div>
        </div>
      </section>
      <div className="bg-[#233C6F] text-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6 py-8">
          {[
            [String(c.dates.length), "practical live sessions"],
            [String(c.hours), "hours of hands-on learning"],
            [`${c.softwareMonths} months`, "Digi Assist AI Pro included"],
            [`${c.mentorshipMonths} month`, "extra mentorship included"],
          ].map(([n, l]) => (
            <div key={l} className="md:border-r border-white/20 last:border-0">
              <p className="text-2xl font-bold">{n}</p>
              <p className="text-sm mt-1 text-blue-100">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="training-section">
        <div className="grid md:grid-cols-[.8fr_1.2fr] gap-10">
          <div>
            <p className="training-eyebrow text-[#b73d19] mb-4">
              Learn by doing
            </p>
            <h2 className="training-title">
              Leave with more
              <br className="hidden md:block" /> than notes.
            </h2>
            <p className="text-slate-600 mt-5 leading-relaxed">
              Work on one business project throughout the course, with practical
              tasks that move it toward launch.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {builds.map((b, i) => (
              <div key={b} className="border-t border-slate-200 pt-5">
                <span className="text-xs font-bold text-[#b73d19]">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-semibold leading-relaxed">{b}.</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="training-section !pt-12 !pb-14">
          <p className="training-eyebrow text-[#b73d19] mb-4">Make it yours</p>
          <h2 className="training-title">Choose your business direction</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              [
                Globe2,
                "Digital services & agencies",
                "Build a service clients can find and book.",
              ],
              [
                Store,
                "Ecommerce & local products",
                "Bring your products to an online store.",
              ],
              [
                Compass,
                "Tourism & travel",
                "Make your experiences easier to discover.",
              ],
              [
                BriefcaseBusiness,
                "Skills & service businesses",
                "Turn what you know into a clear offer.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Globe2;
              return (
                <div
                  key={String(title)}
                  className="p-6 bg-[#F8F9FC] rounded-xl"
                >
                  <I size={28} strokeWidth={1.6} />
                  <h3 className="font-bold mt-5">{String(title)}</h3>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {String(text)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="training-section">
        <p className="training-eyebrow text-[#b73d19] mb-4">
          A practical path to launch
        </p>
        <h2 className="training-title">Your four-week learning path</h2>
        <div className="grid md:grid-cols-4 gap-7 mt-10">
          {paths.map(([title, text], i) => (
            <div key={title} className="border-t-2 border-[#EF5E33] pt-5">
              <p className="text-xs font-bold tracking-widest text-[#b73d19]">
                WEEK {i + 1}
              </p>
              <h3 className="text-xl font-bold mt-3">{title}</h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-sm text-slate-600 space-y-2">
          <p>
            Live teaching: {dayMonth(c.start)}–{dayMonth(c.teachingEnd)}. Your 30-day action period: {dayMonth(c.start)}–{dayMonth(c.actionEnd)}. This is not 30 live teaching days.
          </p>
          <p>
            Results depend on your effort, offer and market. Income is not
            guaranteed.
          </p>
        </div>
      </section>
      <section className="training-section !pt-0">
        <div className="bg-[#233C6F] text-white rounded-[24px] p-7 sm:p-12 grid md:grid-cols-2 gap-10">
          <div>
            <p className="training-eyebrow text-orange-200 mb-5">
              Included with your enrolment
            </p>
            <Gift size={32} className="text-orange-200" />
            <h2 className="text-4xl font-extrabold tracking-tight mt-5">
              {c.softwareMonths} MONTHS FREE
            </h2>
            <p className="text-2xl mt-2 font-semibold">Digi Assist AI Pro</p>
            <p className="mt-4 text-orange-200 font-semibold">
              Valued at US${c.softwareValueUSD}
            </p>
            <p className="text-sm text-blue-100 mt-3">
              Based on the supplied US$297/month list price.
              <br />
              Software bonus included with your paid course.
            </p>
          </div>
          <div className="md:border-l border-white/20 md:pl-10 flex flex-col justify-center gap-6">
            {[
              `${c.dates.length} practical live sessions / ${c.hours} teaching hours`,
              "Recordings of every session to replay after training",
              `${c.mentorshipMonths} additional free month of mentorship`,
            ].map((x) => (
              <p className="flex items-start gap-3" key={x}>
                <Check size={22} className="flex-shrink-0 text-orange-200" />
                {x}
              </p>
            ))}
            <p className="text-sm text-blue-100 leading-relaxed">
              The course fee is {feeLabel(c)}. Continued Pro use after the free
              period requires a paid subscription. Enrolled students’ replay
              access does not depend on maintaining Pro.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="training-section">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="training-eyebrow text-[#b73d19] mb-4">
                One class. Two ways to join.
              </p>
              <h2 className="training-title">
                Attend in person
                <br />
                or online
              </h2>
              <div className="mt-8 space-y-7">
                <div className="flex gap-4">
                  <MapPin className="flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">In person</h3>
                    <p className="text-slate-600 mt-1">{c.venue}.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Video className="flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">Online</h3>
                    <div className="flex gap-4 mt-3 text-sm font-semibold">
                      <span className="flex gap-1.5 items-center">
                        <Video size={20} className="text-blue-600" />
                        Zoom
                      </span>
                      <span className="flex gap-1.5 items-center">
                        <Video size={20} className="text-green-700" />
                        Google Meet
                      </span>
                    </div>
                    <p className="text-slate-600 mt-3">
                      Joining instructions will be provided separately.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Play className="flex-shrink-0" />
                  <p className="text-slate-600">
                    Every session is recorded for enrolled students.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#F8F9FC] rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-bold">Your {monthLabel(c)} calendar</h3>
              <p className="text-sm mt-3">{c.daysLabel}</p>
              <p className="font-semibold text-sm mt-1">{c.timeLabel}</p>
              <ul className="grid grid-cols-3 gap-3 mt-6">
                {c.dates.map((d) => (
                  <li
                    key={d}
                    className="bg-white rounded-lg p-3 text-center border border-slate-200 text-sm font-semibold"
                  >
                    <time dateTime={`${d}T15:00:00+11:00`}>{dateLabel(d)}</time>
                  </li>
                ))}
              </ul>
              <p className="text-xs mt-4 text-slate-500">
                All times are in {c.timezone}, not your device’s local time.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="training-section max-w-4xl">
        <p className="training-eyebrow text-[#b73d19] mb-4">
          Before you register
        </p>
        <h2 className="training-title mb-8">A few useful answers</h2>
        {faqs.map(([q, a]) => (
          <details key={q} className="border-b border-slate-200">
            <summary>{q}</summary>
            <p className="text-slate-600 leading-relaxed pb-6 pr-6">{a}</p>
          </details>
        ))}
      </section>
      <section id="register" className="training-section !pt-6">
        <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-10 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="training-eyebrow text-[#b73d19] mb-4">
              Your next step
            </p>
            <h2 className="training-title">
              Register for the {monthLabel(c)} Vanuatu Class
            </h2>
            <p className="text-slate-600 mt-5 leading-relaxed">
              Create your student account, save your registration and continue to checkout. Your dashboard brings your timetable, class recordings and quizzes together.
            </p>
            <div className="border-y border-slate-200 py-6 my-7">
              <p className="text-sm">One-month course fee</p>
              <p className="text-4xl font-extrabold mt-2">{feeLabel(c)}</p>
              <p className="text-sm text-slate-600 mt-3">
                Includes the listed software bonus and mentorship.
              </p>
            </div>
            <h3 className="font-bold">Questions about this course?</h3>
            <a
              href={c.whatsapp}
              className="flex gap-2 items-center font-semibold mt-4 underline underline-offset-4"
            >
              <MessageCircle size={18} />
              {c.phone}
            </a>
            <a
              href={`mailto:${c.email}`}
              className="block mt-3 underline text-sm break-all"
            >
              {c.email}
            </a>
            <Image
              src="/images/training/pwd-logo.png"
              width={280}
              height={100}
              alt="Pacific Wave Digital"
              className="w-60 h-auto mt-10 mix-blend-multiply"
            />
          </div>
          <div>
            {!available ? (
              <div role="status" className="training-form p-8">
                <h3 className="text-xl font-bold">
                  Registration is temporarily unavailable
                </h3>
                <p className="mt-3">
                  Please try again shortly, or{" "}
                  <a className="underline" href={c.whatsapp}>
                    contact us on WhatsApp
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="training-form p-8"><h3 className="text-2xl font-bold">Your course starts here</h3><p className="my-5 leading-relaxed">Complete one signup form and choose online or in-person training. No email confirmation needed. Pay by card or bank transfer to complete enrollment; bank transfers are reviewed before paid lessons unlock.</p>{open ? <Link className="training-button" href="/training-center/account?mode=signup&course=vanuatu-october-2026">Register & join the class <ArrowUpRight size={18}/></Link> : <p>Registration is closed for this cohort.</p>}<p className="mt-5 text-sm"><Link className="underline" href="/training-center/account">Already registered? Sign in to your student account</Link></p></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
