import { supabase, BlogPost } from './supabase';

const SITE_ID = 'pwd';

// ==========================================
// READING TIME CALCULATION
// ==========================================

/**
 * Calculate estimated reading time based on word count
 * @param content - The content to analyze
 * @returns Formatted reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(content: string): string {
  // Strip HTML tags and markdown
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*_`~\[\]]/g, '')
    .trim();
  
  const words = plainText.split(/\s+/).filter(word => word.length > 0).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return `${minutes} min read`;
}

/**
 * Get word count from content
 */
export function getWordCount(content: string): number {
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*_`~\[\]]/g, '')
    .trim();
  
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

// ==========================================
// BLOG POST RETRIEVAL
// ==========================================

/**
 * Get all published blog posts ordered by date
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('site_id', SITE_ID)
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('site_id', SITE_ID)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }

  return data;
}

/**
 * Get a single post by ID (for previews)
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .eq('site_id', SITE_ID)
    .single();

  if (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }

  return data;
}

/**
 * Get related posts based on category
 * Falls back to recent posts if no category match
 */
export async function getRelatedPosts(
  currentPostId: string,
  category: string | null,
  limit: number = 3
): Promise<BlogPost[]> {
  // First try to get posts in the same category
  if (category) {
    const { data: categoryPosts, error: categoryError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('site_id', SITE_ID)
      .eq('published', true)
      .eq('category', category)
      .neq('id', currentPostId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!categoryError && categoryPosts && categoryPosts.length >= limit) {
      return categoryPosts;
    }

    // If we have some category posts but need more, get additional recent posts
    if (!categoryError && categoryPosts && categoryPosts.length > 0) {
      const remaining = limit - categoryPosts.length;
      const existingIds = categoryPosts.map(p => p.id);
      existingIds.push(currentPostId);

      const { data: recentPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('site_id', SITE_ID)
        .eq('published', true)
        .not('id', 'in', `(${existingIds.join(',')})`)
        .order('published_at', { ascending: false })
        .limit(remaining);

      return [...categoryPosts, ...(recentPosts || [])];
    }
  }

  // Fallback to recent posts
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('site_id', SITE_ID)
    .eq('published', true)
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all unique categories from published posts
 */
export async function getAllCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('site_id', SITE_ID)
    .eq('published', true)
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique categories
  const categorySet = new Set<string>();
  data?.forEach(p => {
    if (p.category) categorySet.add(p.category);
  });
  return Array.from(categorySet).sort();
}

/**
 * Get total count of published posts
 */
export async function getPostCount(): Promise<number> {
  const { count, error } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', SITE_ID)
    .eq('published', true);

  if (error) {
    console.error('Error fetching post count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get all published post slugs (for static generation)
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('site_id', SITE_ID)
    .eq('published', true);

  if (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }

  return data?.map(p => p.slug) || [];
}

// ==========================================
// CONTENT PARSING UTILITIES
// ==========================================

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extract H2 and H3 headings from markdown content for table of contents
 */
export function extractHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  
  // Match markdown headings (## and ###)
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate ID from text (slug-like)
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Add IDs to headings in content for anchor linking
 */
export function addHeadingIds(content: string): string {
  return content.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
    const id = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return `${hashes} ${text.trim()} {#${id}}`;
  });
}

// ==========================================
// INTERNAL LINKING
// ==========================================

/**
 * Add internal links to blog content for SEO
 * Links service-related terms to the services page
 */
export function addInternalLinks(content: string): string {
  // Map keywords to specific service section anchors
  // Uses HTML anchor tags since content is stored as HTML
  const linkMap: { pattern: RegExp; url: string }[] = [
    // Web Development - links to #web-development section
    { 
      pattern: /\b(web development|website development|web design)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/services#web-development'
    },
    // AI Solutions - links to #ai-solutions section
    { 
      pattern: /\b(AI automation|artificial intelligence|AI solutions|AI-powered)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/services#ai-solutions'
    },
    // Mobile Apps - links to #mobile-apps section
    { 
      pattern: /\b(mobile app development|mobile apps|app development)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/services#mobile-apps'
    },
    // Digital Marketing - links to #digital-marketing section
    { 
      pattern: /\b(digital marketing|SEO|search engine optimization)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/services#digital-marketing'
    },
    // Business Automation - links to #business-automation section
    { 
      pattern: /\b(business automation|workflow automation)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/services#business-automation'
    },
    // Cloud & Hosting - links to #cloud-hosting section
    { 
      pattern: /\b(cloud hosting|cloud infrastructure|managed hosting)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/services#cloud-hosting'
    },
    // Contact links
    { 
      pattern: /\b(contact us|get in touch|reach out|free consultation)\b(?![^<]*>|[^<]*<\/a>)/gi, 
      url: '/contact'
    },
  ];

  let processedContent = content;
  const linkedTerms = new Set<string>();

  // Only link each term once (first occurrence)
  for (const { pattern, url } of linkMap) {
    processedContent = processedContent.replace(pattern, (match) => {
      const lowerMatch = match.toLowerCase();
      if (linkedTerms.has(lowerMatch)) return match;
      linkedTerms.add(lowerMatch);
      // Use HTML anchor tag since content is stored as HTML
      return `<a href="${url}" class="text-vibrant-orange hover:text-soft-orange underline">${match}</a>`;
    });
  }

  return processedContent;
}

// ==========================================
// DATE FORMATTING
// ==========================================

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for ISO (used in JSON-LD)
 */
export function formatDateISO(dateString: string): string {
  return new Date(dateString).toISOString();
}

// ==========================================
// JSON-LD SCHEMA GENERATORS
// ==========================================

export interface ArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  keywords?: string[];
}

/**
 * Generate Article JSON-LD schema
 */
export function generateArticleSchema(props: ArticleSchemaProps): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.title,
    description: props.description,
    image: props.image.startsWith('http') 
      ? props.image 
      : `https://pacificwavedigital.com${props.image}`,
    datePublished: formatDateISO(props.datePublished),
    dateModified: formatDateISO(props.dateModified),
    author: {
      '@type': 'Organization',
      name: props.authorName,
      url: 'https://pacificwavedigital.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pacific Wave Digital',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pacificwavedigital.com/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://pacificwavedigital.com/blog/${props.slug}`,
    },
    keywords: props.keywords?.join(', '),
  };
}

/**
 * Generate Breadcrumb JSON-LD schema
 */
export function generateBreadcrumbSchema(postTitle: string, postSlug: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://pacificwavedigital.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://pacificwavedigital.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: postTitle,
        item: `https://pacificwavedigital.com/blog/${postSlug}`,
      },
    ],
  };
}
