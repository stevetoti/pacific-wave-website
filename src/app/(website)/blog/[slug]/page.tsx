import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
  getPostBySlug,
  getRelatedPosts,
  getAllPublishedSlugs,
  extractHeadings,
  formatDate,
  calculateReadingTime,
  generateArticleSchema,
  generateBreadcrumbSchema,
  addInternalLinks,
} from '@/lib/blog';
import TableOfContents from '@/components/blog/TableOfContents';
import RelatedPosts from '@/components/blog/RelatedPosts';
import RelatedServices from '@/components/blog/RelatedServices';
import SocialShare from '@/components/blog/SocialShare';
import NewsletterCTA from '@/components/blog/NewsletterCTA';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Revalidate every 60 seconds
export const revalidate = 60;

// Allow dynamic paths (slugs not known at build time)
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found | Pacific Wave Digital',
    };
  }

  const publishedDate = post.published_at || post.created_at;
  const imageUrl = post.image_url?.startsWith('http')
    ? post.image_url
    : `https://pacificwavedigital.com${post.image_url}`;

  return {
    title: `${post.title} | Pacific Wave Digital`,
    description: post.excerpt || post.title,
    keywords: post.keywords?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      publishedTime: publishedDate,
      modifiedTime: post.updated_at,
      authors: ['Pacific Wave Digital'],
      images: post.image_url
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.image_url ? [imageUrl] : [],
    },
    alternates: {
      canonical: `https://pacificwavedigital.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await getRelatedPosts(post.id, post.category, 3);

  // Extract headings for TOC
  const headings = extractHeadings(post.content || '');

  // Generate JSON-LD schemas
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt || post.title,
    slug: post.slug,
    image: post.image_url || '/images/og-default.jpg',
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    authorName: 'Pacific Wave Digital',
    keywords: post.keywords,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(post.title, post.slug);

  const publishedDate = post.published_at || post.created_at;
  const readTime = post.read_time || calculateReadingTime(post.content || '');
  const wasUpdated = post.updated_at && post.updated_at !== post.created_at;
  
  // Process content with internal links for SEO
  const processedContent = addInternalLinks(post.content || '');

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-deep-blue to-dark-navy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/80 to-dark-navy/40"></div>
        </div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center text-sm text-blue-200">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">Home</Link>
                </li>
                <li className="mx-2">/</li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                </li>
                <li className="mx-2">/</li>
                <li className="text-vibrant-orange truncate max-w-xs">{post.title}</li>
              </ol>
            </nav>

            <div className="flex items-center flex-wrap gap-3 mb-6">
              <span className="bg-vibrant-orange text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                {post.category || 'Uncategorized'}
              </span>
              <span className="text-blue-200 text-sm">{formatDate(publishedDate)}</span>
              <span className="text-blue-200 text-sm">• {readTime}</span>
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
                <p className="text-white font-semibold">Pacific Wave Digital</p>
                <p className="text-blue-200 text-sm">Digital Innovation Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Keywords */}
              {post.keywords && post.keywords.length > 0 && (
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
              )}

              {/* Last Updated Notice */}
              {wasUpdated && (
                <div className="bg-blue-50 border-l-4 border-deep-blue px-4 py-3 mb-8 rounded-r-lg">
                  <p className="text-sm text-deep-blue">
                    <strong>Last Updated:</strong> {formatDate(post.updated_at)}
                  </p>
                </div>
              )}

              {/* Article Body */}
              <div className="prose prose-lg prose-deep-blue max-w-none">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h2: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');
                      return (
                        <h2 id={id} className="text-2xl md:text-3xl font-bold text-deep-blue font-heading mt-12 mb-6 scroll-mt-24">
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      const text = String(children);
                      const id = text
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');
                      return (
                        <h3 id={id} className="text-xl md:text-2xl font-bold text-deep-blue font-heading mt-8 mb-4 scroll-mt-24">
                          {children}
                        </h3>
                      );
                    },
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
                  {processedContent}
                </ReactMarkdown>
              </div>

              {/* Related Services */}
              <RelatedServices category={post.category} />

              {/* Newsletter CTA */}
              <NewsletterCTA />

              {/* Social Share */}
              <SocialShare title={post.title} slug={post.slug} />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <TableOfContents headings={headings} />
              )}

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-deep-blue to-dark-navy rounded-xl p-6 mt-8 sticky top-96">
                <h3 className="text-lg font-bold text-white font-heading mb-3">
                  Ready to Transform Your Business?
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Let&apos;s discuss how we can help your Pacific Island business thrive digitally.
                </p>
                <Link
                  href="/contact"
                  className="block w-full bg-vibrant-orange text-white text-center font-bold px-6 py-3 rounded-lg hover:bg-soft-orange transition-colors"
                >
                  Get Free Consultation
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <RelatedPosts posts={relatedPosts} />
    </>
  );
}
