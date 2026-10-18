import Image from 'next/image';
import Link from 'next/link';
import type { ServicePageData } from '@/lib/service-pages';
import { projectCaseStudies } from '@/lib/project-case-studies';

const deliverables = [
  ['A clear page plan', 'Agree the pages, audience and main action: an enquiry, booking request or order. Keep design decisions tied to what your customers need.'],
  ['Mobile layouts and practical content', 'Plan readable text, navigation, photography and forms for phone screens. Prepare compressed images and test the agreed journeys before launch.'],
  ['Search foundations', 'Include descriptive page titles, headings, crawlable links, canonical URLs and sitemap entries. Search visibility depends on Google’s indexing and competition.'],
  ['A handover your team can use', 'Agree content-editing access, training, domain ownership and ongoing support. Hosting, maintenance and external subscriptions are itemised in your proposal.'],
] as const;
const guides = [
  { href: '/blog/web-development-in-vanuatu', title: 'Planning a website in Vanuatu', description: 'Explore the development decisions behind a business website.' },
  { href: '/blog/transform-your-business-with-expert-website-development-in-port-vila-1783893656866', title: 'Website development in Port Vila', description: 'Read our introduction to planning a local website project.' },
];

export default function WebDesignPage({ service }: { service: ServicePageData }) {
  return <>
    <section className="relative overflow-hidden bg-deep-blue text-white">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <nav aria-label="Breadcrumb" className="text-sm text-blue-100 mb-8"><Link href="/" className="hover:underline">Home</Link><span aria-hidden="true"> / </span><Link href="/services" className="hover:underline">Services</Link><span aria-hidden="true"> / </span><span>Web design</span></nav>
          <p className="text-orange-300 text-sm font-semibold uppercase tracking-widest mb-4">Port Vila · Vanuatu · Pacific projects</p>
          <h1 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight mb-6">{service.h1}</h1>
          <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-8">{service.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4"><Link href="/contact#enquiry-form" className="btn-primary !px-7 !py-4">Discuss your website</Link><Link href="#client-websites" className="btn-secondary !px-7 !py-4">Explore client websites</Link></div>
          <p className="text-sm text-blue-100 mt-6">Tourism, retail and service businesses. Scope and quote agreed before work starts.</p>
        </div>
        <figure className="min-w-0">
          <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white">
            <div className="flex gap-2 bg-slate-100 p-3" aria-hidden="true"><span className="w-2 h-2 rounded-full bg-slate-300"/><span className="w-2 h-2 rounded-full bg-slate-300"/><span className="w-2 h-2 rounded-full bg-slate-300"/></div>
            <div className="relative aspect-[4/3]"><Image src="/images/projects/enauwi-beach-resort-desktop.webp" alt="Homepage preview of E’Nauwi Beach Resort’s website, built by Pacific Wave Digital" fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover object-top"/></div>
          </div>
          <figcaption className="text-blue-100 text-sm mt-4">Real client work: <Link href="/portfolio/enauwi-beach-resort" className="underline underline-offset-4">E’Nauwi Beach Resort, Efate</Link>. Website preview captured for our case study.</figcaption>
        </figure>
      </div>
    </section>

    <section className="section-padding bg-white" aria-labelledby="local-design">
      <div className="container-max grid lg:grid-cols-[1fr_1.4fr] gap-10">
        <div><p className="text-vibrant-orange font-semibold mb-3">Designed around your customers</p><h2 id="local-design" className="text-3xl sm:text-4xl font-heading font-bold text-deep-blue">A useful website starts with a clear next step.</h2></div>
        <div className="space-y-5 text-gray-600 text-lg leading-relaxed"><p>Pacific Wave Digital provides web design from Port Vila for businesses in Vanuatu and projects across the Pacific Islands. We shape the layout, content and enquiry journey around the people you want to reach, whether they are local customers or travellers planning a visit.</p><p>A resort needs room details, travel information and a booking enquiry. A retailer needs clear product categories and delivery information. A service business needs an understandable offer and a simple way to contact its team. We agree those priorities before choosing the page design.</p><p>Remote Pacific projects are scoped around your location, audience, connectivity, language and support needs. Our base is Port Vila; remote delivery does not imply an office in another country.</p></div>
      </div>
    </section>

    <section id="client-websites" className="section-padding bg-light-gray scroll-mt-28" aria-labelledby="client-sites-title">
      <div className="container-max"><div className="max-w-2xl mb-10"><p className="text-vibrant-orange font-semibold mb-3">See the work</p><h2 id="client-sites-title" className="text-3xl sm:text-4xl font-heading font-bold text-deep-blue mb-4">Websites for Vanuatu businesses</h2><p className="text-gray-600 leading-relaxed">Explore the layouts and features in these client projects: grocery shopping, resort accommodation, stays and tours. Each case study explains the visitor journey and the work delivered.</p></div>
        <div className="grid md:grid-cols-3 gap-6">{projectCaseStudies.map(project => <article key={project.slug} className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <Link href={`/portfolio/${project.slug}`} className="block group h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-vibrant-orange"><div className="relative aspect-[4/3] overflow-hidden"><Image src={`/images/projects/${project.slug}-desktop.webp`} alt={`${project.name} homepage preview`} fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover object-top group-hover:scale-[1.02] transition-transform"/></div><div className="p-6"><p className="text-sm text-gray-500 mb-2">{project.location}</p><h3 className="text-xl font-bold text-deep-blue mb-3">{project.name}</h3><p className="text-gray-600 text-sm leading-relaxed mb-5">{project.summary}</p><span className="text-deep-blue font-semibold underline underline-offset-4">Explore the website project →</span></div></Link>
        </article>)}</div>
      </div>
    </section>

    <section className="section-padding bg-white" aria-labelledby="design-scope"><div className="container-max"><h2 id="design-scope" className="font-heading text-3xl sm:text-4xl text-deep-blue font-bold mb-4">What we agree in your website proposal</h2><p className="text-gray-600 max-w-2xl mb-10">A business website or redesign should have clear deliverables. Optional integrations, content creation and ongoing work are scoped separately.</p><div className="grid sm:grid-cols-2 gap-6">{deliverables.map(([title,description],i)=><article key={title} className="border border-gray-200 rounded-2xl p-7"><span className="text-vibrant-orange font-semibold text-sm">0{i+1}</span><h3 className="font-heading text-xl text-deep-blue font-bold my-3">{title}</h3><p className="text-gray-600 leading-relaxed">{description}</p></article>)}</div>
      <div className="mt-10 p-7 rounded-2xl bg-light-gray text-gray-600 leading-relaxed"><h3 className="text-xl font-bold text-deep-blue mb-3">Need more than website design?</h3><p><Link href="/services/web-development" className="text-deep-blue underline">Web development</Link> covers the implementation and custom features. For a catalogue and ordering journey, explore <Link href="/services/ecommerce" className="text-deep-blue underline">e-commerce websites</Link>. <Link href="/services/online-payment-integration" className="text-deep-blue underline">Payment integration</Link> depends on merchant eligibility and provider access. <Link href="/services/seo" className="text-deep-blue underline">SEO</Link> and <Link href="/services/cloud-hosting" className="text-deep-blue underline">hosting and maintenance</Link> can be scoped alongside the launch.</p></div></div></section>

    <section className="section-padding bg-deep-blue text-white" aria-labelledby="design-process"><div className="container-max"><h2 id="design-process" className="text-3xl sm:text-4xl font-heading font-bold mb-4">From the first brief to launch</h2><p className="text-blue-100 max-w-2xl mb-10">{service.processIntro}</p><ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">{service.process.map(step=><li key={step.step} className="border-t border-white/25 pt-6"><span className="text-orange-300 font-bold">{step.step}</span><h3 className="text-xl font-semibold my-3">{step.title}</h3><p className="text-blue-100 text-sm leading-relaxed">{step.description}</p></li>)}</ol></div></section>

    <section className="section-padding bg-white" aria-labelledby="web-design-questions"><div className="container-max max-w-4xl"><h2 id="web-design-questions" className="font-heading text-3xl sm:text-4xl font-bold text-deep-blue mb-10">Planning your website: common questions</h2><div className="space-y-7">{service.faqs.map(faq=><article key={faq.question} className="border-b border-gray-200 pb-7"><h3 className="text-lg font-bold text-deep-blue mb-3">{faq.question}</h3><p className="text-gray-600 leading-relaxed">{faq.answer}</p></article>)}</div></div></section>

    <section className="section-padding bg-light-gray" aria-labelledby="website-guides"><div className="container-max"><h2 id="website-guides" className="text-3xl font-heading font-bold text-deep-blue mb-7">Useful reading before your website project</h2><div className="grid sm:grid-cols-2 gap-6">{guides.map(guide=><Link key={guide.href} href={guide.href} className="bg-white border border-gray-200 rounded-2xl p-7 hover:border-vibrant-orange"><h3 className="text-xl font-semibold text-deep-blue mb-3">{guide.title} →</h3><p className="text-gray-600">{guide.description}</p></Link>)}</div></div></section>

    <section className="section-padding bg-white"><div className="container-max max-w-4xl text-center"><h2 className="text-3xl sm:text-4xl font-heading font-bold text-deep-blue mb-5">Tell us what your website needs to do.</h2><p className="text-lg text-gray-600 leading-relaxed mb-8">Share your business, current website, customers, required pages and any booking or payment needs. We will discuss the scope, content, timeline and quote with you.</p><Link href="/contact#enquiry-form" className="btn-primary !px-8 !py-4">Request a website design quote</Link><p className="mt-5 text-gray-600">Prefer a conversation? <a href="tel:+6785288141" className="text-deep-blue underline">Call +678 528 8141</a></p></div></section>
  </>;
}
