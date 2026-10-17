import type { Metadata } from 'next';
import Link from 'next/link';
import { projectCaseStudies } from '@/lib/project-case-studies';

export const metadata: Metadata = {
  title: 'Vanuatu Website Projects and Case Studies',
  description: 'Explore Pacific Wave Digital’s website work for Aelan Basket, E’Nauwi Beach Resort and Lapita Beach, plus our own online training platform in Vanuatu.',
  alternates: { canonical: 'https://pacificwavedigital.com/portfolio' },
};

export default function PortfolioPage() {
  return (
    <>
      <section className="gradient-blue py-16 sm:py-24">
        <div className="container-max px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-semibold text-orange-200 mb-4">Our work</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading">Websites and software built for Vanuatu</h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto mt-6 leading-relaxed">Explore our work in local retail, tourism and online learning. Each project connects a business’s public website with the next steps its customers need to take.</p>
        </div>
      </section>
      <section className="section-padding bg-white" aria-labelledby="client-projects">
        <div className="container-max">
          <h2 id="client-projects" className="text-3xl font-bold text-deep-blue font-heading mb-8">Client website projects</h2>
          <div className="grid gap-6 lg:grid-cols-3">{projectCaseStudies.map(project => (
            <article key={project.slug} className="rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col">
              <p className="text-sm font-semibold text-deep-blue mb-3">{project.category}</p>
              <h3 className="text-2xl font-bold text-deep-blue font-heading mb-3">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{project.location}</p>
              <p className="text-gray-600 leading-relaxed mb-6 flex-1">{project.summary}</p>
              <Link href={`/portfolio/${project.slug}`} className="text-deep-blue font-semibold underline underline-offset-4">Read the {project.name} case study</Link>
            </article>
          ))}</div>
        </div>
      </section>
      <section className="section-padding bg-light-gray" aria-labelledby="own-project">
        <div className="container-max">
          <div className="rounded-2xl bg-white border border-gray-200 p-6 sm:p-10 max-w-4xl">
            <p className="text-sm font-semibold text-deep-blue mb-3">PWD’s own platform</p>
            <h2 id="own-project" className="text-2xl sm:text-3xl font-bold text-deep-blue font-heading mb-4">An online training platform built in Vanuatu</h2>
            <p className="text-gray-600 leading-relaxed mb-6">See how we connected course enrolment, VUV payment options, live classes, recordings and private student workspaces in the PWD Training Centre.</p>
            <Link href="/portfolio/pwd-training-centre" className="btn-primary">Read the training centre case study</Link>
          </div>
        </div>
      </section>
      <section className="section-padding gradient-blue">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold text-white font-heading mb-6">Let’s plan your next project</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Tell us about your customers, your workflow and what you want your website or software to help you do.</p>
          <Link href="/get-started" className="btn-primary">Start your project</Link>
        </div>
      </section>
    </>
  );
}
