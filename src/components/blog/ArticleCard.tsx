import Link from 'next/link';
import BlogImage from './BlogImage';
import type { BlogPost } from '@/lib/supabase';
import { formatDate, calculateReadingTime } from '@/lib/blog';
import { getBlogCover } from '@/lib/blog-images';

export default function ArticleCard({ post }: { post: BlogPost }) {
  const href = `/blog/${post.slug}`;
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg" data-article-card>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant-orange" tabIndex={-1} aria-hidden="true">
        <BlogImage src={getBlogCover(post)} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-3 text-xs font-semibold text-vibrant-orange">{post.category || 'Insights'} <span className="font-normal text-slate-500"> · {post.read_time || calculateReadingTime(post.content || '')}</span></p>
        <h3 className="mb-3 line-clamp-3 text-lg font-bold leading-snug text-deep-blue font-heading"><Link href={href} className="hover:text-vibrant-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vibrant-orange">{post.title}</Link></h3>
        <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs">
          <time dateTime={post.published_at || post.created_at} className="text-slate-500">{formatDate(post.published_at || post.created_at)}</time>
          <Link href={href} aria-label={`Read article: ${post.title}`} className="font-semibold text-deep-blue hover:text-vibrant-orange">Read article <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </article>
  );
}
