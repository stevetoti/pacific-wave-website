import type { Metadata } from 'next';
import HomePageContent from '@/components/HomePageContent';

export const metadata: Metadata = {
  title: { absolute: 'Web Design, Apps & AI in Vanuatu | Pacific Wave Digital' },
  description: 'Web design, custom software, mobile apps and AI automation from Port Vila. Pacific Wave Digital helps businesses across Vanuatu and the Pacific grow online.',
  openGraph: { title: 'Web Design, Apps & AI in Vanuatu | Pacific Wave Digital', description: 'Websites, software, apps and AI automation from Port Vila for Vanuatu and Pacific businesses.', url: 'https://pacificwavedigital.com/', images: ['/images/hero-og-share.jpg'] },
  alternates: { canonical: 'https://pacificwavedigital.com/' },
};

export default function HomePage() {
  return <HomePageContent />;
}
