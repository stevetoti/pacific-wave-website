/** Trusted local editorial assets: one cover and two useful supporting diagrams. */
export const SUPPORTING_ARTICLE_IMAGES = [
  { src: '/images/blog/website-project-workflow.svg', alt: 'Website planning workflow: customer task, content, mobile testing and ongoing ownership' },
  { src: '/images/blog/enquiry-review-checklist.svg', alt: 'Enquiry checklist: capture, response owner, verification and next-step confirmation' },
] as const;
export function articleImagePaths(cover: string): string[] {
  const paths = [cover, ...SUPPORTING_ARTICLE_IMAGES.map(image => image.src)];
  if (!cover.startsWith('/images/') || new Set(paths).size !== 3) throw new Error('Three distinct owned article images are required');
  return paths;
}
export function attachSupportingImages(content: string): string {
  if (SUPPORTING_ARTICLE_IMAGES.some(image => content.includes(image.src))) throw new Error('Supporting images already attached; review instead of duplicating');
  const figures = SUPPORTING_ARTICLE_IMAGES.map(image => `<figure><img src="${image.src}" alt="${image.alt}" width="1200" height="630" loading="lazy" /><figcaption>Illustrative planning checklist; adapt to your business and confirm responsibilities.</figcaption></figure>`);
  const sections = content.split(/(?=<h2\b)/i);
  if (sections.length < 4) throw new Error('Article needs substantive sections before inserting images');
  sections.splice(Math.floor(sections.length / 2), 0, figures[0]);
  sections.splice(sections.length - 1, 0, figures[1]);
  return sections.join('');
}
