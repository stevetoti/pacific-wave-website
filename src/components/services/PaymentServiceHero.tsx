import Image from 'next/image';
import Link from 'next/link';
import type { ServicePageData } from '@/lib/service-pages';

export default function PaymentServiceHero({ service }: { service: ServicePageData }) {
  return (
    <section className="relative isolate overflow-hidden bg-dark-navy" data-payment-hero>
      <div className="relative aspect-[16/10] sm:aspect-video xl:absolute xl:inset-0 xl:aspect-auto">
        <Image src="/images/payments/couple-laptop-card-hero.webp" alt="Illustrative couple using a laptop together, with one partner holding a credit card" fill sizes="100vw" priority className="object-cover object-[75%_center] xl:object-right" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-dark-navy via-dark-navy/80 to-transparent xl:block" aria-hidden="true" />
      </div>
      <div className="relative container-max px-4 py-12 sm:px-6 sm:py-16 xl:min-h-[660px] xl:px-8 xl:py-24">
        <div className="max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-vibrant-orange">{service.heroBadge}</p>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl xl:text-6xl">{service.h1}</h1>
          <p className="mb-8 text-lg leading-relaxed text-blue-100 sm:text-xl">{service.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact#enquiry-form" className="btn-primary">Contact us about payments</Link>
            <Link href="#payment-options" className="btn-secondary">View payment options</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
