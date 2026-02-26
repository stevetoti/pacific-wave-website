import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services | Pacific Wave Digital',
  description: 'Professional web development, AI automation, mobile app development, and digital marketing services for Vanuatu and Pacific Island businesses. Custom solutions for your business needs.',
  keywords: [
    'web development Vanuatu',
    'website design Pacific Islands',
    'AI automation Vanuatu',
    'business automation Pacific',
    'chatbot development Pacific Islands',
    'mobile app development Vanuatu',
    'digital marketing Pacific Islands',
    'SEO services Vanuatu',
    'e-commerce development Pacific',
    'custom software Vanuatu',
    'web applications Pacific Islands',
    'business automation solutions',
  ],
  openGraph: {
    title: 'Services | Pacific Wave Digital',
    description: 'Professional web development, AI automation, mobile apps, and digital marketing for Pacific Island businesses.',
    type: 'website',
    url: 'https://pacificwavedigital.com/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
