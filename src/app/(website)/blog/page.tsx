'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInView from '@/components/animations/FadeInView';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';

const posts = [
  {
    slug: 'ai-business-automation-pacific-islands-2025',
    title: 'AI Business Automation for Pacific Island Enterprises: A Complete Guide for 2025',
    excerpt:
      'Discover how AI-powered automation is transforming businesses across Vanuatu, Fiji, and the Pacific Islands. Learn practical strategies to implement chatbots, workflow automation, and intelligent systems that work even with limited internet connectivity.',
    category: 'AI Solutions',
    date: 'February 15, 2026',
    readTime: '8 min read',
    image: '/images/services/ai-solutions.jpg',
    keywords: ['AI automation Pacific', 'business automation Vanuatu', 'chatbots Pacific Islands'],
  },
  {
    slug: 'web-development-vanuatu-business-growth',
    title: 'Why Every Vanuatu Business Needs a Professional Website in 2025',
    excerpt:
      'In today\'s digital economy, a professional website is essential for business growth in Vanuatu. Learn why 78% of customers research online before making purchases, and how a modern website can increase your revenue by up to 40%.',
    category: 'Web Development',
    date: 'February 10, 2026',
    readTime: '6 min read',
    image: '/images/services/web-dev.jpg',
    keywords: ['web development Vanuatu', 'website design Port Vila', 'Pacific business website'],
  },
  {
    slug: 'mobile-app-development-pacific-islands',
    title: 'Mobile App Development for Pacific Island Businesses: Best Practices for Low-Bandwidth Success',
    excerpt:
      'Building mobile apps for the Pacific requires unique considerations. Learn how to create apps that work offline-first, minimize data usage, and deliver exceptional user experiences across Vanuatu, Fiji, Samoa, and beyond.',
    category: 'Mobile Development',
    date: 'February 5, 2026',
    readTime: '7 min read',
    image: '/images/services/mobile-apps.jpg',
    keywords: ['mobile app development Pacific', 'app developers Vanuatu', 'offshore development Pacific Islands'],
  },
  {
    slug: 'digital-marketing-strategies-pacific-smes',
    title: 'Digital Marketing Strategies That Work for Pacific Island SMEs',
    excerpt:
      'Stop wasting money on marketing that doesn\'t work. Discover proven digital marketing strategies specifically designed for small and medium businesses in Vanuatu, Fiji, and the Pacific Islands—including SEO, social media, and Google Ads tactics.',
    category: 'Digital Marketing',
    date: 'January 28, 2026',
    readTime: '10 min read',
    image: '/images/services/digital-marketing.jpg',
    keywords: ['digital marketing Vanuatu', 'SEO Pacific Islands', 'social media marketing Fiji'],
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy"></div>
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-vibrant-orange/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center py-20">
          <FadeInView>
            <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-vibrant-orange text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
              Blog & Insights
            </span>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mb-6">
              Digital Innovation
              <span className="block bg-gradient-to-r from-vibrant-orange to-yellow-400 bg-clip-text text-transparent">
                Insights & Guides
              </span>
            </h1>
          </FadeInView>
          <FadeInView delay={0.2}>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Expert insights on AI, web development, and digital transformation for Pacific Island businesses.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Featured Post */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <FadeInView>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl group"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={posts[0].image}
                  alt={posts[0].title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-[400px] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/50 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-vibrant-orange text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    Featured
                  </span>
                </div>
              </motion.div>
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-4">
                  <span className="bg-pale-orange text-vibrant-orange text-sm font-semibold px-3 py-1 rounded-full">{posts[0].category}</span>
                  <span className="text-gray-400 text-sm">{posts[0].date}</span>
                  <span className="text-gray-400 text-sm">• {posts[0].readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-deep-blue font-heading mb-4 leading-tight">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{posts[0].excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {posts[0].keywords.map((kw) => (
                    <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
                <motion.div whileHover={{ x: 5 }}>
                  <Link href={`/blog/${posts[0].slug}`} className="btn-primary inline-flex items-center">
                    Read Full Article
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </div>
          </FadeInView>

          {/* Blog Grid */}
          <FadeInView>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-deep-blue font-heading">Latest Articles</h2>
            </div>
          </FadeInView>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <StaggerItem key={post.slug}>
                <motion.article 
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-full group"
                  whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/30 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-pale-orange text-vibrant-orange text-xs font-semibold px-2 py-1 rounded-full">{post.category}</span>
                      <span className="text-gray-400 text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-deep-blue font-heading mb-3 line-clamp-2 group-hover:text-vibrant-orange transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-gray-400 text-xs">{post.date}</span>
                      <Link href={`/blog/${post.slug}`} className="text-vibrant-orange text-sm font-semibold hover:underline inline-flex items-center group-hover:gap-2 transition-all">
                        Read More
                        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-gradient-to-br from-deep-blue to-dark-navy">
        <div className="container-max">
          <FadeInView>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white font-heading mb-4">Stay Ahead of the Curve</h2>
              <p className="text-blue-200 mb-8">
                Get weekly insights on AI, digital transformation, and business growth strategies delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-vibrant-orange text-gray-800"
                />
                <motion.button 
                  className="bg-vibrant-orange text-white font-bold px-8 py-3 rounded-lg hover:bg-soft-orange transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-blue-300 text-xs mt-4">No spam. Unsubscribe anytime.</p>
            </div>
          </FadeInView>
        </div>
      </section>
    </>
  );
}
