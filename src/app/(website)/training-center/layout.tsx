import type { ReactNode } from 'react';
import { CourseLanguagePicker, CourseLanguageProvider } from '@/components/lms/CourseLanguage';

/** Keep the reading language when navigating between training pages. */
export default function TrainingLanguageLayout({ children }: { children: ReactNode }) {
  return <CourseLanguageProvider>
    <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px'}}><CourseLanguagePicker /></div>
    {children}
  </CourseLanguageProvider>;
}
