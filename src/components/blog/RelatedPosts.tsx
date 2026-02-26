import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/lib/supabase';
import { formatDate, calculateReadingTime } from '@/lib/blog';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-max">
        <h2 className="text-2xl md:text-3xl font-bold text-deep-blue font-heading text-center mb-12">
          Related Articles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-48 overflow-hidden">
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
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
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-gray-400 text-xs">
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-vibrant-orange text-sm font-semibold hover:underline inline-flex items-center"
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
  );
}
