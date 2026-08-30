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
