import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Discover Pacific Wave Digital\'s suite of innovative products: VanuConnect, VanuWay, Learn Bislama, Aelan Basket, TrainerSim, DigiAssist AI, Akwaaba AI, and MEDD-SIM.',
};

const products = [
  {
    name: 'VanuConnect',
    tagline: 'Connect. Communicate. Grow.',
    description:
      'A comprehensive communication platform connecting Vanuatu businesses with customers through messaging, voice, and video. Designed for reliable connectivity even in low-bandwidth areas across the Pacific.',
    features: ['Multi-channel messaging', 'Voice & video calls', 'Business directory integration', 'Low-bandwidth optimized', 'End-to-end encryption'],
    color: 'from-blue-500 to-blue-700',
    icon: '📱',
    status: 'Live',
  },
  {
    name: 'VanuWay',
    tagline: 'Discover Local. Support Local.',
    description:
      'Vanuatu\'s premier business directory and service marketplace. VanuWay helps locals and tourists discover trusted businesses, book services, and support the local economy with ease.',
    features: ['Business listings & reviews', 'Service booking system', 'GPS-powered search', 'Verified business badges', 'Tourist-friendly interface'],
    color: 'from-green-500 to-green-700',
    icon: '🗺️',
    status: 'Live',
  },
  {
    name: 'Learn Bislama',
    tagline: 'Master the Language of Vanuatu.',
    description:
      'An interactive language learning app that helps visitors, expats, and newcomers master Bislama — the lingua franca of Vanuatu. Features AI-powered pronunciation coaching and cultural context lessons.',
    features: ['Interactive lessons', 'AI pronunciation coaching', 'Cultural context modules', 'Offline mode', 'Progress tracking & gamification'],
    color: 'from-purple-500 to-purple-700',
    icon: '📚',
    status: 'Live',
  },
  {
    name: 'Aelan Basket',
    tagline: 'Fresh from the Islands to Your Door.',
    description:
      'An e-commerce marketplace connecting local Vanuatu farmers, artisans, and small businesses directly with customers. Supporting local livelihoods while delivering fresh produce and handmade goods.',
    features: ['Local marketplace', 'Delivery management', 'Farmer & artisan profiles', 'Mobile money integration', 'Order tracking'],
    color: 'from-emerald-500 to-emerald-700',
    icon: '🧺',
    status: 'Beta',
  },
  {
    name: 'TrainerSim',
    tagline: 'Train Smarter. Perform Better.',
    description:
      'An AI-powered training simulation platform for sports coaches and athletes. TrainerSim uses machine learning to create personalized training programs and simulate game scenarios for improved performance.',
    features: ['AI training plans', 'Performance analytics', 'Game scenario simulation', 'Video analysis', 'Team management tools'],
    color: 'from-red-500 to-red-700',
    icon: '🏋️',
    status: 'Beta',
  },
  {
    name: 'DigiAssist AI',
    tagline: 'Your AI-Powered Business Partner.',
    description:
      'An intelligent AI assistant that helps businesses automate customer support, manage schedules, handle emails, and streamline daily operations. Built with advanced language models for natural conversations.',
    features: ['24/7 AI customer support', 'Email & calendar management', 'Multi-language support', 'Custom knowledge base', 'Integration with business tools'],
    color: 'from-orange-500 to-orange-700',
    icon: '🤖',
    status: 'Live',
  },
  {
    name: 'Akwaaba AI',
    tagline: 'Welcome to Intelligent Communication.',
    description:
      'AI-powered business communication platform designed for the African market. Akwaaba AI provides automated customer engagement through WhatsApp, SMS, and voice in local languages including Twi and Pidgin.',
    features: ['WhatsApp automation', 'Multi-language AI chatbot', 'SMS campaigns', 'Voice AI assistant', 'Customer insights dashboard'],
    color: 'from-yellow-500 to-yellow-700',
    icon: '🌍',
    status: 'Live',
  },
  {
    name: 'MEDD-SIM',
    tagline: 'Medical Education. Reimagined.',
    description:
      'A cutting-edge medical education and simulation platform that uses AI to provide realistic clinical scenarios for healthcare training. Used by medical schools and hospitals for student assessment and continuing education.',
    features: ['AI clinical simulations', 'OSCE exam preparation', 'Patient case generator', 'Performance scoring', 'Instructor dashboard'],
    color: 'from-teal-500 to-teal-700',
    icon: '🏥',
    status: 'Live',
  },
];

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-vibrant-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Products</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-4 mb-6">
            Built for the Pacific
            <span className="block text-vibrant-orange">& Beyond</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            A suite of innovative products designed to solve real challenges in the Pacific Islands and emerging markets worldwide.
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
                <div className={`h-2 bg-gradient-to-r ${product.color}`}></div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-5xl">{product.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-deep-blue font-heading">{product.name}</h3>
                        <p className="text-vibrant-orange text-sm font-medium">{product.tagline}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        product.status === 'Live'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {product.status}
                    </span>
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
