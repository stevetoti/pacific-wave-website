import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog';

// Re-generate the sitemap at most once per hour so newly published
// blog posts appear without a redeploy.
export const revalidate = 3600;

const baseUrl = 'https://pacificwavedigital.com';

const staticPages: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${baseUrl}/services`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: `${baseUrl}/products`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/portfolio`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${baseUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch every published blog post from Supabase (same source as
  // /blog/sitemap.xml) so /blog/<slug> entries stay in sync automatically.
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    blogPosts = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    // Graceful fallback: on any fetch failure, still emit the static pages.
    console.error('sitemap: failed to fetch blog posts, emitting static pages only:', error);
  }

  return [...staticPages, ...blogPosts];
}
