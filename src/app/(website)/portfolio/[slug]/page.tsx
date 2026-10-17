import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projectCaseStudies } from '@/lib/project-case-studies';

interface Props { params: Promise<{ slug: string }> }
const origin = 'https://pacificwavedigital.com';
export const dynamicParams = false;
export function generateStaticParams() {
  return projectCaseStudies.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projectCaseStudies.find(project => project.slug === slug);
  if (!project) return {};
  const url = `${origin}/portfolio/${project.slug}`;
  return {
    title: `${project.name}: Vanuatu Website Case Study`,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: { title: `${project.name} — PWD Case Study`, description: project.summary, url, type: 'article' },
  };
}
export default async function ClientCaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = projectCaseStudies.find(project => project.slug === slug);
  if (!project) notFound();
  const url = `${origin}/portfolio/${project.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Article', headline: `${project.name}: ${project.category} in Vanuatu`, description: project.summary, url, mainEntityOfPage: url,
        author: { '@type': 'Organization', name: 'Pacific Wave Digital', url: origin },
        publisher: { '@type': 'Organization', name: 'Pacific Wave Digital', url: origin } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${origin}/portfolio` },
        { '@type': 'ListItem', position: 3, name: project.name, item: url },
      ] },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <section className="gradient-blue py-16 sm:py-24">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-blue-100 mb-8"><Link href="/portfolio" className="underline underline-offset-4">Portfolio</Link><span aria-hidden="true" className="mx-3">/</span><span>{project.name}</span></nav>
          <p className="text-orange-200 font-semibold mb-4">{project.category} · {project.location}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white font-bold font-heading max-w-4xl">{project.name}</h1>
          <p className="text-lg text-blue-100 mt-6 max-w-3xl leading-relaxed">{project.summary}</p>
          <a href={project.website} className="btn-primary mt-8">Visit {project.name}</a>
        </div>
      </section>
      <article className="container-max px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-3xl space-y-10 text-gray-600 leading-relaxed">
          <section><h2 className="text-2xl text-deep-blue font-bold font-heading mb-4">The project</h2><p>{project.context}</p></section>
          <section><h2 className="text-2xl text-deep-blue font-bold font-heading mb-4">How we approached the website</h2><p>{project.approach}</p></section>
        </div>
        <section className="mt-12" aria-labelledby="delivered-features">
          <h2 id="delivered-features" className="text-2xl text-deep-blue font-bold font-heading mb-6">What the website brings together</h2>
          <div className="grid gap-6 md:grid-cols-3">{project.features.map(feature => (
            <div key={feature.title} className="rounded-2xl border border-gray-200 p-6"><h3 className="text-lg font-bold text-deep-blue mb-3">{feature.title}</h3><p className="text-gray-600 leading-relaxed">{feature.description}</p></div>
          ))}</div>
        </section>
        <section className="mt-12 max-w-3xl text-gray-600 leading-relaxed"><h2 className="text-2xl text-deep-blue font-bold font-heading mb-4">The delivered website</h2><p>{project.delivery}</p><p className="mt-4"><a href={project.website} className="text-deep-blue font-semibold underline underline-offset-4">Explore {project.name}’s live website</a></p></section>
        <section className="mt-14 rounded-2xl bg-light-gray p-6 sm:p-10">
          <h2 className="text-2xl text-deep-blue font-bold font-heading mb-4">Planning a website for your business?</h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed">Tell us what your customers need to find, how you handle enquiries or orders, and what your team needs to manage. We can help define the website and supporting workflows for your organisation in Vanuatu or the Pacific.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 my-6 text-deep-blue font-semibold">{project.services.map(service => <Link key={service.href} href={service.href} className="underline underline-offset-4">{service.label}</Link>)}</div>
          <Link href="/get-started" className="btn-primary">Discuss your website</Link>
        </section>
      </article>
    </>
  );
}
