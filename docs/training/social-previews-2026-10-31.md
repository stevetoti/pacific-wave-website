# Public page and affiliate social previews

## 2026-10-31 — [Codex] Acceptance register
Owner screenshot: WhatsApp composer shows only pacificwavedigital.com for `/go/STEVETOTI?to=/vanuatu-training`. Request covers all courses and public pages. Before audit:44public routes; nine services plus service index/blog index/quote omit images; several pages inherit unrelated company OG/Twitter copy. Direct November dynamic PNG is healthy (200PNG1200x630); affiliate route only307 and records even preview-crawler clicks.

Implemented:33branded1200x630JPEGcards (<300KB each) generated from existing approved image assets and text; explicit complete OG/Twitter metadata for public pages, services, projects and courses; branded article fallback for missing/unsupported cover formats; generic private-course metadata/noindex; existing private and unlisted boundaries preserved. Share crawlers get200HTML with metadata in head directly at `/go`, no DB click/cookie writes. Humans retain307redirect, approved-affiliate lookup, one click and30day cookie; HEAD has no tracking write. Destinations retain strict training-only allowlist. Generated links include a stable version parameter to refresh external cached previews. Next HTML-limited bot list preserved and extended for additional messaging crawlers.

| ID | Criterion | Result |
|---|---|---|
| S1 | All sitemap/public pages have relevant OG/Twitter title, description, absolute image in crawler head | PASS:47 live public crawler heads +5 enrolment heads |
| S2 | Course cards match title, fee and offer; images fetch200 JPEG/PNG1200x630 without auth | PASS:33 live image files,1200×630 JPEG, all public200 |
| S3 | WhatsApp/Facebook/other preview bots get200 metadata on affiliate links; zero clicks/cookies | PASS: focused tests +20 live crawler cases |
| S4 | Normal affiliate visitor gets307, correct destination,30day cookie and one click | PASS: one synthetic live human click;307 and30day secure HttpOnly cookie |
| S5 | Unsafe destinations, unknown/private routes and unlisted BLP remain protected | PASS: focused tests +20 live crawler cases |
| S6 | Latest links retain affiliate code/destination and add refresh version | PASS: focused tests +20 live crawler cases |
| S7 | Existing public/training/SEO UI and sitemap routes remain functional | PASS:10 live desktop/mobile checks;6 opt-in/fixture checks skipped |
| S8 | Engineering gates, independent cold review, exact deployment identity and synthetic cleanup | PASS: build/8guards/type/lint/4tests; cold review; exact0014110; zero QA remnants |

Tenant: PWD Supabase rndegttgwtpkbjtvjgnc. Normal visitor tracking will use a temporary synthetic approved affiliate only; no real affiliate clicks, messages, payments or enrolments. Crawler requests never write. WhatsApp's own cache and preview display remain controlled by WhatsApp; raw crawler HTML/image fetches can be proven independently. No message will be sent to test previews. Independent reviewer /root/personal_program_acceptance audits original request and actual staged/live behaviour.

## 2026-10-31 — [Codex] Published evidence and handoff
Application0014110757af780b190484b6b0e9e23f0b0a426a, deployment dpl_7S77LJ4Tn3K3aRaEwsPoAdhvfkY5 is READY and the exact live apex alias. Previous app5a7adfc deployment dpl_3fAQR2YQqaR6wnkYBjRxvfQoY7fF is rollback. Complete source is `.deployment/quote-release-20261023` on `codex/november-december-cohort`; preserve this lineage. Clean tracked-only clone was used for deployment, without private QA fixture files or archive upload.

Before final delta, staged8edb passed44 public heads,29 used image files,20 crawler cases, normal synthetic referral and10 browser regressions. Final0014110 only fixes the legacy October enrolment preview canonical to the existing public catalogue, preserving the intentionally unavailable October programme page. Automatic review rejected a new publicly shareable staging link; no new share link was created. Final delta was verified privately with authenticated Vercel curl200 and correct canonical, then the exact build was promoted.

Final live audit:47 public page heads +5 course enrolment heads,33 distinct image files fetched200 as1200×630 JPEG,20 crawler cases, zero crawler/HEAD cookies or tracking writes, one normal synthetic click with correct307destination and30day cookie, unsafe destinations denied, private BLP metadata generic/noindex. Ten desktop/mobile public regressions passed; six opt-in/fixture-dependent checks skipped. Independent reviewer cold-checked the exact STEVETOTI WhatsApp link, three additional public pages and legacy October enrolment metadata on live; all passed with real image fetches. No normal real-affiliate clicks or messages sent. Temporary approved QA affiliate/user and test clicks removed; database zero-remnant check passed. No course, enrolment, commission, order or payment records changed.

Private raw receipts are outside the tracked deployment in `.deployment/social-previews-20261031/verified-pacificwavedigital.com.json` and `cleanup.json`. Public browser results are `/tmp/social-live-browser-results`.

Images use existing approved photographs/illustrations with branded navy/orange/white layouts. To update cards when prices/dates/copy change: edit the shared card manifest/course source as applicable, then run `node --import tsx scripts/generate-social-images.tsx`, inspect the1200×630 output and commit regenerated assets. Bump `socialVersion` with a matching generated directory for future cache refreshes. Blog WebP covers use the branded blog fallback for messaging compatibility. New links include `v=20261031`; old links still work but messaging apps may retain their old cached preview. No claim is made that an actual WhatsApp message/display was tested.
