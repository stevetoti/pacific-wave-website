import { ArrowRight, CheckCircle2, Laptop, NotebookPen, PlayCircle, CalendarDays, MessageCircle, UserRoundCheck } from "lucide-react";
import { fullProgramSlug, type PersonalOffer } from "@/lib/lms/personal-programs";

export default function PersonalLearningSpace({ offer }: { offer: PersonalOffer }) {
  const support = `${offer.mentorshipMonths} month${offer.mentorshipMonths === 1 ? "" : "s"}`;
  const benefits = [
    { Icon: NotebookPen, title: "Your private course space", body: "Find your assigned lessons, project notes and next steps together in your own account." },
    { Icon: PlayCircle, title: "Recordings to revisit", body: "Replay your private sessions after Steve publishes them to your enrolment." },
    { Icon: MessageCircle, title: "Guidance as you build", body: `${support} of follow-up mentorship ${offer.slug === fullProgramSlug ? "after both phases" : "after your lessons"}, with reviews and help when you need it.` },
  ];
  const steps = [
    { title: "Enrol & confirm", body: "Create your account, choose your programme and pay by card or submit bank-transfer proof." },
    { title: "Arrange & learn", body: "Agree a start date with Steve. Meet three times a week for private 90-minute lessons." },
    { title: "Build & keep improving", body: "Complete your practical project, then use mentorship for guidance, reviews and troubleshooting." },
  ];
  return <>
    <section className="lms-section lms-personal-fit" aria-labelledby="personal-fit-title">
      <div className="lms-personal-fit-intro"><UserRoundCheck size={28} aria-hidden="true"/><div><p className="lms-eyebrow">BUILT AROUND YOUR NEXT STEP</p><h2 id="personal-fit-title">Who this is for</h2><p>{offer.audience}</p></div></div>
      <h3>What you’ll work towards</h3>
      <ul className="lms-personal-outcome-grid">{offer.outcomes.map(outcome=><li key={outcome}><CheckCircle2 size={20} aria-hidden="true"/><span>{outcome}</span></li>)}</ul>
    </section>
    <section id="learning-space" className="lms-section lms-personal-space" aria-labelledby="personal-space-title">
      <div className="lms-personal-section-heading"><div><p className="lms-eyebrow">A CLEAR PLAN. YOUR OWN PACE OF PRACTICE.</p><h2 id="personal-space-title">Your own learning space</h2><p>Private lessons, practical project work and personal support in one place.</p></div><Laptop size={44} aria-hidden="true"/></div>
      <div className="lms-personal-space-grid">{benefits.map(({Icon,title,body})=><article key={title}><Icon size={25} aria-hidden="true"/><h3>{title}</h3><p>{body}</p></article>)}</div>
      <div className="lms-personal-start"><h3>How it works</h3><ol>{steps.map((step,i)=><li key={step.title}><span className="lms-personal-step-number">{String(i+1).padStart(2,"0")}</span><div><h4>{step.title}</h4><p>{step.body}</p></div>{i<2 && <ArrowRight size={18} aria-hidden="true"/>}</li>)}</ol></div>
      <div className="lms-personal-preparation"><span><Laptop size={19} aria-hidden="true"/> Bring a laptop and internet access</span><span><CalendarDays size={19} aria-hidden="true"/> Set aside time to practise between lessons</span></div>
    </section>
  </>;
}
