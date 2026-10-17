import Link from 'next/link';
import ArticleCard from './ArticleCard';
import type { BlogPost } from '@/lib/supabase';

export default function LatestArticles({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="section-padding bg-gray-50" aria-labelledby="latest-articles-heading" id="latest-articles">
      <div className="container-max">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div><p className="mb-3 text-sm font-semibold uppercase tracking-wider text-vibrant-orange">From the journal</p><h2 id="latest-articles-heading" className="font-heading text-3xl font-bold text-deep-blue md:text-4xl">Ideas for your next digital step</h2><p className="mt-3 max-w-2xl text-slate-600">Practical guides to websites, AI and business tools in Vanuatu and the Pacific.</p></div>
          <Link href="/blog" className="pwd-text-link">View all articles <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-article-grid>{posts.slice(0, 4).map(post => <ArticleCard key={post.id} post={post} />)}</div>
      </div>
    </section>
  );
}
