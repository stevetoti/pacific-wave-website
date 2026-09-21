# Changelog — pacific-wave-website

## 2026-08-21 — [Claude Code] Diagnosed "site unreachable" report

- Symptom: pacificwavedigital.com and all subdomains unreachable from Stephen's current network (TLS connection reset on 443).
- **Root cause: NOT an outage.** The local network's firewall (Palo Alto-style block page, client LAN IP 10.86.101.225) blocks the domain with **Category: malware**. All subdomains inherit the domain-level block.
- Verified site is live globally: check-host.net nodes in DE/JP/CY/IR/RU all get HTTP 200 (apex) / 307 (www) from Vercel.
- Same-account control test: learnbislama.com loads fine from the same network → Vercel account healthy, block is domain-specific.
- Contributing factor (likely): whois Updated Date 2026-08-12 — nameservers are ns1/ns2.dns-parking.com (Hostinger parking DNS), not Cloudflare per company standard. Parking-DNS association likely triggered the malware/parked recategorization by the firewall vendor.
- Recommended fixes: request Palo Alto recategorization at urlfiltering.paloaltonetworks.com; ask network admin to whitelist; move DNS to Cloudflare per company standard.

## 2026-08-30 — [Claude Code] Search Console verification + dynamic sitemap

- Root layout (`src/app/layout.tsx`): added
  `verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }`
  to the metadata export.
- `src/app/sitemap.ts`: removed the 4 hardcoded (partly stale) blog slugs;
  the sitemap now fetches ALL published posts via `getPublishedPosts()`
  (same Supabase source as `/blog/sitemap.xml`), with try/catch fallback to
  the static pages on fetch error, and `revalidate = 3600` so new posts
  appear hourly without a redeploy. Verified locally: 21 URLs emitted
  (7 static + 14 published posts).
- Created gitignored `.env.local` with the public
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (project
  rndegttgwtpkbjtvjgnc) so local builds work — without them (and with no
  `SUPABASE_SERVICE_ROLE_KEY`/`OPENAI_API_KEY` in the shell) `npm run build`
  fails at "Collecting page data" on the api/help routes (pre-existing).
- Env var Stephen must set in Vercel: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- Committed on branch `seo/search-console-dynamic-sitemap` (off origin/main;
  the local `pwd-030-proof-production` branch has 12 unpushed marketing
  commits that were deliberately left unpublished).

## 2026-09-20 — [Claude Code] SEO service pages for commercial keywords

- Built 7 dedicated service pages under `/services/<slug>` (branch
  `seo/service-pages`, off origin/main) targeting the commercial Vanuatu
  keywords Google currently serves our blog posts for: web-design,
  web-development, software-development, digital-marketing, seo, ecommerce,
  mobile-apps.
- Implementation: one statically generated dynamic route
  `src/app/(website)/services/[slug]/page.tsx` (generateStaticParams +
  dynamicParams=false) driven by typed content in `src/lib/service-pages.ts`;
  shared client template `src/components/services/ServicePageContent.tsx`
  (hero + intro + benefits + process + FAQ + related-services + CTA to
  /get-started, same design language as the hub page). ~1,000 words of
  locally grounded copy per page; no invented clients/testimonials/stats.
- Each page: unique title (via root template → "<H1> | Pacific Wave
  Digital"), meta description, keywords, canonical, Service JSON-LD
  (provider = PWD org, areaServed Vanuatu) + FAQPage JSON-LD (4 Q&As).
- **Fixed duplicated-title bug**: root layout defines the title template
  `%s | Pacific Wave Digital`, but services/layout.tsx, blog/page.tsx and
  blog/[slug] generateMetadata appended the brand again → pages rendered
  "… | Pacific Wave Digital | Pacific Wave Digital". Now bare titles
  everywhere; services/layout.tsx re-declares the template because a
  plain-string title in an intermediate layout stops the root template
  propagating to child segments (verified in build output).
- Hub `/services` rewritten: 10 cards (7 link to their dedicated pages via
  linked H2 + "Explore …" button; AI Solutions / Business Automation /
  Cloud & Hosting remain in-page sections).
- `src/app/sitemap.ts`: 7 service URLs added to static entries (verified in
  built sitemap.xml). Footer services column → links to the 7 pages. Navbar:
  Services now has a desktop hover dropdown + collapsible mobile sub-menu.
- Further-reading links added to the matching live blog articles
  (web-development, digital-marketing, software-development, ecommerce).
- Verified: `npx tsc --noEmit` clean; `npm run build` succeeds (needs
  `SUPABASE_SERVICE_ROLE_KEY`/`OPENAI_API_KEY` set to any value locally —
  pre-existing module-level createClient in api/help routes; real values
  live in Vercel).
