import { CourseText } from "@/components/lms/CourseLanguage";
import PersonalLearningSpace from "./PersonalLearningSpace";
import PersonalCurriculum from "./PersonalCurriculum";
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
    <div className={offer ? "lms-personal-page" : undefined}>
      <Link href="/training-center#courses" className="lms-back"><CourseText text={"← All courses"} /></Link>
      <section className="lms-program-hero">
        <div className="lms-program-photo"><Image src={p.image} alt={p.alt} fill priority sizes="(max-width: 800px) 100vw, 50vw" /><span className="lms-pill"><CourseText text={p.label} /></span></div>
        <div className="lms-program-intro">
          <p className="lms-eyebrow"><CourseText text={p.duration} /></p><h1><CourseText text={course.title} /></h1><h2><CourseText text={p.headline} /></h2><p><CourseText text={course.description} /></p>
          <div className="lms-program-price"><strong><CourseText text={course.enrollment_open ? money(course.amount, course.currency) : "Coming soon"} /></strong><span><CourseText text={course.enrollment_open ? "One-time fee · Scheduled lessons and follow-up mentorship" : "Enrolment details to be announced"} /></span></div>
          {course.enrollment_open && <Link className="lms-button" href={enrol}><CourseText text={"Enrol in this programme"} /><ArrowRight size={18}/></Link>}
          {offer && <p className="lms-muted"><CourseText text={"Private one-on-one learning. Start dates and session times are agreed with Steve. Pay by card or ANZ/BRED bank transfer."} /></p>}
        </div>
      </section>
      {offer && <>
        <nav className="lms-personal-jump-nav" aria-label="Programme sections"><a href="#course-topics"><CourseText text={"Explore the topics"} /></a><a href="#course-roadmap"><CourseText text={"Weekly learning plan"} /></a><a href="#learning-space"><CourseText text={"Your learning experience"} /></a></nav>
        <section className="lms-personal-facts" aria-label="Programme at a glance">
          {[{Icon:CalendarDays,value:`${offer.teachingWeeks} weeks`,label:offer.teachingWeeks===6?"About 1½ months of lessons":"About 3 months across both phases"},{Icon:GraduationCap,value:`${offer.sessions.length} lessons`,label:`${offer.sessions.length*1.5} hours of scheduled teaching`},{Icon:Clock3,value:"90 minutes",label:"Each lesson · Three times a week"},{Icon:MessageCircle,value:`${offer.mentorshipMonths} month${offer.mentorshipMonths===1?'':'s'}`,label:offer.slug===fullProgramSlug?"Mentorship after both phases":"Mentorship after the lessons"}].map(({Icon,value,label})=><div key={value}><Icon size={23}/><strong><CourseText text={value} /></strong><span><CourseText text={label} /></span></div>)}
        </section>
        <section className="lms-section lms-personal-options"><p className="lms-eyebrow"><CourseText text={"CHOOSE YOUR ONE-ON-ONE PATH"} /></p><h2><CourseText text={"Two focused programmes. One complete package."} /></h2><div className="lms-personal-options-grid">{personalOffers.map(o=><article key={o.slug} className={`lms-panel ${o.slug===course.slug?'lms-personal-selected':''}`}><p className="lms-eyebrow"><CourseText text={o.teachingWeeks===12?'BOTH PHASES · SAVE VUV 50,000':o.slug===softwareSlug?'PHASE 2 · BUILD WITH AI':'PHASE 1 · BUILD YOUR BUSINESS'} /></p><h3><CourseText text={o.title} /></h3><strong className="lms-personal-option-price">{money(o.amount,'VUV')}</strong><p><CourseText text={personalDuration(o)} /></p><Link href={`/training-center/programs/${o.slug}`} aria-current={o.slug===course.slug?'page':undefined}><CourseText text={o.slug===course.slug?'Currently viewing':'View programme'} /> <ArrowRight size={16}/></Link></article>)}</div></section>
        <section className="lms-section"><p className="lms-eyebrow"><CourseText text={"TWO DIFFERENT STAGES OF SUPPORT"} /></p><h2><CourseText text={"Scheduled lessons and mentorship explained"} /></h2><div className="lms-personal-comparison">
          <article className="lms-panel"><CalendarDays size={28}/><h3><CourseText text={"Scheduled one-on-one lessons"} /></h3><p><CourseText text={"Learn the curriculum through three private sessions every week. Each session lasts 1 hour 30 minutes, with guided demonstrations, practical exercises and project work between lessons."} /></p><p><strong>{offer.teachingWeeks}<CourseText text={"weeks ·"} />{offer.sessions.length}<CourseText text={"lessons ·"} />{offer.sessions.length*1.5}<CourseText text={"teaching hours."} /></strong><CourseText text={"Session dates and times are arranged together."} /></p></article>
          <article className="lms-panel"><MessageCircle size={28}/><h3><CourseText text={"Follow-up mentorship"} /></h3><p><CourseText text={mentorshipExplanation} /></p><p><strong>{offer.mentorshipMonths}<CourseText text={offer.mentorshipMonths===1?'month':'months'} /><CourseText text={"included after"} /><CourseText text={offer.slug===fullProgramSlug?'both training phases':'the scheduled lessons'} />.</strong><CourseText text={"Bring questions, project updates and problems you need help solving."} /></p></article>
        </div></section>
      </>}
      {offer && <PersonalCurriculum offer={offer}/>}
      {offer ? <PersonalLearningSpace offer={offer}/> : (
      <section className="lms-section lms-program-body"><div><p className="lms-eyebrow"><CourseText text={"BUILT AROUND YOUR NEXT STEP"} /></p><h2><CourseText text={"Who this is for"} /></h2><p><CourseText text={p.audience} /></p><h2><CourseText text={"What you’ll work towards"} /></h2><ul className="lms-outcomes">{p.outcomes.map(o=><li key={o}><CheckCircle2 size={20}/><span><CourseText text={o} /></span></li>)}</ul></div>
        <aside className="lms-panel"><h2><CourseText text={"Your own learning space"} /></h2><p><CourseText text={course.introduction} /></p>{offer && <><h3><CourseText text={"How it works"} /></h3><ol><li><CourseText text={"Create your account and choose a programme."} /></li><li><CourseText text={"Pay by card or submit bank-transfer proof."} /></li><li><CourseText text={"Agree your start date and three weekly lesson appointments with Steve."} /></li><li><CourseText text={"Complete the curriculum and practical project, then move into your follow-up mentorship."} /></li></ol><p><CourseText text={"Your private session notes and recordings are assigned to your own enrolment. Bring a laptop, internet access and time to practise."} /></p></>}</aside>
      </section>
      )}
      <section id="course-roadmap" className="lms-section"><p className="lms-eyebrow"><CourseText text={"YOUR STRUCTURED LEARNING ROADMAP"} /></p><h2><CourseText text={"What you will learn"} /></h2><div className="lms-roadmap">{p.modules.map(m=><article className="lms-panel" key={m.title}>{offer && <span className="lms-personal-week-label"><CourseText text={m.title.split(" · ")[0]} /></span>}<h3><CourseText text={m.title} /></h3><p><CourseText text={m.body} /></p></article>)}</div>
        {offer && <details className="lms-panel lms-personal-session-list"><summary><CourseText text={"Explore all"} />{offer.sessions.length}<CourseText text={"scheduled lessons"} /></summary><ol>{offer.sessions.map((s,i)=><li key={`${i}-${s.title}`}><strong>{String(i+1).padStart(2,'0')} · <CourseText text={s.title} /></strong><span><CourseText text={s.body} /></span></li>)}</ol></details>}
      </section>
      <CourseInstructors slug={course.slug} className={offer ? "lms-personal-instructors" : ""}/>
      {offer && <section className="lms-section lms-faq"><h2><CourseText text={"Before you enrol"} /></h2>
        <details><summary><CourseText text={"What does the fee cover?"} /></summary><p>{money(course.amount,course.currency)}<CourseText text={"is the one-time fee for your scheduled lessons and included mentorship."} /><CourseText text=<CourseText text={personalCheckoutNote(offer)} /> /><CourseText text={"Training prompts and templates are included. Domains, hosting, advertising and external software subscriptions are separate."} /></p>{bonus && <p><CourseText text={"The AI/software programme includes three free months of Digi Assist AI Pro, including when taken within the complete package. Continued Pro use after the free period requires a paid subscription."} /></p>}</details>
        <details><summary><CourseText text={"Do I need coding or business experience?"} /></summary><p><CourseText text={"The business foundations programme welcomes beginners. For the AI/software programme, complete the foundations programme or bring an existing business idea and basic computer skills. Steve adapts the starting point and project scope to your experience."} /></p></details>
        <details><summary><CourseText text={"Can I replay my private lessons?"} /></summary><p><CourseText text={"Your mentor publishes your recordings in your own course space, assigned to your enrolment. They are not listed for other students and remain available after your included mentorship period."} /></p></details>
        <details><summary><CourseText text={"How does the combined package work?"} /></summary><p><CourseText text={"The VUV 350,000 package includes both phases in order: six weeks of business foundations, then six weeks of AI and software development. That is 36 scheduled 90-minute lessons over about three months, followed by three months of mentorship after both phases. Booking separately costs VUV 400,000."} /></p></details>
        <details><summary><CourseText text={"When do lessons and mentorship meetings happen?"} /></summary><p><CourseText text={"After payment confirmation, agree a start date and three weekly 90-minute lesson appointments with Steve. During follow-up mentorship, arrange a meeting about once a week or when you need assistance with your project. Mentorship meeting times are agreed together."} /></p></details>
        <p><CourseText text={"Questions before enrolling?"} /><a href="mailto:steve@pacificwavedigital.com"><CourseText text={"Contact Steve about your programme."} /></a></p>
      </section>}
      <section className="lms-banner"><div><h2><CourseText text={"Ready to build your next chapter?"} /></h2><p><CourseText text={"Choose your programme and start with a clear learning plan."} /></p></div><Link className="lms-button" href={course.enrollment_open?enrol:'/training-center#courses'}><CourseText text={course.enrollment_open?'Enrol now':'Explore training'} /> <ArrowRight size={18}/></Link></section>
    </div>
  );
}
