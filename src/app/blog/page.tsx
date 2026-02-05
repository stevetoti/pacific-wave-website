import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights, tutorials, and news from Pacific Wave Digital on AI, web development, digital transformation, and technology in the Pacific Islands.',
};

const posts = [
  {
    title: 'How AI is Transforming Business in the Pacific Islands',
    excerpt:
      'Artificial intelligence is no longer just a buzzword — it\'s reshaping how Pacific Island businesses operate, from automated customer service to predictive supply chain management.',
    category: 'AI & Innovation',
    date: 'January 15, 2025',
    readTime: '5 min read',
    image: '/images/ai-technology.jpg',
  },
  {
    title: 'Building Mobile Apps for Low-Bandwidth Environments',
    excerpt:
      'Internet connectivity in the Pacific can be challenging. Here\'s how we design mobile applications that work seamlessly even with limited bandwidth.',
    category: 'Development',
    date: 'January 8, 2025',
    readTime: '7 min read',
    image: '/images/mobile-app.jpg',
  },
  {
    title: 'Digital Transformation: A Guide for Pacific Island SMEs',
    excerpt:
      'Small and medium enterprises in the Pacific are uniquely positioned to leapfrog legacy systems. Learn how to start your digital transformation journey.',
    category: 'Digital Strategy',
    date: 'December 20, 2024',
    readTime: '6 min read',
    image: '/images/laptop-work.jpg',
  },
  {
    title: 'MEDD-SIM: Revolutionizing Medical Education with AI',
    excerpt:
      'How our AI-powered medical simulation platform is helping healthcare training institutions deliver better outcomes for students and patients alike.',
    category: 'Product Update',
    date: 'December 10, 2024',
    readTime: '4 min read',
    image: '/images/tech-office.jpg',
  },
  {
    title: 'The Rise of E-Commerce in Vanuatu: Opportunities and Challenges',
    excerpt:
      'Vanuatu\'s e-commerce landscape is growing rapidly. We explore the opportunities for local businesses and the infrastructure challenges that need to be addressed.',
    category: 'Industry Insights',
    date: 'November 28, 2024',
    readTime: '8 min read',
    image: '/images/business-handshake.jpg',
  },
  {
    title: 'Why Vanuatu is Becoming a Hub for Tech Innovation',
    excerpt:
      'With its strategic location, growing digital infrastructure, and supportive business environment, Vanuatu is attracting tech entrepreneurs from around the world.',
    category: 'Pacific Tech',
    date: 'November 15, 2024',
    readTime: '5 min read',
    image: '/images/pacific-sunset.jpg',
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-72 h-72 bg-vibrant-orange rounded-full blur-3xl"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-vibrant-orange font-semibold text-sm uppercase tracking-wider">Blog</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mt-4 mb-6">
            Insights &
            <span className="block text-vibrant-orange">Innovation</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Thoughts on technology, digital transformation, and building for the Pacific from our team.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={posts[0].image}
                alt={posts[0].title}
                width={600}
                height={400}
                className="object-cover w-full h-[400px]"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-vibrant-orange text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Featured
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-vibrant-orange text-sm font-semibold">{posts[0].category}</span>
                <span className="text-gray-400 text-sm">{posts[0].date}</span>
                <span className="text-gray-400 text-sm">{posts[0].readTime}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-blue font-heading mb-4">
                {posts[0].title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{posts[0].excerpt}</p>
              <Link href="#" className="btn-primary">
                Read Article
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <article key={post.title} className="bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-vibrant-orange text-xs font-semibold">{post.category}</span>
                    <span className="text-gray-400 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-deep-blue font-heading mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">{post.date}</span>
                    <Link href="#" className="text-vibrant-orange text-sm font-semibold hover:underline inline-flex items-center">
                      Read More
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-light-gray">
        <div className="container-max">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-deep-blue font-heading mb-4">Stay in the Loop</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter for the latest insights on technology, AI, and digital innovation in the Pacific.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-deep-blue/20 text-gray-800"
              />
              <button className="btn-primary !px-8">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
