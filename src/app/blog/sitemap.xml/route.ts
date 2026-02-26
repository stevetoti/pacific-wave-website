import { getPublishedPosts } from '@/lib/blog';

export async function GET() {
  const posts = await getPublishedPosts();
  
  const siteUrl = 'https://pacificwavedigital.com';
  
  const postUrls = posts.map((post) => {
    const lastmod = new Date(post.updated_at || post.created_at).toISOString();
    return `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${postUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
