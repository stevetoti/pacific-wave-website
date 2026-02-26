import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPublishedPosts, formatDate, calculateReadingTime } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog & Insights | Pacific Wave Digital',
  description: 'Expert insights on AI, web development, mobile apps, and digital transformation for Pacific Island businesses. Stay updated with the latest trends.',
  keywords: 'Pacific Island technology blog, Vanuatu digital marketing, AI business solutions Pacific, web development insights',
  openGraph: {
    title: 'Blog & Insights | Pacific Wave Digital',
    description: 'Expert insights on AI, web development, mobile apps, and digital transformation for Pacific Island businesses.',
    type: 'website',
    url: 'https://pacificwavedigital.com/blog',
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  // If no posts from Supabase, show empty state
  if (posts.length === 0) {
    return (
      <>
        {/* Hero */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy"></div>
          <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center py-20">
            <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-vibrant-orange text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
              Blog & Insights
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mb-6">
              Digital Innovation
              <span className="block bg-gradient-to-r from-vibrant-orange to-yellow-400 bg-clip-text text-transparent">
                Insights & Guides
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Expert insights on AI, web development, and digital transformation for Pacific Island businesses.
            </p>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-max text-center">
            <p className="text-gray-500 text-lg">No blog posts published yet. Check back soon!</p>
          </div>
        </section>
      </>
    );
  }

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-navy via-deep-blue to-dark-navy"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-vibrant-orange/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center py-20">
          <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-vibrant-orange text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-vibrant-orange rounded-full mr-2 animate-pulse"></span>
            Blog & Insights
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading mb-6">
            Digital Innovation
            <span className="block bg-gradient-to-r from-vibrant-orange to-yellow-400 bg-clip-text text-transparent">
              Insights & Guides
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Expert insights on AI, web development, and digital transformation for Pacific Island businesses.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              {featuredPost.image_url ? (
                <Image
                  src={featuredPost.image_url}
                  alt={featuredPost.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-[400px] group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-[400px] bg-gradient-to-br from-deep-blue to-dark-navy flex items-center justify-center">
                  <span className="text-6xl">📝</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/50 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="bg-vibrant-orange text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  Featured
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-4">
                <span className="bg-pale-orange text-vibrant-orange text-sm font-semibold px-3 py-1 rounded-full">
                  {featuredPost.category || 'Uncategorized'}
                </span>
                <span className="text-gray-400 text-sm">
                  {featuredPost.published_at ? formatDate(featuredPost.published_at) : formatDate(featuredPost.created_at)}
                </span>
                <span className="text-gray-400 text-sm">
                  • {featuredPost.read_time || calculateReadingTime(featuredPost.content || '')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-deep-blue font-heading mb-4 leading-tight">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{featuredPost.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {featuredPost.keywords?.slice(0, 3).map((kw) => (
                  <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {kw}
                  </span>
                ))}
              </div>
              <Link href={`/blog/${featuredPost.slug}`} className="btn-primary inline-flex items-center">
                Read Full Article
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Blog Grid */}
          {otherPosts.length > 0 && (
            <>
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-deep-blue font-heading">Latest Articles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                  <article 
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-full group hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {post.image_url ? (
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-deep-blue to-dark-navy flex items-center justify-center">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/30 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-pale-orange text-vibrant-orange text-xs font-semibold px-2 py-1 rounded-full">
                          {post.category || 'Uncategorized'}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {post.read_time || calculateReadingTime(post.content || '')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-deep-blue font-heading mb-3 line-clamp-2 group-hover:text-vibrant-orange transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-gray-400 text-xs">
                          {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                        </span>
                        <Link 
                          href={`/blog/${post.slug}`} 
                          className="text-vibrant-orange text-sm font-semibold hover:underline inline-flex items-center group-hover:gap-2 transition-all"
                        >
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
            </>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-gradient-to-br from-deep-blue to-dark-navy">
        <div className="container-max">
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
              <button className="bg-vibrant-orange text-white font-bold px-8 py-3 rounded-lg hover:bg-soft-orange transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-blue-300 text-xs mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </>
  );
}
