import Image from 'next/image';
import BrandBackdrop from '@/components/BrandBackdrop';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Products and Platforms',
  description: 'Explore PWD’s digital products, platforms and client work, with links to current product information and project enquiries.',
};

const products = [
  { name: 'VanuConnect', tagline: 'Business communication for Vanuatu.', description: 'A PWD business-communication project for Vanuatu organisations. Contact us to discuss the current offering and the channels, setup and support your business needs.', features: ['Business communication', 'Customer engagement workflows', 'Setup and support scoping'], icon: '📱', kind: 'Product project', href: '/contact', cta: 'Ask about VanuConnect' },
  { name: 'VanuWay', tagline: 'Services for everyday life in Vanuatu.', description: 'A Vanuatu platform bringing together transport, shopping, travel and community services. Visit the product website for current service information and app access.', features: ['Transport and delivery', 'Shopping and marketplace', 'Travel and community services'], icon: '🗺️', kind: 'Product platform', href: 'https://vanuway.com', cta: 'Visit VanuWay' },
  { name: 'Learn Bislama', tagline: 'Explore the language of Vanuatu.', description: 'A Bislama language-learning platform with course and practice resources. The product website provides current programme information and access options.', features: ['Bislama language learning', 'Course and practice resources', 'Programme information'], icon: '📚', kind: 'Learning platform', href: 'https://learnbislama.com', cta: 'Visit Learn Bislama' },
  { name: 'Aelan Basket', tagline: 'Online grocery shopping in Port Vila.', description: 'A client website built by Pacific Wave Digital, connecting grocery product discovery, a shopping basket and local delivery information for Port Vila customers.', features: ['Grocery storefront', 'Shopping basket', 'Delivery information'], icon: '🧺', kind: 'Client platform', href: 'https://www.aelanbasket.com', cta: 'Visit Aelan Basket' },
  { name: 'DigiAssist AI', tagline: 'Tools for running a business.', description: 'A business platform combining website and store tools, customer management and AI-assisted workflows. See the product website for current features, access and pricing.', features: ['Website and store tools', 'Customer management', 'AI-assisted business workflows'], icon: '🤖', kind: 'Business platform', href: 'https://digiassistai.com', cta: 'Visit DigiAssist AI' },
  { name: 'Akwaaba AI', tagline: 'AI assistance in Twi and English.', description: 'An AI assistant with writing, voice and transcription tools, centred on Asante Twi with English support. Visit its current product website to explore the tools.', features: ['Twi and English assistance', 'Writing and voice tools', 'Transcription'], icon: '🌍', kind: 'AI platform', href: 'https://www.akwaabaai.com', cta: 'Visit Akwaaba AI' },
  { name: 'MEDD-SIM', tagline: 'Software for medical simulation.', description: 'Medical simulation software developed for MEDD Australia. Contact Pacific Wave Digital to discuss the platform and the appropriate access arrangements.', features: ['Medical simulation software', 'Education workflows', 'Access and implementation scoping'], icon: '🏥', kind: 'Specialist client software', href: '/contact', cta: 'Ask about MEDD-SIM' },
];

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <BrandBackdrop tone="brand" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-vibrant-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Products &amp; Platforms</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-4 mb-6">
            Built for the Pacific
            <span className="block text-vibrant-orange">& Beyond</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Explore products from our wider ecosystem alongside platforms developed for clients. Follow each product link for current information, or talk to us about access and implementation.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {products.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover"
              >
                <Image src={`/images/custom/${['Learn Bislama', 'TrainerSim', 'MEDD-SIM'].includes(product.name) ? 'learning' : product.name === 'Aelan Basket' ? 'commerce' : product.name === 'VanuWay' ? 'coastal' : 'brand'}.webp`} alt="" width={1344} height={752} sizes="(max-width: 1023px) 100vw, 50vw" className="w-full h-48 sm:h-56 object-cover" />
                <div className="p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-5xl">{product.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-deep-blue font-heading">{product.name}</h3>
                        <p className="text-vibrant-orange text-sm font-medium">{product.tagline}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-deep-blue">{product.kind}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                  <div className="space-y-2">
                    {product.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-vibrant-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={product.href} className="pwd-text-link mt-6">{product.cta} <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <div className="relative bg-gradient-to-br from-vibrant-orange to-soft-orange rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-6">
                Have a Product Idea?
              </h2>
              <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
                We love building products that solve real problems. Let&apos;s discuss how we can bring your idea to life.
              </p>
              <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 bg-white text-vibrant-orange font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg text-lg">
                Let&apos;s Talk
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
