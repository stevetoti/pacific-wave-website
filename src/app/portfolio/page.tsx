import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'See Pacific Wave Digital\'s portfolio of successful projects including web applications, mobile apps, AI solutions, and digital transformation initiatives across the Pacific.',
};

const projects = [
  {
    title: 'VanuConnect Platform',
    client: 'Pacific Wave Digital (Internal)',
    category: 'Mobile App & Web Platform',
    description:
      'Built a comprehensive communication platform for Vanuatu businesses, featuring real-time messaging, voice/video calls, and a business directory — all optimized for low-bandwidth Pacific Island connectivity.',
    technologies: ['React Native', 'Node.js', 'WebRTC', 'PostgreSQL'],
    image: '/images/phone-user.jpg',
    results: ['10,000+ downloads', '500+ businesses listed', '99.5% uptime'],
  },
  {
    title: 'Government Digital Services Portal',
    client: 'Government of Vanuatu',
    category: 'Web Application',
    description:
      'Modernized citizen-facing government services with an integrated digital portal, reducing wait times and enabling online applications for permits, licenses, and certificates.',
    technologies: ['Next.js', 'Supabase', 'Tailwind CSS', 'Vercel'],
    image: '/images/laptop-work.jpg',
    results: ['60% reduction in processing time', '15,000+ applications processed', 'Mobile-first design'],
  },
  {
    title: 'MEDD-SIM Training Platform',
    client: 'Medical Education Institutions',
    category: 'AI & Education Platform',
    description:
      'Developed an AI-powered medical simulation platform used by healthcare training programs to create realistic clinical scenarios, assess student performance, and generate detailed progress reports.',
    technologies: ['React', 'OpenAI API', 'Supabase', 'Python'],
    image: '/images/ai-technology.jpg',
    results: ['Used by 3 institutions', '1,000+ simulations run', '40% improved exam scores'],
  },
  {
    title: 'Island Resorts Booking System',
    client: 'Island Resorts Group',
    category: 'E-commerce & Booking',
    description:
      'Created a modern booking and reservation system for a chain of Pacific Island resorts, with integrated payment processing, room management, and automated guest communications.',
    technologies: ['Next.js', 'Stripe', 'Node.js', 'MongoDB'],
    image: '/images/tropical-beach.jpg',
    results: ['35% increase in online bookings', 'Multi-currency support', 'Automated check-in'],
  },
  {
    title: 'Akwaaba AI WhatsApp Platform',
    client: 'Akwaaba AI (Ghana)',
    category: 'AI Chatbot & Automation',
    description:
      'Built an AI-powered WhatsApp business automation platform for the Ghanaian market, enabling businesses to automate customer support, appointment booking, and order management in local languages.',
    technologies: ['Python', 'WhatsApp API', 'OpenAI', 'FastAPI'],
    image: '/images/tech-office.jpg',
    results: ['80% faster response times', 'Multi-language support', '200+ businesses onboarded'],
  },
  {
    title: 'VanuWay Business Directory',
    client: 'Pacific Wave Digital (Internal)',
    category: 'Mobile App & Marketplace',
    description:
      'Launched Vanuatu\'s premier business directory and service marketplace, helping locals and tourists discover and connect with trusted businesses across the islands.',
    technologies: ['React Native', 'Supabase', 'Maps API', 'Expo'],
    image: '/images/business-handshake.jpg',
    results: ['300+ verified businesses', '5,000+ monthly users', 'GPS-powered search'],
  },
];

export default function PortfolioPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-vibrant-orange rounded-full blur-3xl"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Portfolio</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-4 mb-6">
            Our Work
            <span className="block text-vibrant-orange">Speaks for Itself</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore our portfolio of successful projects across the Pacific Islands and beyond.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="space-y-20">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? '' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="object-cover w-full h-[350px] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-vibrant-orange text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <p className="text-vibrant-orange font-semibold text-sm mb-2">{project.client}</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-deep-blue font-heading mb-4">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-pale-orange text-deep-blue text-xs font-medium rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Results */}
                  <div className="bg-light-gray rounded-xl p-6">
                    <p className="text-sm font-semibold text-deep-blue mb-3">Key Results:</p>
                    <div className="space-y-2">
                      {project.results.map((result) => (
                        <div key={result} className="flex items-center space-x-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-vibrant-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding gradient-blue">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-6">
            Your Project Could Be Next
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Let&apos;s discuss how Pacific Wave Digital can help bring your vision to life.
          </p>
          <Link href="/contact" className="btn-primary text-lg !px-10 !py-4">
            Start a Project
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
