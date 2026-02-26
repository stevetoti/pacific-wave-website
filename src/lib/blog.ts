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

/**
 * Auto-insert links to related blog articles based on keyword matching
 * Inserts up to maxLinks links to other articles
 */
export async function addRelatedArticleLinks(
  content: string,
  currentPostId: string,
  maxLinks: number = 3
): Promise<string> {
  // Fetch all published posts except current
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, keywords, category')
    .eq('site_id', SITE_ID)
    .eq('published', true)
    .neq('id', currentPostId);

  if (error || !posts || posts.length === 0) {
    return content;
  }

  const plainContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  let processedContent = content;
  let linksInserted = 0;
  const linkedSlugs = new Set<string>();

  // Check existing links in content to avoid duplicates
  const existingLinkRegex = /href=["']\/blog\/([^"']+)["']/g;
  let match;
  while ((match = existingLinkRegex.exec(content)) !== null) {
    linkedSlugs.add(match[1]);
  }

  // Score and sort posts by relevance
  const scoredPosts = posts.map(post => {
    let score = 0;
    const matchedTerms: string[] = [];

    // Check if any of the post's keywords appear in our content
    if (post.keywords && Array.isArray(post.keywords)) {
      for (const keyword of post.keywords) {
        if (keyword.length > 3 && plainContent.includes(keyword.toLowerCase())) {
          score += 10;
          matchedTerms.push(keyword);
        }
      }
    }

    // Check title words
    const titleWords = post.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
    for (const word of titleWords) {
      if (plainContent.includes(word)) {
        score += 3;
        matchedTerms.push(word);
      }
    }

    return { post, score, matchedTerms: Array.from(new Set(matchedTerms)) };
  })
  .filter(item => item.score > 0 && !linkedSlugs.has(item.post.slug))
  .sort((a, b) => b.score - a.score);

  // Insert links for top matches
  for (const { post, matchedTerms } of scoredPosts) {
    if (linksInserted >= maxLinks) break;
    
    // Find a good term to link (prefer longer, more specific terms)
    const sortedTerms = matchedTerms.sort((a, b) => b.length - a.length);
    
    for (const term of sortedTerms) {
      // Create a pattern that avoids already-linked text and HTML tags
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(
        `(?<!<[^>]*)\\b(${escapedTerm})\\b(?![^<]*>|[^<]*<\\/a>)`,
        'i'
      );
      
      if (pattern.test(processedContent)) {
        processedContent = processedContent.replace(pattern, (match) => {
          return `<a href="/blog/${post.slug}" class="text-vibrant-orange hover:text-soft-orange underline" title="Read: ${post.title}">${match}</a>`;
        });
        linksInserted++;
        linkedSlugs.add(post.slug);
        break;
      }
    }
  }

  return processedContent;
}

/**
 * Get suggestions for internal links to other blog posts
 */
export async function getInternalLinkSuggestions(
  content: string,
  currentPostId: string,
  category: string | null
): Promise<{ postId: string; title: string; slug: string; matchedKeywords: string[]; score: number }[]> {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, keywords, category')
    .eq('site_id', SITE_ID)
    .eq('published', true)
    .neq('id', currentPostId);

  if (error || !posts) return [];

  const plainContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();

  const suggestions = posts.map(post => {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Category match bonus
    if (category && post.category === category) {
      score += 20;
    }

    // Keyword matches
    if (post.keywords && Array.isArray(post.keywords)) {
      for (const keyword of post.keywords) {
        if (keyword.length > 3 && plainContent.includes(keyword.toLowerCase())) {
          score += 10;
          matchedKeywords.push(keyword);
        }
      }
    }

    // Title word matches
    const titleWords = post.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
    for (const word of titleWords) {
      if (plainContent.includes(word)) {
        score += 3;
        if (!matchedKeywords.includes(word)) matchedKeywords.push(word);
      }
    }

    return {
      postId: post.id,
      title: post.title,
      slug: post.slug,
      matchedKeywords,
      score,
    };
  })
  .filter(s => s.score > 5)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

  return suggestions;
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

/**
 * Generate ImageObject JSON-LD schema for SEO
 */
export interface ImageSchemaProps {
  url: string;
  caption: string;
  description?: string;
  width?: number;
  height?: number;
}

export function generateImageObjectSchema(props: ImageSchemaProps): object {
  const imageUrl = props.url.startsWith('http') 
    ? props.url 
    : `https://pacificwavedigital.com${props.url}`;
    
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: imageUrl,
    contentUrl: imageUrl,
    caption: props.caption,
    description: props.description || props.caption,
    width: props.width || 1200,
    height: props.height || 630,
    representativeOfPage: true,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Pacific Wave Digital',
    },
    creator: {
      '@type': 'Organization',
      name: 'Pacific Wave Digital',
    },
  };
}

/**
 * Extract and enhance images in content with SEO attributes
 */
export function enhanceImagesForSEO(content: string, focusKeyword?: string): string {
  // Add loading="lazy" and title attribute to images
  let enhanced = content.replace(
    /<img([^>]*)>/gi,
    (match, attributes) => {
      // Check if loading is already set
      if (!/loading=/i.test(attributes)) {
        attributes += ' loading="lazy"';
      }
      
      // Extract alt text to use as title if title missing
      const altMatch = attributes.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : '';
      
      if (!/title=/i.test(attributes) && alt) {
        attributes += ` title="${alt}"`;
      }
      
      return `<img${attributes}>`;
    }
  );
  
  return enhanced;
}
