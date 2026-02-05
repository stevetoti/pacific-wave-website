import Image from 'next/image';
import Link from 'next/link';

const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Web Development',
    description: 'Custom websites and web applications built with modern technologies for optimal performance and user experience.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Mobile Apps',
    description: 'Native and cross-platform mobile applications that deliver seamless experiences on iOS and Android.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Solutions',
    description: 'Intelligent automation, chatbots, and machine learning solutions that transform how businesses operate.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    title: 'Digital Marketing',
    description: 'Strategic digital marketing campaigns that drive growth, engagement, and measurable results.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Business Automation',
    description: 'Streamline operations with custom workflow automation, reducing costs and increasing efficiency.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    title: 'Cloud & Hosting',
    description: 'Reliable cloud infrastructure and hosting solutions optimized for Pacific Island connectivity.',
  },
];

const products = [
  {
    name: 'VanuConnect',
    description: 'A comprehensive communication platform connecting Vanuatu businesses with customers through messaging, voice, and video.',
    color: 'from-blue-500 to-blue-700',
    icon: '📱',
  },
  {
    name: 'VanuWay',
    description: 'Vanuatu\'s premier business directory and service marketplace, helping locals discover trusted businesses.',
    color: 'from-green-500 to-green-700',
    icon: '🗺️',
  },
  {
    name: 'Learn Bislama',
    description: 'An interactive language learning app that helps visitors and expats master Bislama, the lingua franca of Vanuatu.',
    color: 'from-purple-500 to-purple-700',
    icon: '📚',
  },
  {
    name: 'Aelan Basket',
    description: 'An e-commerce marketplace connecting local Vanuatu farmers and artisans directly with customers.',
    color: 'from-emerald-500 to-emerald-700',
    icon: '🧺',
  },
  {
    name: 'TrainerSim',
    description: 'AI-powered training simulation platform for sports coaches and athletes with personalized programs.',
    color: 'from-red-500 to-red-700',
    icon: '🏋️',
  },
  {
    name: 'DigiAssist AI',
    description: 'An AI-powered digital assistant that helps businesses automate customer support and streamline operations.',
    color: 'from-orange-500 to-orange-700',
    icon: '🤖',
  },
  {
    name: 'Akwaaba AI',
    description: 'AI-powered business communication platform for Africa with WhatsApp automation and local language support.',
    color: 'from-yellow-500 to-yellow-700',
    icon: '🌍',
  },
  {
    name: 'MEDD-SIM',
    description: 'A cutting-edge medical education and simulation platform using AI for realistic clinical training scenarios.',
    color: 'from-teal-500 to-teal-700',
    icon: '🏥',
  },
];

const testimonials = [
  {
    quote: 'Pacific Wave Digital transformed our business operations with their AI solutions. Our customer response time dropped by 80% and satisfaction scores are at an all-time high.',
    name: 'Marie Johnson',
    role: 'Operations Director, Island Resorts Group',
  },
  {
    quote: 'The VanuConnect platform has revolutionized how we communicate with our customers across the islands. It has been a game-changer for our business.',
    name: 'David Kalsakau',
    role: 'CEO, Vanuatu Trading Co.',
  },
  {
    quote: 'Their team understood our unique challenges as a Pacific Island government agency. The custom solution they built has modernized our entire citizen services.',
    name: 'Sarah Natuman',
    role: 'Director of Digital Services, Government of Vanuatu',
  },
];

const stats = [
  { value: '50+', label: 'Projects Delivered' },
  { value: '25+', label: 'Active Clients' },
  { value: '4', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-pacific.jpg"
            alt="Pacific Ocean Aerial View"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-navy/95 via-deep-blue/85 to-deep-blue/70"></div>
        </div>
        <div className="relative z-10 container-max section-padding">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-8 border border-white/20">
              <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
              Based in Port Vila, Vanuatu — Serving the Pacific and Beyond
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white font-heading leading-tight mb-6">
              Digital Innovation
              <span className="block text-vibrant-orange">for the Pacific</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed max-w-2xl">
              We build AI-powered solutions, modern websites, and mobile apps that empower Pacific Island businesses to thrive in the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-primary text-lg !px-10 !py-4">
                Start Your Project
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/portfolio" className="btn-secondary text-lg !px-10 !py-4">
                View Our Work
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 73.3C480 67 600 73 720 80C840 87 960 93 1080 90C1200 87 1320 73 1380 66.7L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white -mt-1">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-100">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-deep-blue font-heading">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">What We Do</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-blue font-heading mt-3 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Comprehensive digital solutions designed to help Pacific Island businesses compete and grow in the modern economy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="group bg-white p-8 rounded-2xl border border-gray-100 card-hover hover:border-vibrant-orange/20"
              >
                <div className="w-14 h-14 rounded-xl bg-pale-orange text-vibrant-orange flex items-center justify-center mb-6 group-hover:bg-vibrant-orange group-hover:text-white transition-colors duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-deep-blue mb-3 font-heading">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/services" className="btn-outline">
              View All Services
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Products</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-blue font-heading mt-3 mb-4">
              Built for the Pacific
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our suite of products is designed to address the unique needs of Pacific Island communities and businesses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-2xl overflow-hidden card-hover border border-gray-100"
              >
                <div className={`h-3 bg-gradient-to-r ${product.color}`}></div>
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-4xl">{product.icon}</span>
                    <h3 className="text-2xl font-bold text-deep-blue font-heading">{product.name}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn-outline">
              Explore All Products
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/about-team.jpg"
                  alt="Pacific Wave Digital team at work"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[400px]"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-vibrant-orange text-white p-6 rounded-2xl shadow-xl hidden md:block">
                <div className="text-3xl font-bold font-heading">10+</div>
                <div className="text-sm">Years of Innovation</div>
              </div>
            </div>
            <div>
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-6">
                Pioneering Digital Innovation in the Pacific
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Founded in Port Vila, Vanuatu, Pacific Wave Digital is at the forefront of bringing world-class digital solutions to the Pacific region. We combine global expertise with deep local knowledge to create technology that truly serves our communities.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Led by Stephen Totimeh, our team of developers, designers, and AI specialists work tirelessly to bridge the digital divide and empower businesses across the Pacific Islands.
              </p>
              <Link href="/about" className="btn-primary">
                Learn Our Story
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding gradient-blue">
        <div className="container-max">
          <div className="text-center mb-16">
            <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mt-3 mb-4">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-vibrant-orange" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-blue-100 mb-6 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-blue-300 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="relative bg-gradient-to-br from-vibrant-orange to-soft-orange rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Let&apos;s discuss how Pacific Wave Digital can help you leverage technology to achieve your business goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 bg-white text-vibrant-orange font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg text-lg">
                  Get in Touch
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/services" className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-vibrant-orange transition-all duration-300 text-lg">
                  Our Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
