# Public page and affiliate social previews

## 2026-10-31 — [Codex] Acceptance register
Owner screenshot: WhatsApp composer shows only pacificwavedigital.com for `/go/STEVETOTI?to=/vanuatu-training`. Request covers all courses and public pages. Before audit:44public routes; nine services plus service index/blog index/quote omit images; several pages inherit unrelated company OG/Twitter copy. Direct November dynamic PNG is healthy (200PNG1200x630); affiliate route only307 and records even preview-crawler clicks.

Implemented:33branded1200x630JPEGcards (<300KB each) generated from existing approved image assets and text; explicit complete OG/Twitter metadata for public pages, services, projects and courses; branded article fallback for missing/unsupported cover formats; generic private-course metadata/noindex; existing private and unlisted boundaries preserved. Share crawlers get200HTML with metadata in head directly at `/go`, no DB click/cookie writes. Humans retain307redirect, approved-affiliate lookup, one click and30day cookie; HEAD has no tracking write. Destinations retain strict training-only allowlist. Generated links include a stable version parameter to refresh external cached previews. Next HTML-limited bot list preserved and extended for additional messaging crawlers.

| ID | Criterion | Result |
|---|---|---|
| S1 | All sitemap/public pages have relevant OG/Twitter title, description, absolute image in crawler head | Pending stage/live |
| S2 | Course cards match title, fee and offer; images fetch200 JPEG/PNG1200x630 without auth | Local cards PASS; deployed pending |
| S3 | WhatsApp/Facebook/other preview bots get200 metadata on affiliate links; zero clicks/cookies | Unit PASS; deployed pending |
| S4 | Normal affiliate visitor gets307, correct destination,30day cookie and one click | Pending synthetic approved affiliate |
| S5 | Unsafe destinations, unknown/private routes and unlisted BLP remain protected | Unit PASS; deployed pending |
| S6 | Latest links retain affiliate code/destination and add refresh version | Unit PASS; deployed pending |
| S7 | Existing public/training/SEO UI and sitemap routes remain functional | Pending desktop/mobile |
| S8 | Engineering gates, independent cold review, exact deployment identity and synthetic cleanup | Pending |

Tenant: PWD Supabase rndegttgwtpkbjtvjgnc. Normal visitor tracking will use a temporary synthetic approved affiliate only; no real affiliate clicks, messages, payments or enrolments. Crawler requests never write. WhatsApp's own cache and preview display remain controlled by WhatsApp; raw crawler HTML/image fetches can be proven independently. No message will be sent to test previews. Independent reviewer /root/personal_program_acceptance audits original request and actual staged/live behaviour.
