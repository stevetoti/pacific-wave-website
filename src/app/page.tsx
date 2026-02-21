'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInView from '@/components/animations/FadeInView';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import TechStack from '@/components/TechStack';

const services = [
  { title: 'Web Development', description: 'Custom websites and web applications built with modern technologies.', icon: '💻', gradient: 'from-blue-500 to-cyan-500' },
  { title: 'Mobile Apps', description: 'Native and cross-platform apps that deliver seamless experiences.', icon: '📱', gradient: 'from-purple-500 to-pink-500' },
  { title: 'AI Solutions', description: 'Intelligent automation and chatbots that transform your business.', icon: '🤖', gradient: 'from-orange-500 to-red-500' },
  { title: 'Digital Marketing', description: 'Strategic campaigns that drive growth and engagement.', icon: '📈', gradient: 'from-green-500 to-emerald-500' },
  { title: 'Business Automation', description: 'Streamline operations with custom workflow automation.', icon: '⚙️', gradient: 'from-indigo-500 to-purple-500' },
  { title: 'Cloud & Hosting', description: 'Reliable infrastructure optimized for Pacific connectivity.', icon: '☁️', gradient: 'from-cyan-500 to-blue-500' },
];

const products = [
  { name: 'VanuConnect', description: 'Communication platform for Vanuatu businesses.', color: 'from-blue-500 to-blue-700', icon: '📱' },
  { name: 'VanuWay', description: 'Business directory and marketplace for Vanuatu.', color: 'from-green-500 to-green-700', icon: '🗺️' },
  { name: 'Learn Bislama', description: 'Interactive language learning app for Bislama.', color: 'from-purple-500 to-purple-700', icon: '📚' },
  { name: 'MEDD-SIM', description: 'AI-powered medical education and simulation platform.', color: 'from-teal-500 to-teal-700', icon: '🏥' },
];

const testimonials = [
  { quote: 'Pacific Wave Digital transformed our operations. Customer response time dropped 80%!', name: 'Marie Johnson', role: 'Operations Director, Island Resorts Group', image: '👩‍💼' },
  { quote: 'VanuConnect revolutionized how we communicate with customers across the islands.', name: 'David Kalsakau', role: 'CEO, Vanuatu Trading Co.', image: '👨‍💼' },
  { quote: 'They understood our unique challenges and built a solution that modernized everything.', name: 'Sarah Natuman', role: 'Director of Digital Services, Govt of Vanuatu', image: '👩‍💻' },
];

