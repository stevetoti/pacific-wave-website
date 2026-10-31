import { socialMetadata } from "@/lib/seo/social-metadata";
import ProjectHero from '@/components/ProjectHero';
import type { Metadata } from 'next';
import Link from 'next/link';

const canonical = 'https://pacificwavedigital.com/portfolio/pwd-training-centre';
const description = 'How Pacific Wave Digital built its own online training platform in Vanuatu: course enrolment, VUV payment options, live classes, recordings and private student workspaces.';

export const metadata: Metadata = {
  title: 'Online Training Platform in Vanuatu: PWD Case Study',
  description,
  alternates: { canonical },
  ...socialMetadata("/portfolio/pwd-training-centre", {type:"article"}),
};

const capabilities = [
  {
    title: 'Course discovery and enrolment',
    text: 'Public programme pages explain the offer before students create an account. Course access follows the relevant enrolment and payment or approval process.',
  },
  {
    title: 'Payments suited to the programme',
    text: 'The platform supports card checkout and VUV bank-transfer instructions, with proof submission and staff review for bank payments. Payment status and learning access are handled together.',
  },
  {
    title: 'Live teaching and recordings',
    text: 'Scheduled classes use an integrated Zoom classroom. Instructors can publish recordings after teaching, including lessons with more than one video part. Students see recordings when they are published for their course.',
  },
  {
    title: 'Private learning workspaces',
    text: 'Student dashboards bring together course progress, schedules, quizzes and community access. Interactive workbooks let learners save their own answers and export their work as a PDF.',
  },
  {
    title: 'Instructor and administration tools',
    text: 'Assigned instructors manage their courses and students. Staff tools cover enrolment review, lessons, grading and payment records, with access checks applied on the server.',
  },
  {
    title: 'Language and learner support',
    text: 'The learning experience includes English, Bislama and French interface options, alongside AI learning support. A learner’s own answers are retained in the language they use.',
  },
];

export default function TrainingCentreCaseStudy() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Building PWD’s online training platform in Vanuatu',
        description,
        url: canonical,
        mainEntityOfPage: canonical,
        author: { '@type': 'Organization', name: 'Pacific Wave Digital', url: 'https://pacificwavedigital.com' },
        publisher: { '@type': 'Organization', name: 'Pacific Wave Digital', url: 'https://pacificwavedigital.com' },
        about: { '@type': 'SoftwareApplication', name: 'PWD Training Centre', applicationCategory: 'EducationalApplication', operatingSystem: 'Web', url: 'https://pacificwavedigital.com/training-center' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://pacificwavedigital.com' },
          { '@type': 'ListItem', position: 2, name: 'Portfolio', item: 'https://pacificwavedigital.com/portfolio' },
          { '@type': 'ListItem', position: 3, name: 'PWD Training Centre', item: canonical },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <ProjectHero slug="pwd-training-centre" name="PWD Training Centre" category="Own platform · Online learning" location="Port Vila, Vanuatu" summary="Building PWD’s online training platform in Vanuatu: course discovery, enrolment, payments and teaching in one connected web platform." website="/training-center" ctaLabel="Explore the training centre" />

      <article className="pwd-project-body container-max px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-10 text-gray-600 leading-relaxed">
            <section aria-labelledby="challenge">
              <h2 id="challenge" className="text-2xl font-bold font-heading text-deep-blue mb-4">The challenge</h2>
              <p>Pacific Wave Digital needed a platform for its own training programmes in Vanuatu. A course website alone would not cover the whole journey: learners also needed account access, clear payment instructions, schedules, teaching materials and a way to return to their work.</p>
              <p className="mt-4">Our team built the public course pages and the learning system behind them. This is an internal PWD project, operated by the same business that designed and developed it.</p>
            </section>
            <section aria-labelledby="local-design">
              <h2 id="local-design" className="text-2xl font-bold font-heading text-deep-blue mb-4">Design decisions for Vanuatu</h2>
              <p>We included VUV bank-payment guidance alongside card checkout, Vanuatu schedules for live sessions, and layouts that work on mobile screens. English, Bislama and French interface options support different language preferences.</p>
              <p className="mt-4">Recordings are published separately from live lessons, so learners can return to teaching material when it is available. Public course information is rendered before sign-in; private coursework and student records require authorised access.</p>
            </section>
          </div>
          <aside className="rounded-2xl border border-gray-200 bg-light-gray p-6 self-start" aria-label="Project details">
            <h2 className="text-xl font-bold text-deep-blue mb-5">Project at a glance</h2>
            <dl className="space-y-5 text-sm">
              <div><dt className="font-semibold text-deep-blue">Project owner</dt><dd className="text-gray-600 mt-1">Pacific Wave Digital · Internal product</dd></div>
              <div><dt className="font-semibold text-deep-blue">Location</dt><dd className="text-gray-600 mt-1">Port Vila, Vanuatu</dd></div>
              <div><dt className="font-semibold text-deep-blue">Our work</dt><dd className="text-gray-600 mt-1">Web development, custom software and workflow automation</dd></div>
              <div><dt className="font-semibold text-deep-blue">Technology</dt><dd className="text-gray-600 mt-1">Next.js, TypeScript, Supabase and Vercel</dd></div>
            </dl>
          </aside>
        </div>

        <section aria-labelledby="built" className="mt-14">
          <h2 id="built" className="text-2xl sm:text-3xl font-bold text-deep-blue font-heading mb-8">What we built</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <div key={capability.title} className="rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-deep-blue mb-3">{capability.title}</h3>
                <p className="text-gray-600 leading-relaxed">{capability.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="delivery" className="mt-14 max-w-3xl text-gray-600 leading-relaxed">
          <h2 id="delivery" className="text-2xl font-bold font-heading text-deep-blue mb-4">A connected learning journey</h2>
          <p>The delivered platform brings public programme information, enrolment administration and private learning tools into one system. Our release checks covered mobile and desktop journeys, account and course permissions, and the publication of lessons and recordings.</p>
          <p className="mt-4">You can explore the <Link href="/training-center" className="font-semibold text-deep-blue underline underline-offset-4">public training centre</Link> to see the course experience before enrolment. Student workspaces require the appropriate account and course access.</p>
        </section>

        <section aria-labelledby="your-platform" className="mt-14 rounded-2xl bg-light-gray p-6 sm:p-10">
          <h2 id="your-platform" className="text-2xl sm:text-3xl font-bold font-heading text-deep-blue mb-4">Planning a platform for your organisation?</h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed">For an organisation in Vanuatu or elsewhere in the Pacific, the starting point is the workflow: who needs access, how payments or approvals work, which languages matter and what staff need to manage. We use those requirements to define a practical development scope.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 my-6 text-deep-blue font-semibold">
            <Link href="/services/web-development" className="underline underline-offset-4">Web development</Link>
            <Link href="/services/software-development" className="underline underline-offset-4">Software development</Link>
            <Link href="/services/ai-automation" className="underline underline-offset-4">AI and automation</Link>
          </div>
          <Link href="/get-started" className="btn-primary">Discuss your platform</Link>
        </section>
      </article>
    </>
  );
}
