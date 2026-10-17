import Link from 'next/link';
import ProjectPreview from './ProjectPreview';
interface Props { slug: string; name: string; category: string; location: string; summary: string; website: string; ctaLabel?: string }
export default function ProjectHero({ slug, name, category, location, summary, website, ctaLabel }: Props) {
  return (
    <section className="pwd-project-hero">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="pwd-project-breadcrumb"><Link href="/portfolio">Portfolio</Link><span aria-hidden="true">/</span><span>{name}</span></nav>
        <div className="pwd-project-heading">
          <div><p className="pwd-eyebrow">{category} · {location}</p><h1>{name}</h1></div>
          <div><p className="pwd-project-summary">{summary}</p><a href={website} className="pwd-text-link">{ctaLabel || `Visit ${name}`} <span aria-hidden="true">↗</span></a></div>
        </div>
        <ProjectPreview slug={slug} name={name} priority />
      </div>
    </section>
  );
}