const stats = [
  { value: '50+', label: 'Projects Delivered', icon: '🚀' },
  { value: '25+', label: 'Active Clients', icon: '🤝' },
  { value: '4', label: 'Countries', icon: '🌏' },
  { value: '99.9%', label: 'Uptime', icon: '⚡' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-digital-innovation.jpg"
            alt="Pacific Wave Digital - Modern tech team collaborating with digital dashboards"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-navy/95 via-deep-blue/85 to-deep-blue/70"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-vibrant-orange/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-40 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 container-max section-padding">
          <div className="max-w-4xl">
            <FadeInView>
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-8 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
                Trusted by 50+ Businesses Across the Pacific
              </motion.div>
            </FadeInView>
            
            <FadeInView delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white font-heading leading-tight mb-6">
                Transform Your Business
                <motion.span 
                  className="block bg-gradient-to-r from-vibrant-orange via-yellow-400 to-vibrant-orange bg-clip-text text-transparent bg-[length:200%_auto]"
                  animate={{ backgroundPosition: ['0% center', '200% center'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  with Digital Innovation
                </motion.span>
              </h1>
            </FadeInView>
            
            <FadeInView delay={0.2}>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed max-w-2xl">
                We build AI-powered solutions, modern websites, and mobile apps that empower Pacific Island businesses to thrive in the digital age.
              </p>
            </FadeInView>
            
            <FadeInView delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/contact" className="btn-primary text-lg !px-10 !py-4 inline-flex items-center">
                    Start Your Project
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/portfolio" className="btn-secondary text-lg !px-10 !py-4 inline-flex items-center">
                    View Our Work
                  </Link>
                </motion.div>
              </div>
            </FadeInView>
            
            {/* Animated Stats */}
            <FadeInView delay={0.4}>
              <div className="flex flex-wrap gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <motion.div 
                      className="text-3xl md:text-4xl font-bold text-white font-heading"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-blue-200 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </FadeInView>
          </div>
        </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 73.3C480 67 600 73 720 80C840 87 960 93 1080 90C1200 87 1320 73 1380 66.7L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Bar - Animated */}
      <section className="bg-white -mt-1 relative z-10">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-gray-100">
            {stats.map((stat, i) => (
              <FadeInView key={stat.label} delay={i * 0.1}>
                <motion.div 
                  className="text-center group cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{stat.icon}</div>
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-deep-blue font-heading"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, delay: i * 0.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                </motion.div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Enhanced */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">What We Do</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-blue font-heading mt-3 mb-4">
                Our Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Comprehensive digital solutions designed to help Pacific Island businesses compete and grow.
              </p>
            </div>
          </FadeInView>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <StaggerItem key={service.title}>
                <motion.div
                  className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                  whileHover={{ y: -10 }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span className="text-3xl">{service.icon}</span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-deep-blue mb-3 font-heading">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  
                  {/* Hover arrow */}
                  <motion.div
                    className="mt-4 text-vibrant-orange font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    Learn more
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          
          <FadeInView delay={0.3}>
            <div className="text-center mt-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/services" className="btn-outline inline-flex items-center">
                  View All Services
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Tech Stack */}
      <TechStack />

      {/* Products Section - Enhanced */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Products</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-blue font-heading mt-3 mb-4">
                Built for the Pacific
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Our suite of products addresses the unique needs of Pacific Island communities.
              </p>
            </div>
          </FadeInView>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product, i) => (
              <FadeInView key={product.name} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <motion.div
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 group"
                  whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                >
                  <div className={`h-2 bg-gradient-to-r ${product.color}`}></div>
                  <div className="p-8">
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.span 
                        className="text-5xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {product.icon}
                      </motion.span>
                      <h3 className="text-2xl font-bold text-deep-blue font-heading">{product.name}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                </motion.div>
              </FadeInView>
            ))}
          </div>
          
          <FadeInView delay={0.3}>
            <div className="text-center mt-12">
              <Link href="/products" className="btn-outline inline-flex items-center">
                Explore All Products
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInView direction="left">
              <div className="relative">
                <motion.div 
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/about-team.jpg"
                    alt="Pacific Wave Digital team at work"
                    width={600}
                    height={400}
                    className="object-cover w-full h-[400px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/30 to-transparent"></div>
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-6 -right-6 bg-gradient-to-br from-vibrant-orange to-soft-orange text-white p-6 rounded-2xl shadow-xl hidden md:block"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-4xl font-bold font-heading">10+</div>
                  <div className="text-sm">Years of Innovation</div>
                </motion.div>
              </div>
            </FadeInView>
            
            <FadeInView direction="right">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-6">
                Pioneering Digital Innovation in the Pacific
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Founded in Port Vila, Vanuatu, Pacific Wave Digital is at the forefront of bringing world-class digital solutions to the Pacific region.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Led by Stephen Totimeh, our team combines global expertise with deep local knowledge to create technology that truly serves our communities.
              </p>
              <motion.div whileHover={{ x: 5 }}>
                <Link href="/about" className="btn-primary inline-flex items-center">
                  Learn Our Story
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section className="section-padding bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-vibrant-orange/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
        
        <div className="container-max relative z-10">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Testimonials</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mt-3 mb-4">
                What Our Clients Say
              </h2>
            </div>
          </FadeInView>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeInView key={i} delay={i * 0.15}>
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10 h-full"
                  whileHover={{ y: -10, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, j) => (
                      <motion.svg
                        key={j}
                        className="w-5 h-5 text-vibrant-orange"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 + j * 0.1 }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </div>
                  <p className="text-blue-100 mb-6 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{t.image}</div>
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-blue-300 text-sm">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div
            className="relative bg-gradient-to-br from-vibrant-orange to-soft-orange rounded-3xl overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '30px 30px',
              }}
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"
                animate={{ scale: [1.2, 1, 1.2] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </div>
            
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <FadeInView>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mb-6">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                  Let&apos;s discuss how Pacific Wave Digital can help you leverage technology to achieve your business goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 bg-white text-vibrant-orange font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-xl text-lg">
                      Get in Touch
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/services" className="inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-vibrant-orange transition-all duration-300 text-lg">
                      Our Services
                    </Link>
                  </motion.div>
                </div>
              </FadeInView>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
