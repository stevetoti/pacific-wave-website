import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPost, getAllBlogSlugs, blogPosts } from '@/lib/blog-data';
import ReactMarkdown from 'react-markdown';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found | Pacific Wave Digital',
    };
  }

  return {
    title: `${post.title} | Pacific Wave Digital`,
    description: post.metaDescription,
    keywords: post.keywords.join(', '),
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: [post.image],
    },
    alternates: {
      canonical: `https://pacificwavedigital.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (other posts in the same category, or just other posts)
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/80 to-dark-navy/40"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="max-w-4xl">
            <div className="flex items-center flex-wrap gap-3 mb-6">
              <span className="bg-vibrant-orange text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                {post.category}
              </span>
              <span className="text-blue-200 text-sm">{post.date}</span>
              <span className="text-blue-200 text-sm">• {post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-vibrant-orange rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">PW</span>
              </div>
              <div>
                <p className="text-white font-semibold">{post.author.name}</p>
                <p className="text-blue-200 text-sm">{post.author.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            {/* Keywords */}
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>

            {/* Article Body */}
            <div className="prose prose-lg prose-deep-blue max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-2xl md:text-3xl font-bold text-deep-blue font-heading mt-12 mb-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl md:text-2xl font-bold text-deep-blue font-heading mt-8 mb-4">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-bold text-deep-blue font-heading mt-6 mb-3">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-deep-blue">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-vibrant-orange pl-6 italic text-gray-600 my-6">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-50">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 text-left text-sm font-semibold text-deep-blue">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-100">
                      {children}
                    </td>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-vibrant-orange hover:text-soft-orange underline"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* CTA Section */}
            <div className="mt-12 p-8 bg-gradient-to-br from-deep-blue to-dark-navy rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-white font-heading mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Pacific Wave Digital helps businesses across Vanuatu, Fiji, and the Pacific Islands succeed in the digital age. Let&apos;s discuss how we can help you.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center bg-vibrant-orange text-white font-bold px-8 py-4 rounded-lg hover:bg-soft-orange transition-colors"
              >
                Get Your Free Consultation
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-4">Share this article:</p>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://pacificwavedigital.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-vibrant-orange hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://pacificwavedigital.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-vibrant-orange hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://pacificwavedigital.com/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-vibrant-orange hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <h2 className="text-2xl md:text-3xl font-bold text-deep-blue font-heading text-center mb-12">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.slug}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-pale-orange text-vibrant-orange text-xs font-semibold px-2 py-1 rounded-full">
                      {relatedPost.category}
                    </span>
                    <span className="text-gray-400 text-xs">{relatedPost.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-deep-blue font-heading mb-3 line-clamp-2 hover:text-vibrant-orange transition-colors">
                    <Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="text-vibrant-orange text-sm font-semibold hover:underline inline-flex items-center"
                  >
                    Read More
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center text-deep-blue font-semibold hover:text-vibrant-orange transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to All Articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
