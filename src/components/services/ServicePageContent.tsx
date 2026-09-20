'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInView from '@/components/animations/FadeInView';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import type { ServicePageData } from '@/lib/service-pages';

interface ServicePageContentProps {
  service: ServicePageData;
  relatedServices: Pick<ServicePageData, 'slug' | 'label' | 'icon' | 'cardDescription'>[];
}

export default function ServicePageContent({ service, relatedServices }: ServicePageContentProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy"></div>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-vibrant-orange/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <FadeInView>
              <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-vibrant-orange text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
                {service.heroBadge}
              </span>
            </FadeInView>

            <FadeInView delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-6">
                {service.h1}
              </h1>
            </FadeInView>

            <FadeInView delay={0.2}>
              <p className="text-xl text-blue-100 leading-relaxed mb-8">{service.heroSubtitle}</p>
            </FadeInView>

            <FadeInView delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Link href="/get-started" className="btn-primary text-lg !px-8 !py-4">
                  Get Started
                </Link>
                <Link href="/contact" className="btn-secondary text-lg !px-8 !py-4">
                  Talk to Us
                </Link>
              </div>
            </FadeInView>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 73.3C480 67 600 73 720 80C840 87 960 93 1080 90C1200 87 1320 73 1380 66.7L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-3xl mx-auto">
            {service.intro.map((paragraph, i) => (
              <FadeInView key={i} delay={i * 0.05}>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{paragraph}</p>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">
                Why Pacific Wave Digital
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
                {service.benefitsHeading}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">{service.benefitsIntro}</p>
            </div>
          </FadeInView>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.benefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <motion.div
                  className="h-full bg-white rounded-2xl p-8 border border-gray-100 hover:border-vibrant-orange/30 transition-colors shadow-sm"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <span className="text-2xl">{benefit.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-deep-blue font-heading mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-16">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Our Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">How We Work</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">{service.processIntro}</p>
            </div>
          </FadeInView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.process.map((item, i) => (
              <FadeInView key={item.step} delay={i * 0.1}>
                <motion.div
                  className="relative h-full text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:border-vibrant-orange/30 transition-colors"
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vibrant-orange to-soft-orange text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-deep-blue font-heading mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-12">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">FAQ</span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </FadeInView>

          <div className="max-w-3xl mx-auto space-y-6">
            {service.faqs.map((faq, i) => (
              <FadeInView key={faq.question} delay={i * 0.05}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-deep-blue font-heading mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </FadeInView>
            ))}
          </div>

          {service.furtherReading && (
            <FadeInView delay={0.2}>
              <div className="max-w-3xl mx-auto mt-10 text-center">
                <p className="text-gray-600">
                  Further reading:{' '}
                  <Link
                    href={service.furtherReading.href}
                    className="text-vibrant-orange font-semibold hover:underline"
                  >
                    {service.furtherReading.label}
                  </Link>
                </p>
              </div>
            </FadeInView>
          )}
        </div>
      </section>

      {/* Related services */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="text-center mb-12">
              <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">
                Related Services
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mt-3 mb-4">
                More Ways We Can Help
              </h2>
            </div>
          </FadeInView>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map((related) => (
              <StaggerItem key={related.slug}>
                <Link href={`/services/${related.slug}`} className="block h-full group">
                  <motion.div
                    className="h-full bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 group-hover:border-vibrant-orange/40 transition-colors"
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{related.icon}</span>
                      <h3 className="text-lg font-bold text-deep-blue font-heading group-hover:text-vibrant-orange transition-colors">
                        {related.label}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{related.cardDescription}</p>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vibrant-orange via-soft-orange to-vibrant-orange"></div>
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
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
              Tell us about your project and we&apos;ll come back with a clear, honest plan — no jargon, no
              obligation.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-vibrant-orange font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-xl text-lg"
              >
                Start Your Project
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
