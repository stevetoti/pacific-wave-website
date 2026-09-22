import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { money, type Course } from "@/lib/lms/types";
import { programs, mentorshipSlug } from "@/lib/lms/programs";
export default function ProgramDetail({ course }: { course: Course }) {
  const p = programs[course.slug];
  if (!p) return null;
  const mentor = course.slug === mentorshipSlug;
  return (
    <>
      <Link href="/training-center#courses" className="lms-back">
        ← All courses
      </Link>
      <section className="lms-program-hero">
        <div className="lms-program-photo">
          <Image
            src={p.image}
            alt={p.alt}
            fill
            priority
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span className="lms-pill">{p.label}</span>
        </div>
        <div className="lms-program-intro">
          <p className="lms-eyebrow">{p.duration}</p>
          <h1>{course.title}</h1>
          <h2>{p.headline}</h2>
          <p>{course.description}</p>
          <div className="lms-program-price">
            <strong>
              {course.enrollment_open
                ? money(course.amount, course.currency)
                : "Coming soon"}
            </strong>
            <span>
              {course.enrollment_open
                ? mentor
                  ? "Total fee for all 3 months · One-time payment"
                  : "One-time course fee"
                : "Enrolment, dates and pricing will be announced."}
            </span>
          </div>
          {course.enrollment_open ? (
            <Link
              className="lms-button"
              href={`/training-center/account?mode=signup&course=${course.slug}`}
            >
              Enrol now <ArrowRight size={18} />
            </Link>
          ) : (
            <span className="lms-pill">Not yet open for enrolment</span>
          )}
          {mentor && (
            <p className="lms-muted">
              Pay by ANZ or BRED bank transfer, or securely by card with Stripe.
            </p>
          )}
        </div>
      </section>
      <section className="lms-section lms-program-body">
        <div>
          <p className="lms-eyebrow">BUILT AROUND YOUR NEXT STEP</p>
          <h2>Who this is for</h2>
          <p>{p.audience}</p>
          <h2>What you’ll work towards</h2>
          <ul className="lms-outcomes">
            {p.outcomes.map((o) => (
              <li key={o}>
                <CheckCircle2 size={20} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="lms-panel">
          <ShieldCheck size={32} />
          <h2>
            {mentor
              ? "Personal guidance. Your own learning space."
              : "A practical path to launch."}
          </h2>
          <p>{course.introduction}</p>
          {mentor && (
            <>
              <h3>How it works</h3>
              <ol>
                <li>Create your student account and enrol.</li>
                <li>Pay by card or upload your bank transfer proof.</li>
                <li>
                  Once payment is confirmed, arrange your start date and session
                  times with your mentor.
                </li>
                <li>
                  Work on your project over three months, with notes and private
                  session replays in your dashboard.
                </li>
              </ol>
              <p>
                Session frequency and times are agreed with your mentor. Bring a
                laptop, internet access and time to practise between sessions.
              </p>
            </>
          )}
        </aside>
      </section>
      <section className="lms-section">
        <p className="lms-eyebrow">
          {mentor ? "YOUR THREE-MONTH ROADMAP" : "COURSE PREVIEW"}
        </p>
        <h2>
          {mentor
            ? "From business idea to digital build"
            : "What’s inside the course"}
        </h2>
        <div className="lms-roadmap">
          {p.modules.map((m) => (
            <article className="lms-panel" key={m.title}>
              <h3>{m.title}</h3>
              <p>{m.body}</p>
            </article>
          ))}
        </div>
      </section>
      {mentor && (
        <section className="lms-section lms-faq">
          <h2>A few things to know</h2>
          <details>
            <summary>Do I need coding experience?</summary>
            <p>
              No. Your mentor adapts the starting point to your experience.
              Advanced topics are introduced as your skills grow, with hands-on
              practice between sessions.
            </p>
          </details>
          <details>
            <summary>Can I replay my sessions?</summary>
            <p>
              Yes. Your mentor records each session and publishes it to your
              personal course space. Your recordings are assigned to your
              enrolment and are not listed for other students. Replays remain
              available after your three months of mentoring.
            </p>
          </details>
          <details>
            <summary>What does the fee cover?</summary>
            <p>
              {money(course.amount, course.currency)} covers all three months of mentorship,
              building one software project during the programme, and three free months of Digi Assist AI Pro.
              Continued Pro use after the free period requires a paid subscription.
              Domains, hosting and other third-party tools you choose are separate.
            </p>
          </details>
          <details>
            <summary>When do I start?</summary>
            <p>
              Enrolment is open now. After payment confirmation, contact your
              mentor to agree your start date and a schedule that works for both
              of you.
            </p>
          </details>
        </section>
      )}
      <section className="lms-banner">
        <div>
          <h2>
            {course.enrollment_open
              ? "Ready to build your next chapter?"
              : "Your next business chapter is on the way."}
          </h2>
          <p>
            {course.enrollment_open
              ? "Start with a personal learning plan and turn your ideas into practical skills."
              : "Explore the live October class or personal mentorship while this course is being prepared."}
          </p>
        </div>
        <Link
          className="lms-button"
          href={
            course.enrollment_open
              ? `/training-center/account?mode=signup&course=${course.slug}`
              : "/training-center#courses"
          }
        >
          {course.enrollment_open ? "Enrol now" : "Explore live training"}{" "}
          <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
