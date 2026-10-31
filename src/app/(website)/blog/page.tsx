import { socialMetadata } from "@/lib/seo/social-metadata";
import BrandBackdrop from '@/components/BrandBackdrop';
import NewsletterCTA from '@/components/blog/NewsletterCTA';
import ArticleCard from '@/components/blog/ArticleCard';
import type { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog & Insights',
  description: 'Practical guides to AI, web development, mobile apps and digital transformation for businesses in Vanuatu and the Pacific.',
  keywords: 'Pacific Island technology blog, Vanuatu digital marketing, AI business solutions Pacific, web development insights',
  alternates: { canonical: 'https://pacificwavedigital.com/blog' },
  ...socialMetadata("/blog"),
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <section className="relative flex min-h-[40vh] items-center overflow-hidden">
        <BrandBackdrop tone="learning" />
        <div className="relative container-max px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-vibrant-orange">Blog &amp; Insights</p>
          <h1 className="mb-5 font-heading text-4xl font-bold text-white md:text-5xl">Ideas for a more connected business</h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-100">Practical guides to websites, AI and business tools in Vanuatu and the Pacific.</p>
        </div>
      </section>
      <section className="section-padding bg-gray-50" aria-labelledby="articles-heading">
        <div className="container-max">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3"><h2 id="articles-heading" className="font-heading text-2xl font-bold text-deep-blue md:text-3xl">Latest articles</h2>{posts.length > 0 && <p className="text-sm text-slate-500">{posts.length} articles · Latest first</p>}</div>
          {posts.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-article-grid>{posts.map(post => <ArticleCard key={post.id} post={post} />)}</div> : <p className="py-12 text-center text-slate-600">No articles are available right now. Please check back soon.</p>}
        </div>
      </section>
      <section className="section-padding"><div className="container-max"><NewsletterCTA /></div></section>
    </>
  );
}
