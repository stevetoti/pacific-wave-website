import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/blog/preview/'],
      },
    ],
    sitemap: 'https://pacificwavedigital.com/sitemap.xml',
  };
}
