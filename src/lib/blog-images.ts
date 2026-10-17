import imageManifest from './blog-image-manifest.json';
import type { BlogPost } from './supabase';

const localImages: Record<string, string> = imageManifest;

export function getBlogCover(post: Pick<BlogPost, 'image_url' | 'title'>): string {
  const source = post.image_url?.trim();
  if (source && localImages[source]) return localImages[source];
  if (source?.startsWith('/') && !source.startsWith('//')) return source;
  if (source) {
    try {
      const url = new URL(source);
      if (url.protocol === 'https:' && (url.hostname === 'images.unsplash.com' || /\.supabase\.(co|in)$/.test(url.hostname))) return source;
    } catch { /* Use local editorial artwork for malformed sources. */ }
  }
  const topic = /ecommerce/i.test(post.title) ? 'commerce' : /AI |automation/i.test(post.title) ? 'ai' : /marketing|transformation/i.test(post.title) ? 'marketing' : 'web';
  return `/images/blog/${topic}-editorial.webp`;
}

export function withLocalBlogImages(post: BlogPost): BlogPost {
  const original = post.image_url;
  const cover = getBlogCover(post);
  let content = post.content || '';
  for (const [remote, local] of Object.entries(localImages)) content = content.replaceAll(remote, local);
  return { ...post, image_url: cover, image_alt: localImages[original] || !original ? 'Conceptual artwork illustrating ' + post.title : post.image_alt, content };
}
