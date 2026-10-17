'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isMarketingPath, trackBusinessContact } from '@/lib/analytics/enquiries';

export default function EnquiryTracking() {
  const pathname = usePathname();
  useEffect(() => {
    if (!isMarketingPath(pathname)) return;
    const clicked = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest('a[href]');
      const href = anchor?.getAttribute('href');
      if (href) trackBusinessContact(href);
    };
    document.addEventListener('click', clicked);
    return () => document.removeEventListener('click', clicked);
  }, [pathname]);
  return null;
}
