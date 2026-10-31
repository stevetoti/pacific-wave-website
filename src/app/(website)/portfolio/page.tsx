import { socialMetadata } from "@/lib/seo/social-metadata";
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ProjectPreview from '@/components/ProjectPreview';
import { projectCaseStudies } from '@/lib/project-case-studies';

export const metadata: Metadata = {
  title: 'Vanuatu Website Projects and Case Studies',
  description: 'Explore Pacific Wave Digital’s website work for Aelan Basket, E’Nauwi Beach Resort and Lapita Beach, plus our own online training platform in Vanuatu.',
  alternates: { canonical: 'https://pacificwavedigital.com/portfolio' },
  ...socialMetadata("/portfolio"),
};

export default function PortfolioPage() {
  const work = [...projectCaseStudies, { slug: 'pwd-training-centre', name: 'PWD Training Centre', category: 'Own platform · Online learning', location: 'Port Vila, Vanuatu', summary: 'Course enrolment, VUV payment options, live classes and private learning workspaces in one connected platform.' }];
  return (
    <>
      <section className="pwd-work-hero"><div className="container-max px-4 sm:px-6 lg:px-8">
        <p className="pwd-eyebrow">Pacific Wave Digital / Selected work</p>
        <div className="pwd-work-intro"><h1>Island businesses.<br />Digital possibilities.</h1><p>Websites and software built for Vanuatu. Explore our work in local retail, tourism and online learning, from the first impression to the customer’s next step.</p></div>
      </div></section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20 pt-6" style={{ background: '#f6f5f1' }} aria-labelledby="client-projects"><div className="container-max">
        <h2 id="client-projects" className="sr-only">Client website projects and our own platform</h2>
        <div className="pwd-work-grid">{work.map((project, index) => (
          <article key={project.slug} className="pwd-work-card">
            <Link href={`/portfolio/${project.slug}`} aria-label={`Preview ${project.name} case study`}><ProjectPreview slug={project.slug} name={project.name} compact priority={index === 0} /></Link>
            <div className="pwd-work-card-copy"><p className="pwd-eyebrow">{project.category} / {project.location}</p><h3>{project.name}</h3><p>{project.summary}</p><Link href={`/portfolio/${project.slug}`} className="pwd-text-link">{project.slug === 'pwd-training-centre' ? 'Read the training centre case study' : `Read the ${project.name} case study`} <span aria-hidden="true">↗</span></Link></div>
          </article>
        ))}</div>
      </div></section>
      <section className="section-padding bg-white"><div className="container-max pwd-brand-panel"><div className="pwd-brand-panel-copy"><p className="pwd-eyebrow !text-orange-200">Your next chapter</p><h2>Let’s build something worth showing.</h2><p>Bring us your idea, your customers and the way you work. We’ll help shape the website or software that connects them.</p><Link href="/get-started" className="btn-primary">Start your project</Link></div><Image src="/images/custom/brand.webp" alt="Sculptural sea-glass waves in PWD’s coastal brand colours" width={1344} height={752} sizes="(max-width: 767px) 100vw, 50vw" /></div></section>
    </>
  );
}
