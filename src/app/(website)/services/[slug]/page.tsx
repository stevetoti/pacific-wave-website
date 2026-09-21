import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicePageContent from '@/components/services/ServicePageContent';
import { getServicePage, servicePages } from '@/lib/service-pages';

const baseUrl = 'https://pacificwavedigital.com';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

// Statically generate all 7 service pages at build time.
export function generateStaticParams(): { slug: string }[] {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) {
    return {};
  }

  // The root layout's title template appends "| Pacific Wave Digital".
  return {
    title: service.h1,
    description: service.metaDescription,
    keywords: service.keywords,
    alternates: {
      canonical: `${baseUrl}/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.h1} | Pacific Wave Digital`,
      description: service.metaDescription,
      type: 'website',
      url: `${baseUrl}/services/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) {
    notFound();
  }

  const relatedServices = servicePages
    .filter((other) => other.slug !== service.slug)
    .map(({ slug: relatedSlug, label, icon, cardDescription }) => ({
      slug: relatedSlug,
      label,
      icon,
      cardDescription,
    }));

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1,
    serviceType: service.serviceType,
    description: service.metaDescription,
    url: `${baseUrl}/services/${service.slug}`,
    areaServed: {
      '@type': 'Country',
      name: 'Vanuatu',
    },
    provider: {
      '@type': 'Organization',
      name: 'Pacific Wave Digital',
      url: baseUrl,
      email: 'info@pacificwavedigital.com',
      telephone: '+678-777-4567',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Lini Highway',
        addressLocality: 'Port Vila',
        addressCountry: 'VU',
      },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ServicePageContent service={service} relatedServices={relatedServices} />
    </>
  );
}
