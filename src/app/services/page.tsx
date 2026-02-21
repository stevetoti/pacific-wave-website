'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInView from '@/components/animations/FadeInView';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import TechStack from '@/components/TechStack';
import CodeShowcase from '@/components/CodeShowcase';

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
    image: '/images/services/web-dev.jpg',
    fallbackImage: '/images/coding-screen.jpg',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '💻',
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
    image: '/images/services/mobile-apps.jpg',
    fallbackImage: '/images/mobile-app.jpg',
    gradient: 'from-purple-500 to-pink-500',
    icon: '📱',
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
    image: '/images/services/ai-solutions.jpg',
    fallbackImage: '/images/ai-technology.jpg',
    gradient: 'from-orange-500 to-red-500',
    icon: '🤖',
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
    image: '/images/services/digital-marketing.jpg',
    fallbackImage: '/images/digital-marketing.jpg',
    gradient: 'from-green-500 to-emerald-500',
    icon: '📈',
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
    image: '/images/services/automation.jpg',
    fallbackImage: '/images/tech-office.jpg',
    gradient: 'from-indigo-500 to-purple-500',
    icon: '⚙️',
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
    image: '/images/services/cloud-hosting.jpg',
    fallbackImage: '/images/cloud-server.jpg',
    gradient: 'from-cyan-500 to-blue-500',
    icon: '☁️',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero - Enhanced with animations */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-vibrant-orange/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5"></div>
        </div>

        <div className="relative container-max px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeInView>
                <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-vibrant-orange text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
                  Our Services
                </span>
              </FadeInView>
              
              <FadeInView delay={0.1}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-6">
                  Digital Solutions That
                  <span className="block bg-gradient-to-r from-vibrant-orange to-yellow-400 bg-clip-text text-transparent">
                    Drive Growth
                  </span>
                </h1>
              </FadeInView>
              
              <FadeInView delay={0.2}>
                <p className="text-xl text-blue-100 leading-relaxed mb-8">
                  From concept to deployment, we provide end-to-end digital services tailored for Pacific Island businesses and beyond.
                </p>
              </FadeInView>
              
              <FadeInView delay={0.3}>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className="btn-primary text-lg !px-8 !py-4">
                    Start Your Project
                  </Link>
                  <Link href="#services" className="btn-secondary text-lg !px-8 !py-4">
                    Explore Services
                  </Link>
                </div>
              </FadeInView>
            </div>

            <div className="hidden lg:block">
              <CodeShowcase />
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

      {/* Services Grid - Bento Style */}
      <section id="services" className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">What We Offer</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-blue font-heading mt-3 mb-4">
                Services Built for Success
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Comprehensive digital solutions designed to help Pacific Island businesses compete and grow in the modern economy.
              </p>
            </div>
          </FadeInView>

          <div className="space-y-32">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  {/* Service Icon */}
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-4xl">{service.icon}</span>
                  </motion.div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">{service.description}</p>
                  
                  <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature) => (
                      <StaggerItem key={feature}>
                        <div className="flex items-center space-x-3 text-gray-600 group">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                  
                  <motion.div whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Link href="/contact" className="btn-primary inline-flex items-center">
                      Get Started
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Gradient border glow */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500`}></div>
                    
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={600}
                        height={400}
                        className="object-cover w-full h-[400px] transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = service.fallbackImage;
                        }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-deep-blue/40 via-transparent to-transparent`}></div>
                      
                      {/* Floating badge */}
                      <motion.div
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                      >
                        <span className="text-sm font-semibold text-deep-blue">{service.icon} {service.title}</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <TechStack />

      {/* Process Section - Enhanced */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
                How We Work
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                A proven methodology that delivers results on time and within budget.
              </p>
            </div>
          </FadeInView>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'We listen to your goals, analyze your market, and define the project scope.', icon: '🔍' },
              { step: '02', title: 'Design', desc: 'Our designers create intuitive, beautiful interfaces that reflect your brand.', icon: '🎨' },
              { step: '03', title: 'Develop', desc: 'Our engineers build robust, scalable solutions using cutting-edge technologies.', icon: '⚡' },
              { step: '04', title: 'Deploy', desc: 'We launch, monitor, and continuously improve your digital solution.', icon: '🚀' },
            ].map((item, i) => (
              <FadeInView key={item.step} delay={i * 0.1}>
                <motion.div
                  className="relative text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-vibrant-orange/30 transition-colors group"
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Connection line */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-vibrant-orange to-transparent"></div>
                  )}
                  
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vibrant-orange to-soft-orange text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="text-sm text-vibrant-orange font-semibold mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-deep-blue font-heading mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Enhanced */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vibrant-orange via-soft-orange to-vibrant-orange"></div>
        
        {/* Animated background */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
              Let&apos;s discuss how we can bring your vision to life with the right digital solutions.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 bg-white text-vibrant-orange font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-xl text-lg">
                Contact Us Today
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </FadeInView>
        </div>
      </section>
    </>
  );
}
