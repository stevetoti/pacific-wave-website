import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import VoiceWidget from '@/components/VoiceWidget';

export const metadata: Metadata = {
  metadataBase: new URL('https://pacificwavedigital.com'),
  title: {
    default: 'Pacific Wave Digital — Digital Innovation for the Pacific',
    template: '%s | Pacific Wave Digital',
  },
  description:
    'Pacific Wave Digital is a leading digital agency in Vanuatu specializing in AI-powered business solutions, web development, mobile apps, and digital transformation for Pacific Island businesses.',
  keywords: [
    'Pacific Wave Digital',
    'Vanuatu',
    'digital agency',
    'AI solutions',
    'web development',
    'mobile apps',
    'Port Vila',
    'Pacific Islands',
    'digital transformation',
    'business automation',
  ],
  authors: [{ name: 'Pacific Wave Digital' }],
  creator: 'Pacific Wave Digital',
  publisher: 'Pacific Wave Digital',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pacificwavedigital.com',
    siteName: 'Pacific Wave Digital',
    title: 'Pacific Wave Digital — Digital Innovation for the Pacific',
    description:
      'Leading digital agency in Vanuatu specializing in AI-powered business solutions, web development, and digital transformation.',
    images: [
      {
        url: '/images/hero-pacific.jpg',
        width: 1200,
        height: 630,
        alt: 'Pacific Wave Digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pacific Wave Digital — Digital Innovation for the Pacific',
    description:
      'Leading digital agency in Vanuatu specializing in AI-powered business solutions, web development, and digital transformation.',
    images: ['/images/hero-pacific.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Pacific Wave Digital',
  image: 'https://pacificwavedigital.com/images/hero-pacific.jpg',
  '@id': 'https://pacificwavedigital.com',
  url: 'https://pacificwavedigital.com',
  telephone: '+678-777-4567',
  email: 'info@pacificwavedigital.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lini Highway',
    addressLocality: 'Port Vila',
    addressCountry: 'VU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -17.7334,
    longitude: 168.3273,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00',
    closes: '17:00',
  },
  sameAs: [
    'https://www.linkedin.com/company/pacific-wave-digital',
    'https://www.facebook.com/pacificwavedigital',
  ],
  priceRange: '$$',
  description:
    'Leading digital agency in Vanuatu specializing in AI-powered business solutions, web development, mobile apps, and digital transformation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <VoiceWidget />
        <ChatWidget />
      </body>
    </html>
  );
}
