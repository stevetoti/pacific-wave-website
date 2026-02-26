import { getPublishedPosts } from '@/lib/blog';

export async function GET() {
  const posts = await getPublishedPosts();
  
  const siteUrl = 'https://pacificwavedigital.com';
  const siteName = 'Pacific Wave Digital';
  const siteDescription = 'Expert insights on AI, web development, and digital transformation for Pacific Island businesses.';
  
  const rssItems = posts.map((post) => {
    const pubDate = new Date(post.published_at || post.created_at).toUTCString();
    const link = `${siteUrl}/blog/${post.slug}`;
    
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.category || 'Uncategorized'}]]></category>
      ${post.image_url ? `<enclosure url="${post.image_url.startsWith('http') ? post.image_url : siteUrl + post.image_url}" type="image/jpeg" />` : ''}
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteName} Blog</title>
    <link>${siteUrl}/blog</link>
    <description>${siteDescription}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/images/logo.png</url>
      <title>${siteName}</title>
      <link>${siteUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
