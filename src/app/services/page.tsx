import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Explore Pacific Wave Digital\'s comprehensive digital services including web development, mobile apps, AI solutions, digital marketing, business automation, and cloud hosting.',
};

const services = [
  {
    id: 'web-development',
    title: 'Web Development',
    description:
      'We build high-performance, responsive websites and web applications using modern technologies like React, Next.js, and Node.js. From corporate sites to complex SaaS platforms, we deliver solutions that scale.',
    features: [
      'Custom website design & development',
      'Progressive Web Apps (PWA)',
      'E-commerce solutions',
      'Content Management Systems',
      'API development & integration',
      'Performance optimization',
    ],
    image: '/images/coding-screen.jpg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'mobile-apps',
    title: 'Mobile Apps',
    description:
      'Native and cross-platform mobile applications for iOS and Android. We use React Native and Flutter to create seamless mobile experiences that your customers will love.',
    features: [
      'iOS & Android native apps',
      'Cross-platform development',
      'UI/UX mobile design',
      'App Store optimization',
      'Push notifications & analytics',
      'Offline-first architecture',
    ],
    image: '/images/mobile-app.jpg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'ai-solutions',
    title: 'AI Solutions',
    description:
      'Harness the power of artificial intelligence to transform your business. From intelligent chatbots to predictive analytics and custom AI models, we bring cutting-edge technology to the Pacific.',
    features: [
      'Custom AI chatbots & assistants',
      'Natural Language Processing',
      'Computer vision solutions',
      'Predictive analytics',
      'Machine learning model development',
      'AI-powered automation',
    ],
    image: '/images/ai-technology.jpg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description:
      'Strategic digital marketing campaigns that drive measurable growth. We help Pacific Island businesses reach wider audiences through SEO, social media, content marketing, and paid advertising.',
    features: [
      'Search Engine Optimization (SEO)',
      'Social media management',
      'Content marketing & strategy',
      'Pay-per-click advertising',
      'Email marketing campaigns',
      'Analytics & reporting',
    ],
    image: '/images/digital-marketing.jpg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
  },
  {
    id: 'business-automation',
    title: 'Business Automation',
    description:
      'Streamline your operations with custom workflow automation. We build intelligent systems that reduce manual tasks, cut costs, and increase efficiency across your entire organization.',
    features: [
      'Workflow automation',
      'CRM integration',
      'Document management systems',
      'Automated reporting',
      'Process optimization',
      'Custom business tools',
    ],
    image: '/images/tech-office.jpg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'cloud-hosting',
    title: 'Cloud & Hosting',
    description:
      'Reliable cloud infrastructure and managed hosting optimized for Pacific Island connectivity. We ensure your applications are fast, secure, and always available.',
    features: [
      'Cloud migration & setup',
      'Managed hosting solutions',
      'CDN configuration',
      'SSL & security hardening',
      'Database management',
      '24/7 monitoring & support',
    ],
    image: '/images/cloud-server.jpg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-vibrant-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-4 mb-6">
            Digital Solutions That
            <span className="block text-vibrant-orange">Drive Growth</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            From concept to deployment, we provide end-to-end digital services tailored for Pacific Island businesses and beyond.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-16 h-16 rounded-2xl bg-pale-orange text-vibrant-orange flex items-center justify-center mb-6">
                    {service.icon}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">{service.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3 text-gray-600">
                        <svg className="w-5 h-5 text-vibrant-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="btn-primary">
                    Get Started
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={600}
                      height={400}
                      className="object-cover w-full h-[350px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
              How We Work
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A proven methodology that delivers results on time and within budget.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'We listen to your goals, analyze your market, and define the project scope.' },
              { step: '02', title: 'Design', desc: 'Our designers create intuitive, beautiful interfaces that reflect your brand.' },
              { step: '03', title: 'Develop', desc: 'Our engineers build robust, scalable solutions using cutting-edge technologies.' },
              { step: '04', title: 'Deploy', desc: 'We launch, monitor, and continuously improve your digital solution.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full gradient-blue text-white text-xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-deep-blue font-heading mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding gradient-blue">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Let&apos;s discuss how we can bring your vision to life with the right digital solutions.
          </p>
          <Link href="/contact" className="btn-primary text-lg !px-10 !py-4">
            Contact Us Today
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
