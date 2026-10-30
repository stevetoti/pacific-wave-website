import Image from "next/image";
import { ArrowRight, CheckCircle2, Workflow, Video, CalendarDays, BriefcaseBusiness } from "lucide-react";
import { fullProgramSlug, foundationsSlug, type PersonalOffer } from "@/lib/lms/personal-programs";

export default function PersonalCurriculum({ offer }: { offer: PersonalOffer }) {
  const includesSoftware = offer.slug !== foundationsSlug;
  const combined = offer.slug === fullProgramSlug;
  return <>
    <section className="lms-section lms-personal-project" aria-labelledby="personal-project-title">
      <div><p className="lms-eyebrow">LEARN THE SKILLS STEVE USES IN HIS WORK</p><h2 id="personal-project-title">{offer.projectTitle}</h2><p className="lms-personal-lead">{offer.overview}</p><p>{offer.projectDescription}</p></div>
      <ol aria-label="Your practical project journey">{offer.projectSteps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span><strong>{step}</strong>{i<offer.projectSteps.length-1 && <ArrowRight size={18} aria-hidden="true"/>}</li>)}</ol>
    </section>
    <section className="lms-section lms-personal-topics" aria-labelledby="personal-topics-title">
      <p className="lms-eyebrow">PRACTICAL SKILLS · REAL PROJECT WORK</p><h2 id="personal-topics-title">Explore what you’ll learn</h2><p className="lms-personal-lead">{combined ? "Both phases, explained: the business and marketing skills first, then software, AI agents and delivery." : includesSoftware ? "Go from using AI tools to building software and connected workflows around your own work." : "The October cohort’s practical business topics, expanded into a personal learning journey with digital agency setup."}</p>
      <div className="lms-personal-topic-grid">{offer.topics.map((topic,i)=><article className="lms-personal-topic" key={topic.title}>
        <div className="lms-personal-topic-art"><Image src={topic.image} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"/><span>{combined ? (i<8?'BUSINESS PHASE':'AI & SOFTWARE PHASE') : String(i+1).padStart(2,'0')}</span></div>
        <div className="lms-personal-topic-copy"><h3>{topic.title}</h3><p>{topic.description}</p><ul>{topic.skills.map(skill=><li key={skill}><CheckCircle2 size={17} aria-hidden="true"/><span>{skill}</span></li>)}</ul></div>
      </article>)}</div>
    </section>
    {includesSoftware && <section className="lms-section lms-personal-agent" aria-labelledby="personal-agent-title">
      <div className="lms-personal-agent-heading"><Workflow size={30} aria-hidden="true"/><div><p className="lms-eyebrow">PUT AI TO WORK ACROSS YOUR BUSINESS</p><h2 id="personal-agent-title">Build your own connected AI workflow</h2><p>Learn to connect an agent’s instructions, information and tools so a task moves from your request to a useful result. Choose the integrations for your project and test the complete process with Steve.</p></div></div>
      <ol className="lms-personal-agent-flow" aria-label="How your AI workflow works">{['Set the goal','Connect your tools','Run the AI workflow','Review and take action'].map((step,i)=><li key={step}><span>{i+1}</span><strong>{step}</strong>{i<3 && <ArrowRight size={20} aria-hidden="true"/>}</li>)}</ol>
      <div className="lms-personal-agent-examples">{[{Icon:BriefcaseBusiness,title:'Customer & admin work',body:'Enquiries, bookings, CRM updates, quotations, invoices and follow-up.'},{Icon:Video,title:'Content & video',body:'Research, scripts, promotional content and connected video-production tools.'},{Icon:CalendarDays,title:'Meetings & next steps',body:'Scheduling, preparation, supported note-taking, summaries, action lists and follow-up drafts.'}].map(({Icon,title,body})=><div key={title}><Icon size={24} aria-hidden="true"/><h3>{title}</h3><p>{body}</p></div>)}</div>
      <p className="lms-personal-agent-note">Work with the tools and accounts appropriate to your project. Features depend on the connected service; third-party subscriptions and usage fees are separate from tuition.</p>
    </section>}
  </>;
}
