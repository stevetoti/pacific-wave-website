'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function WebsiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTrainingCenter = pathname === '/training-center' || pathname.startsWith('/training-center/');

  return (
    <>
      {!isTrainingCenter && <Navbar />}
      <main className={isTrainingCenter ? 'flex-1' : 'flex-1 pt-20'}>{children}</main>
    </>
  );
}
