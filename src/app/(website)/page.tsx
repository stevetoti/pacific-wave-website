import type { Metadata } from 'next';
import HomePageContent from '@/components/HomePageContent';

export const metadata: Metadata = {
  alternates: { canonical: 'https://pacificwavedigital.com/' },
};

export default function HomePage() {
  return <HomePageContent />;
}
