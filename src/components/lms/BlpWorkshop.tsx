import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, LockKeyhole, BookOpen, Video, Users } from 'lucide-react';
import { blpModules } from '@/lib/lms/blp-workshop';
import type { Course } from '@/lib/lms/types';
import CourseInstructors from './CourseInstructors';
export default function BlpWorkshop({ course }: { course: Course }) {
  const register = `/training-center/account?mode=signup&course=${course.slug}`;
  return <div className="blp-workshop">
    <section className="lms-program-hero">
      <div className="lms-program-intro">
        <Image src="/images/training/blp/logo.png" alt="Business Link Pacific" width={225} height={144} className="blp-logo" priority />
        <p className="lms-eyebrow">HOSTED BY BUSINESS LINK PACIFIC</p>
        <h1>Bring your business online.</h1>
        <h2>Digitisation, AI and Cyber Security</h2>
        <p>Training delivered by Pacific Wave Digital. Find customers. Work professionally. Build digital confidence. A practical day of learning for Ni-Vanuatu business owners, with continued support in your PWD learning dashboard.</p>
        <div className="blp-facts"><p><CalendarDays size={20} /> Wednesday 21 October 2026 · 9 am–4 pm</p><p><MapPin size={20} /> Yumiwork Conference Room · Vanuatu time</p></div>
        {course.enrollment_open ? <Link href={register} className="lms-button">Register for the workshop <ArrowRight size={18} /></Link> : <p>Registration is not open yet.</p>}
        <p className="lms-muted"><LockKeyhole size={16} /> For invited BLP participants. {course.amount === 0 ? 'No participant fee. Our team approves access after registration.' : 'Registration details are confirmed at enrolment.'}</p>
      </div>
      <div className="lms-program-photo"><Image src="/images/training/blp/scene-01.webp" alt="Illustration of Ni-Vanuatu business owners learning digital skills together" fill priority sizes="(max-width: 800px) 100vw, 50vw" /><span className="lms-pill">ONE DAY TO START. KEEP LEARNING ONLINE.</span></div>
    </section>
    <section className="lms-section"><p className="lms-eyebrow">YOUR LEARNING CONTINUES</p><h2>A workshop with a learning space of your own.</h2><div className="lms-roadmap">
      {[[BookOpen, 'Practical resources', 'Your participant workbook, activities, assessments and a personal action plan.'], [Video, 'Recordings and AI faculty', 'Return to published session replays and use the same AI learning coaches available across PWD courses.'], [Users, 'Your workshop community', 'Ask your instructors questions and connect with other participants in this private workshop.']].map(([Icon, title, body]) => { const I = Icon as typeof BookOpen; return <article className="lms-panel" key={String(title)}><I size={28} /><h3>{String(title)}</h3><p>{String(body)}</p></article>; })}
    </div></section>
    <section className="lms-section"><p className="lms-eyebrow">THE ONE-DAY PROGRAMME</p><h2>Build something useful for your business.</h2><div className="blp-modules">{blpModules.map(m => <article className="lms-panel" key={m.time}><Image src={`/images/training/blp/scene-0${m.image}.webp`} alt="Illustrative business learning activity" width={600} height={338} /><div><p className="lms-eyebrow">{m.time} · VANUATU TIME</p><h3>{m.title}</h3><p>{m.body}</p></div></article>)}</div><p className="lms-muted">Morning tea 10:15–10:30 · Lunch 12–1 pm · Afternoon tea 2–2:15 pm. English presentation with short Bislama workbook explanations, live demonstrations, guided practice and peer review.</p></section>
    <CourseInstructors slug={course.slug} />
    <section className="lms-banner"><div><h2>Your next step starts here.</h2><p>Register for free. Once our team confirms you are a workshop participant, your resources and private community will open.</p></div>{course.enrollment_open && <Link href={register} className="lms-button">Register privately <ArrowRight size={18} /></Link>}</section>
    <p className="lms-muted blp-image-note">Images are AI-generated illustrations, not photographs of the actual workshop. Third-party account requirements and subscriptions are separate.</p>
  </div>;
}
