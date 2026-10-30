import BlpWorkshop from "./BlpWorkshop";
import { blpSlug } from "@/lib/lms/blp-workshop";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CalendarDays, Clock3, GraduationCap, MessageCircle } from "lucide-react";
import { money, type Course } from "@/lib/lms/types";
import { programs } from "@/lib/lms/programs";
import { personalOffers, personalDuration, personalCheckoutNote, mentorshipExplanation, softwareSlug, fullProgramSlug } from "@/lib/lms/personal-programs";
import CourseInstructors from "./CourseInstructors";
export default function ProgramDetail({ course }: { course: Course }) {
  if (course.slug === blpSlug) return <BlpWorkshop course={course} />;
  const p = programs[course.slug];
  if (!p) return null;
  const offer = p.personal;
  const bonus = offer && [softwareSlug, fullProgramSlug].includes(offer.slug);
  const enrol = `/training-center/account?mode=signup&course=${course.slug}`;
  return (
    <>
      <Link href="/training-center#courses" className="lms-back">← All courses</Link>
      <section className="lms-program-hero">
        <div className="lms-program-photo"><Image src={p.image} alt={p.alt} fill priority sizes="(max-width: 800px) 100vw, 50vw" /><span className="lms-pill">{p.label}</span></div>
        <div className="lms-program-intro">
          <p className="lms-eyebrow">{p.duration}</p><h1>{course.title}</h1><h2>{p.headline}</h2><p>{course.description}</p>
          <div className="lms-program-price"><strong>{course.enrollment_open ? money(course.amount, course.currency) : "Coming soon"}</strong><span>{course.enrollment_open ? "One-time fee · Scheduled lessons and follow-up mentorship" : "Enrolment details to be announced"}</span></div>
          {course.enrollment_open && <Link className="lms-button" href={enrol}>Enrol in this programme <ArrowRight size={18}/></Link>}
          {offer && <p className="lms-muted">Private one-on-one learning. Start dates and session times are agreed with Steve. Pay by card or ANZ/BRED bank transfer.</p>}
        </div>
      </section>
      {offer && <>
        <section className="lms-personal-facts" aria-label="Programme at a glance">
          {[{Icon:CalendarDays,value:`${offer.teachingWeeks} weeks`,label:offer.teachingWeeks===6?"About 1½ months of lessons":"About 3 months across both phases"},{Icon:GraduationCap,value:`${offer.sessions.length} lessons`,label:`${offer.sessions.length*1.5} hours of scheduled teaching`},{Icon:Clock3,value:"90 minutes",label:"Each lesson · Three times a week"},{Icon:MessageCircle,value:`${offer.mentorshipMonths} month${offer.mentorshipMonths===1?'':'s'}`,label:offer.slug===fullProgramSlug?"Mentorship after both phases":"Mentorship after the lessons"}].map(({Icon,value,label})=><div key={value}><Icon size={23}/><strong>{value}</strong><span>{label}</span></div>)}
        </section>
        <section className="lms-section lms-personal-options"><p className="lms-eyebrow">CHOOSE YOUR ONE-ON-ONE PATH</p><h2>Two focused programmes. One complete package.</h2><div className="lms-personal-options-grid">{personalOffers.map(o=><article key={o.slug} className={`lms-panel ${o.slug===course.slug?'lms-personal-selected':''}`}><p className="lms-eyebrow">{o.teachingWeeks===12?'BOTH PHASES · SAVE VUV 50,000':o.slug===softwareSlug?'PHASE 2 · BUILD WITH AI':'PHASE 1 · BUILD YOUR BUSINESS'}</p><h3>{o.title}</h3><strong className="lms-personal-option-price">{money(o.amount,'VUV')}</strong><p>{personalDuration(o)}</p><Link href={`/training-center/programs/${o.slug}`} aria-current={o.slug===course.slug?'page':undefined}>{o.slug===course.slug?'Currently viewing':'View programme'} <ArrowRight size={16}/></Link></article>)}</div></section>
        <section className="lms-section"><p className="lms-eyebrow">TWO DIFFERENT STAGES OF SUPPORT</p><h2>Scheduled lessons and mentorship explained</h2><div className="lms-personal-comparison">
          <article className="lms-panel"><CalendarDays size={28}/><h3>Scheduled one-on-one lessons</h3><p>Learn the curriculum through three private sessions every week. Each session lasts 1 hour 30 minutes, with guided demonstrations, practical exercises and project work between lessons.</p><p><strong>{offer.teachingWeeks} weeks · {offer.sessions.length} lessons · {offer.sessions.length*1.5} teaching hours.</strong> Session dates and times are arranged together.</p></article>
          <article className="lms-panel"><MessageCircle size={28}/><h3>Follow-up mentorship</h3><p>{mentorshipExplanation}</p><p><strong>{offer.mentorshipMonths} month{offer.mentorshipMonths===1?'':'s'} included after {offer.slug===fullProgramSlug?'both training phases':'the scheduled lessons'}.</strong> Bring questions, project updates and problems you need help solving.</p></article>
        </div></section>
      </>}
      <section className="lms-section lms-program-body"><div><p className="lms-eyebrow">BUILT AROUND YOUR NEXT STEP</p><h2>Who this is for</h2><p>{p.audience}</p><h2>What you’ll work towards</h2><ul className="lms-outcomes">{p.outcomes.map(o=><li key={o}><CheckCircle2 size={20}/><span>{o}</span></li>)}</ul></div>
        <aside className="lms-panel"><h2>Your own learning space</h2><p>{course.introduction}</p>{offer && <><h3>How it works</h3><ol><li>Create your account and choose a programme.</li><li>Pay by card or submit bank-transfer proof.</li><li>Agree your start date and three weekly lesson appointments with Steve.</li><li>Complete the curriculum and practical project, then move into your follow-up mentorship.</li></ol><p>Your private session notes and recordings are assigned to your own enrolment. Bring a laptop, internet access and time to practise.</p></>}</aside>
      </section>
      <section className="lms-section"><p className="lms-eyebrow">YOUR STRUCTURED LEARNING ROADMAP</p><h2>What you will learn</h2><div className="lms-roadmap">{p.modules.map(m=><article className="lms-panel" key={m.title}><h3>{m.title}</h3><p>{m.body}</p></article>)}</div>
        {offer && <details className="lms-panel lms-personal-session-list"><summary>Explore all {offer.sessions.length} scheduled lessons</summary><ol>{offer.sessions.map((s,i)=><li key={`${i}-${s.title}`}><strong>{String(i+1).padStart(2,'0')} · {s.title}</strong><span>{s.body}</span></li>)}</ol></details>}
      </section>
      <CourseInstructors slug={course.slug}/>
      {offer && <section className="lms-section lms-faq"><h2>Before you enrol</h2>
        <details><summary>What does the fee cover?</summary><p>{money(course.amount,course.currency)} is the one-time fee for your scheduled lessons and included mentorship. {personalCheckoutNote(offer)} Training prompts and templates are included. Domains, hosting, advertising and external software subscriptions are separate.</p>{bonus && <p>The AI/software programme includes three free months of Digi Assist AI Pro, including when taken within the complete package. Continued Pro use after the free period requires a paid subscription.</p>}</details>
        <details><summary>Do I need coding or business experience?</summary><p>The business foundations programme welcomes beginners. For the AI/software programme, complete the foundations programme or bring an existing business idea and basic computer skills. Steve adapts the starting point and project scope to your experience.</p></details>
        <details><summary>Can I replay my private lessons?</summary><p>Your mentor publishes your recordings in your own course space, assigned to your enrolment. They are not listed for other students and remain available after your included mentorship period.</p></details>
        <details><summary>How does the combined package work?</summary><p>The VUV 350,000 package includes both phases in order: six weeks of business foundations, then six weeks of AI and software development. That is 36 scheduled 90-minute lessons over about three months, followed by three months of mentorship after both phases. Booking separately costs VUV 400,000.</p></details>
        <details><summary>When do lessons and mentorship meetings happen?</summary><p>After payment confirmation, agree a start date and three weekly 90-minute lesson appointments with Steve. During follow-up mentorship, arrange a meeting about once a week or when you need assistance with your project. Mentorship meeting times are agreed together.</p></details>
        <p>Questions before enrolling? <a href="mailto:steve@pacificwavedigital.com">Contact Steve about your programme.</a></p>
      </section>}
      <section className="lms-banner"><div><h2>Ready to build your next chapter?</h2><p>Choose your programme and start with a clear learning plan.</p></div><Link className="lms-button" href={course.enrollment_open?enrol:'/training-center#courses'}>{course.enrollment_open?'Enrol now':'Explore training'} <ArrowRight size={18}/></Link></section>
    </>
  );
}
