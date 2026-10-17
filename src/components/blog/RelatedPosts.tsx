import Link from 'next/link';
import type { BlogPost } from '@/lib/supabase';
import ArticleCard from './ArticleCard';

export default function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return <section className="section-padding bg-gray-50"><div className="container-max"><h2 className="mb-8 text-2xl font-bold text-deep-blue font-heading md:text-3xl">Related articles</h2><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-article-grid>{posts.map(post => <ArticleCard key={post.id} post={post} />)}</div><div className="mt-8"><Link href="/blog" className="pwd-text-link">View all articles <span aria-hidden="true">↗</span></Link></div></div></section>;
}
