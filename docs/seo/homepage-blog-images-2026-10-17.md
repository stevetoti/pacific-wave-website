# PWD homepage articles and blog images — 17 October 2026

Stephen requested recent articles on the homepage, smaller cards with four per desktop row, and repairs for every article image.

## Change

- Server-rendered four recent published articles on the homepage, refreshed with the existing 60-second blog cadence; full listing and related content share compact cards. Four desktop columns, two tablet columns, one mobile column, descriptive article links and visible focus.
- The full blog index uses the compact layout for all articles, replacing the oversized featured block. Related sections show four articles. Existing slugs, copy, publication dates, trust corrections and article canonicals remain.
- Audited all 14 published articles: 14 covers and 28 inline sources. All 42 origin URLs responded with image content, but the cover host v3b.fal.media is absent from Next image remotePatterns, causing rejected cover rendering. Repairs avoid opening the optimizer to arbitrary external hosts.
- Four original topic-specific conceptual artworks generated with built-in image_gen: website/software, AI workflows, ecommerce and marketing. Local WebP covers; all 28 inline images copied to stable local WebP paths. 32 assets total, approximately 1.9 MB combined. Generated artwork is illustrative, not client UI or measured results.
- Exact source-URL manifest resolves the existing CMS records at the shared read boundary, across homepage/list/detail/related/metadata/schema/preview. No CMS writes or customer record changes; originals remain available for reversal. For a different new CMS image URL the resolver honours supported local/approved remote sources or uses topic artwork; renderer recovers from a failed optimized cover to a local cover. Rollback source/assets together.

## Files and assets

- public/images/blog/{web,ai,commerce,marketing}-editorial.webp; 28 {post-id-prefix}-detail-{1,2}.webp assets.
- src/lib/blog-image-manifest.json; src/lib/blog-images.ts; reusable ArticleCard, BlogImage and LatestArticles components.
- Asset source provenance: docs/seo/blog-image-assets-2026-10-17.json. Original CMS/image audit and validation receipts retained in the GBP repo docs/seo.

## Validation and release

TypeScript, lint, production build/eight release guards and all 48 local responsive page checks pass (16 pages at 390/768/1440px). All cover/inline image decodes, 4/2/1 columns, no overflow and self-canonicals verified. No-JavaScript homepage and forced cover failure recovery pass. Mobile/desktop screenshots visually reviewed. Staging/live verification pending. Verify all 14 articles plus home/blog at phone/tablet/desktop sizes, image decode, 4/2/1 columns, no overflow, self-canonicals, no-JavaScript homepage articles and forced image failure recovery. Preserve GA/phone/enquiry/training configuration. No messages or Google writes; existing index monitor unchanged. Prior production dpl_BB62pibWtPBSGsj7bN5NewRKGjyj is rollback reference.
