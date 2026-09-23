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

## 2026-09-15 — [Codex] Readiness review

- Production build fails collecting `/api/help/search`: `supabaseKey is required`; compilation and type checking pass, lint has five warnings.
- Confirmed source-level API authorization gaps and lead forms that falsely report success. No production mutations or email sends performed.
- Dependency audit reports 7 affected production packages (1 critical, 5 high, 1 moderate).
- Detailed evidence and remaining checks: `docs/readiness-2026-09-15.md`.
- Moved existing project instructions to CLAUDE.md and made AGENTS.md a thin pointer; created missing shared decisions/todo files. Memory CLI unavailable due to missing numpy.

## 2026-09-15 — [Codex] Readiness repairs in progress

- Added API role/site authorization, lazy server clients, validated lead/newsletter persistence, honest failure states, private Google credential storage and single-use OAuth state.
- Restored reviewed SEO changes; removed placeholder homepage videos; upgraded through Next 15 to Next 16.3.5 / React 19.3.0. npm install currently reports zero vulnerabilities.
- Verified production Vercel project prj_DuwpSNfiGkHmLB2n5dJLaWmoZKde uses rndegttgwtpkbjtvjgnc, with admin site pacific-wave-digital and content site pwd. Production env pulled to gitignored .env.production.local.
- Migration prepared but NOT applied: available management token gets 403; Stephen will provide an authorized token.

## 2026-09-15 — [Codex] Local readiness verification complete; live release awaits token

- Final Next 16.3.5 production build succeeds; lint clean; 14 Node/PostgreSQL tests and 12 desktop/mobile Playwright tests pass. Full npm audit zero vulnerabilities.
- Browser flows cover contact, newsletter failures, six-step inquiry failure/retry, nine public/admin entry routes and anonymous rejection for privileged APIs. Submission/email responses are mocked; no test emails or real leads created.
- PGlite migration/RLS test confirms repeatability, PWD protection and unchanged access for other tenants. Live constraints/RLS still need management preflight.
- Removed tracked expired .env.vercel token, added safe .env.example. Canonical current handoff: docs/RELEASE-READINESS.md.
- Stephen replied that he will provide a new token. No authorized token has been received yet. No migration, Edge Function deployment, production deployment, commits or pushes performed.

## 2026-09-15 — [Codex] Live database repairs applied

- New local management token verified; reviewed production constraints, policies, and RLS flags before applying the migration successfully. Metadata snapshot is in gitignored `.deployment/`.
- Deployed seo-analyze-content, seo-generate-meta, and seo-keyword-research with active PWD admin/editor authorization.
- Production application release is building with `--skip-domain`; live alias remains unchanged pending verification.

## 2026-09-15 — [Codex] Production release promoted

- Released dpl_3aY4qGttCgbUGnh5mFtCJMLUf5KQ to pacificwavedigital.com after staged homepage/help/auth checks.
- Corrected a live legacy newsletter schema collision with dedicated pwd_newsletter_subscribers; existing subscriber rows preserved. Added compatibility migration and regression coverage.
- Ten live security checks and rolled-back admin transcript/service lead/newsletter writes pass. Live newsletter API persistence verified and test row deleted.
- Google client credentials/refresh token preserved in private storage. Optional alert recipient and Search Console code remain unset. Interactive login, Google refresh, real email and paid provider operations are not yet certified.
- Source remains uncommitted/unpushed; no marketing changes. Deployment excludes marketing/local secrets and verification artifacts.

## 2026-09-15 — [Codex] Live wizard hydration correction

- First live browser run passed 10/12 checks and caught pre-hydration project-type clicks being lost on desktop and mobile. Added a disabled fieldset until React mounts so controls cannot accept input before event handlers are ready. Fix release is building; retest pending.

## 2026-09-15 — [Codex] Final live verification passed

- Final production deployment dpl_5QiQSCyiizuResfNZZRrxZjWHkrn: all 12 desktop/mobile checks pass against pacificwavedigital.com, including the previously failing wizard. Build/lint and 14 Node/PostgreSQL tests pass.
- Current release report updated. Optional alert email/Search Console code remain unset; real interactive admin/Google/email/paid-provider checks remain explicitly unverified.
- Persistent-memory CLI still unavailable (missing numpy); shared markdown handoff is up to date.

## 2026-09-15 — [Codex] Vanuatu training implementation

- Read full owner-supplied website-agent-handoff.md from Training Hub. Scope: existing site landing page, durable registration, admin management and tested preview; no production promotion or real student/company test emails.
- October cohort only; VUV 35,000, 12 sessions in Pacific/Efate, three free Pro months. Preserve company-wide contacts and use course-specific contacts.

## 2026-09-15 — [Codex] Training preview and integration verification

- Preview dpl_FTnoLXxi1HRTNXA3goKfUmtpuifG built successfully using deployment-specific credentials; no production promotion and no persistent preview environment changes.
- Real synthetic Port Vila/Santo/Pentecost registrations were durably saved; student/internal emails accepted by the Resend sandbox. Existing admin login verified with an isolated temporary admin. Temporary test fixtures cleaned up after an earlier timeout.
- Desktop/mobile rendering, validation, failure/retry, privacy and anonymous API checks pass. Final admin export/status and social image route verification ongoing.

## 2026-09-15 — [Codex] Vanuatu training preview complete

- Final preview: https://pacific-wave-website-fnfd25myj-pacificwaveprojects.vercel.app/vanuatu-training (dpl_D5LoJ99TmDLvS4WTEYzNKa3DJWfz). Production remains unchanged.
- 21 deployed desktop/mobile browser checks passed, one intentionally skipped duplicate mobile DB test. Includes existing site regression checks and complete synthetic registration/admin/filter/status/export flow. All 27 Node/PostgreSQL tests pass; lint/build pass.
- Both registration email templates accepted by delivered@resend.dev. No real applicants or company inboxes contacted. Direct anonymous database access blocked. Synthetic records/admin profiles cleaned up.
- Full implementation/deployment/owner-input handoff: docs/VANUATU-TRAINING-HANDOFF.md. For an approved launch, create a fresh production deployment with TRAINING_EMAIL_MODE=live; do not promote this sandbox preview.
- All work stays uncommitted/unpushed alongside earlier repairs. No marketing changes.

## 2026-09-15 — [Codex] Training centre implementation started

- Stephen approved the landing preview and authorized the full LMS for October advertising: student accounts, bank/Stripe checkout, private proof review, course/calendar/video/quiz authoring and dashboard.
- Bank details and Stripe connection requested; implementation proceeds with unavailable methods visibly disabled until configured. Preserve live registrations and other tenants.

## 2026-09-15 — [Codex] LMS database and student workflow verified

- Applied dedicated RLS-protected LMS schema, seeded October course and 12 session placeholders, private proof bucket, notification outbox and payment leases. Existing storage policies do not expose the proof bucket.
- Shared Supabase has public signup disabled; verified a training-specific admin-generated signup link and token verification using an immediately deleted synthetic account, without changing shared auth settings.
- Real browser workflow passed: student signin/order, private PNG proof upload, unpaid content denial, cross-user denial, admin bank approval, answer-key hiding, quiz failure/retry and persisted progress. QA mail remains Resend sandbox only.
- Stripe keys absent; bank details pending. No production LMS deployment yet.

## 2026-09-15 — [Codex] Final email and cleanup verification

Repeated the full synthetic workflow with a database assertion that the new notification was accepted by the Resend sandbox; passed. Cleanup verification reports zero leftover synthetic courses or accounts. Local production server remains on port 3100 for review; Codex browser open was queued. Hosted preview is still blocked pending explicit credential-transfer approval.

## 2026-09-15 — [Codex] Owner bank details and shared Stripe account

- Read/visually verified Pacific-Wave-Digital-Accounts.pdf. Owner authorized VUV accounts only and reusing Digi Assist Stripe details.
- Located live Stripe key in Digiassist AI .env.local; copied only the secret API key into this repo's ignored production env. Existing Digi Assist webhook secret is not reusable for a new endpoint.
- Read-only Stripe verification: US merchant Global Digital Prime, Inc.; charges/payouts enabled; VUV supported. Added merchant disclosure and isolated payment metadata to avoid collisions with Digi Assist's order IDs. Shared account/webhooks remain otherwise unchanged.

## 2026-09-15 — [Codex] Bank/Stripe configuration verified

Saved and verified only the two VUV bank accounts. Created a dedicated Stripe webhook and disabled it until release; signing secret stays in ignored local env. An unpaid live VUV 35,000 Checkout Session was successfully created and immediately expired. No card details or charge. Lint, network-enabled production build and all 30 code/database tests pass. Preview live-card use is gated off by TRAINING_PAYMENTS_MODE. No Vercel deploy attempted; earlier explicit Supabase/Resend transfer approval remains pending.

## 2026-09-15 — [Codex] Production deployment authorized

Stephen explicitly replied “yes deploy now” to the credential/deployment approval request. This resolves the previous automatic-review approval blocker. Production-only Vercel variables have been configured; a fresh production build with live email/payment flags is in progress using --skip-domain. Verify before promotion, then activate the dedicated Stripe webhook.

## 2026-09-15 — [Codex] Training centre live release complete

Owner explicitly authorized deployment. Production deployment `dpl_GDMQGXbLDezkkBkjpdtmSiNZ1a3W` (https://pacific-wave-website-82c1vo9ba-pacificwaveprojects.vercel.app) is promoted to https://pacificwavedigital.com. Production-only Supabase/Resend/Stripe settings are persisted in Vercel; TRAINING_EMAIL_MODE and TRAINING_PAYMENTS_MODE are live. Dedicated PWD Stripe webhook is enabled. The previous automatic-review credential-transfer blocker is resolved.

Public catalogue verification confirms live email/card flags, only ANZ/BRED VUV accounts, and the October VUV 35,000 course. All 20 live desktop/mobile regression checks passed; two transactional integration runs were deliberately skipped on live email settings. Earlier synthetic bank-proof/approval/quiz/admin flow and sandbox email acceptance passed; a VUV 35,000 Stripe checkout was created/expired unpaid. No actual card payment or real inbox delivery was certified in this release.

Public URLs: /training-center, /vanuatu-training. Admin: /admin/training-center. Source remains uncommitted/unpushed alongside prior work.

## 2026-09-15 — [Codex] Student account visual redesign

Owner requested two-column sign-in/signup with student photography on the left and form on the right. Implemented a shared split layout using the existing Pacific student image, navy overlay, orange accent, refined full-width form button, and a compact photo header on mobile. Authentication/payment logic is unchanged. Verification and release in progress.

## 2026-09-15 — [Codex] Split account design published

Published `dpl_4hVMN7LorqANfAWf1QT2fSZHo9Jg` (https://pacific-wave-website-b5ikxteog-pacificwaveprojects.vercel.app). Sign-in/signup/recovery share a student-photo left panel and refined right form; mobile stacks a compact photo cover over the form. Contact widgets are suppressed only on the account route to avoid covering fields/buttons. No auth/payment logic or database changes. Local and Vercel builds, lint and TypeScript pass; local desktop/mobile screenshots inspected. Localhost:3100 was restarted with the same design.

## 2026-09-15 — [Codex] Single training header correction

Removed the overlapping website navigation from training-centre routes via a route-aware website frame, including its fixed-header spacing. The training navigation now includes Main website, courses, and student access; mobile links wrap below the brand. Other website routes retain their existing header. Verifying before release.

## 2026-09-15 — [Codex] Single header published

Published dpl_5B7jr7fNcybC7FoLojTQKgT9Rgd7 (pacific-wave-website-avxn44ehu-pacificwaveprojects.vercel.app). Lint, production build/TypeScript passed. Desktop 1440px and mobile 390px browser checks confirmed one training nav, no obsolete top spacer, no horizontal overflow, and working client navigation back to the normal website header. Full viewport screenshots inspected. Staged catalogue/payment configuration verified unchanged. Local preview remains at port 3100.

## 2026-09-15 — [Codex] Three-course catalogue and mentorship build

Owner requested image cards, three desktop columns, a coming-soon business course and a live three-month one-on-one programme at VUV 25,000 total. Added dedicated public programme pages/curriculum and enrollment links. Implementing per-enrolment lesson assignment and private MP4/WebM recordings with ownership-checked playback; unlisted YouTube is not used for private mentorship. Existing bank/Stripe flow reused. Verification and release pending.

## 2026-09-15 — [Codex] Programme expansion published

Production `dpl_3iPdw693jcbEJckYiwUdBPs4LEEa` (`pacific-wave-website-kat564u07-pacificwaveprojects.vercel.app`) promoted. Three image cards and both programme detail pages are live; mentorship checkout is VUV 25,000 total for three months, with existing ANZ/BRED and Stripe. Confirmed live app-created Stripe checkout uses the correct course name/currency/amount, then expired it unpaid and removed QA data. No charge/email sent. 31 code/SQL checks, lint and production build pass; private storage/upload/cross-student/refund checks passed against isolated fixtures. Desktop/mobile visuals inspected. See docs/TRAINING-CENTER-HANDOFF.md for admin session/recording workflow. Source still uncommitted/unpushed.

Final live regression: 22 desktop/mobile public browser checks passed; two transactional tests intentionally skipped on live email configuration. — [Codex] 2026-09-15.

## 2026-09-15 — [Codex] Owner corrected mentorship offer

Stephen corrected total price from VUV 25,000 to VUV 250,000 and added one software project built during the programme plus three free months of Digi Assist AI Pro. Updated live course record and site/checkout copy; existing order amounts are preserved. Deploy/verification in progress.

## 2026-09-15 — [Codex] Corrected offer released and verified

Published dpl_9i7pouPTtVAi4mgSrSXMJVL3C2iL. Catalogue confirms VUV 250,000 and both inclusions. Live Stripe checkout verified at VUV 250,000, expired unpaid; fixtures removed. Desktop/mobile checkout tests passed on retry after transient network timeouts. Lint/TypeScript and Vercel production build passed. No existing mentorship orders at correction; no actual payment taken or email sent by QA.

## 2026-09-15 — [Codex] Course communities and account email repair

Owner requested group-course communities and smaller groups, plus missing-email diagnosis and modern course recommendations. Confirmed steve@ account already verified since January; old signup returned success on email_exists without sending anything. Sender domain is verified. Implemented existing-account instruction mail, branded verification/recovery/update templates, course suggestions, resend access UI and admin provider-status logs. Community adds paid-course access, instructor announcements, instructor-created public/private groups, member controls, messaging and moderation. Build/test/release in progress.

## 2026-09-15 — [Codex] Community and email release complete

Promoted dpl_5GM1GAdnxv4PoSKLCfP6N8oCLjom (pacific-wave-website-2lleet9bs-pacificwaveprojects.vercel.app). 33 code/SQL tests, lint/TypeScript and build passed; six live desktop/mobile navigation checks passed. Isolated student/instructor tests verified chat sends, duplicate prevention, announcement permissions, private group creation/member changes through admin UI, cross-course and refunded denials. All fixtures removed. Sandbox new/existing/recovery emails accepted with branded content and course guide; original existing-account password remained valid.

At owner's request, reissued one existing-account guide to steve@pacificwavedigital.com. Resend receipt 7cdfbaf3-2458-4275-8ada-f31aeb057c03 reports delivered (recipient mail server accepted). Subject: Your Pacific Wave Digital training account and course guide. Saved delivery state in admin email logs. No password changed. Local port 3100 serves the same source with sandbox email settings.

## 2026-09-15 — [Codex] Student dashboard workspace

Owner requested Tutor LMS/LearnDash-style sidebar dashboard with profile photo, bio, fuller student information and purchase history. Building a branded workspace with overview, courses, schedule/calendar export, passed quiz results, purchase history/CSV, community shortcuts, private profile and account settings. Profile images are decoded/resized to WebP and stored privately; profile writes use authenticated ownership. Existing order receipts remain unchanged by profile edits. User confirmed successful account email receipt in the preceding turn.

## 2026-09-15 — [Codex] Dashboard verification

Applied student profile migration. Production build, lint and 35 tests passed. Isolated real-account browser/API checks passed for save/reload, avatar upload/removal, image validation, ownership, purchase CSV, quizzes, schedule and community links on desktop/mobile. Test fixtures removed. Visual review caught and fixed white-on-white hero button text. Release verification in progress.

## 2026-09-15 — [Codex] Student dashboard released

Production is dpl_EijQoYo5diBD1oDgC7onY9qGa23f (https://pacific-wave-website-31443gwud-pacificwaveprojects.vercel.app). New sidebar dashboard, private profile/photo editing, course progress, schedules/ICS, quiz results, purchases/CSV, community shortcuts and settings are live. Migration applied. Build, lint, 35 tests, isolated student API/browser checks and six live desktop/mobile checks passed. Temporary accounts, photos, courses and orders removed. Production email/Stripe/VUV banks verified unchanged. Source remains uncommitted/unpushed in the shared working tree.

## 2026-09-16 — [Codex] Account photo menu

Replacing training-header sign-out text with a circular student photo/initial menu containing Settings and Log out. Removing redundant sidebar sign-out. Menu refreshes after profile changes, closes on outside click/Escape and stays at the top right on mobile. Verification and deployment in progress.

## 2026-09-16 — [Codex] Account photo menu released

Published dpl_GQuA4Mdu9R2p9TGspADE1cuC1vJ4 (pacific-wave-website-ocofopav5-pacificwaveprojects.vercel.app). Top-right circular photo/initial replaces sign-out text; dropdown includes Settings and Log out. Removed sidebar sign-out duplication. Profile edits refresh header photo. Desktop/mobile menu navigation, outside click, Escape and real temporary-session logout verified; fixtures removed. Lint/build and production configuration checks passed. Source remains uncommitted/unpushed.

## 2026-09-16 — [Codex] Course registration CRM export

Owner asked where registrants appear, CRM export and bulk email availability. Existing LMS Payments screen lists orders; older /admin/training already exports campaign registrations. Adding admin-only, course/status-filtered CSV export for LMS orders with paginated retrieval beyond the 500-row screen limit. Excludes private student profile fields. No bulk-email composer exists; no email/SMS campaign sent.

## 2026-09-16 — [Codex] CRM export released

Published dpl_A6wW8HkLbbNHNVg7QtmfgpjYXesU (pacific-wave-website-hgm7jtsds-pacificwaveprojects.vercel.app). /admin/training-center Payments now offers course/status-filtered CSV export via admin-only /api/lms/students_export. Includes order contact/course/payment fields, all matching records through pagination, CSV formula neutralisation. Private profile details excluded. Build/lint and isolated admin/student/filter/export checks passed; fixtures removed. No bulk email composer exists; Emails remains delivery tracking. No messages sent.

## 2026-09-16 — [Codex] Admin email campaigns

Implementing a Campaigns workspace with branded draft editor, templates, verified training-only audience segments, deduplicated preview snapshots, explicit send control, persistent recipient queue, delivery records, cancellation and unsubscribe suppression. Private shared-project auth users without training activity are excluded. Replies use steve@; no real campaign has been sent. Durable worker and deployment verification in progress.

## 2026-09-16 — [Codex] Campaign verification completed

Applied campaign migration and configured private cron authentication. 37 tests and build/lint passed. Isolated desktop/mobile admin review, training-only audience, personalised sandbox send, duplicate rejection, immutability and unsubscribe checks passed; fixtures removed. Final UI polish staged. No real student emails sent.

## 2026-09-16 — [Codex] Admin campaigns published

Production dpl_FL25ji8Nu35j4rz8u7KWcF8NzS7S (pacific-wave-website-i6euz5xrm-pacificwaveprojects.vercel.app). Campaigns tab supports audience selection, branded templates/editor, saved drafts, recipient preview, admin-only test, explicit send, persistent queue, cancellation, provider delivery refresh and unsubscribe suppression. Migration applied; 37 tests, build/lint and isolated desktop/mobile sandbox flow passed. Live payment/email flags preserved. No real campaign sent. See docs/TRAINING-CENTER-HANDOFF.md for workflow and status semantics. Source remains uncommitted/unpushed.

## 2026-09-16 — [Codex] October registration email next steps

Owner asked whether October registrants receive enrolment/payment links. Found legacy campaign email still promised manual instructions. Replaced it with branded email plus plain-text steps and direct account/checkout links, Stripe/bank-proof instructions and dashboard access. LMS pending/rejected updates now link directly to payment; paid/review updates link to the course. No historical emails resent. Verification/release in progress.

## 2026-09-16 — [Codex] Registration email links published

Live dpl_4ejLgpzijr8ULmHPUrtXaSdTQ2xa (pacific-wave-website-mzhtr363p-pacificwaveprojects.vercel.app). New October form emails include account/sign-in, direct October checkout, Stripe/bank-proof instructions and dashboard link in branded HTML and plain text. Removed obsolete manual-payment-instructions promise. LMS pending/rejected emails link to checkout; paid/review emails link to course. Meeting links remain instructor-published. 37 tests, lint and Vercel build passed; production live flags verified. Existing recipients were not resent messages.

## 2026-09-18 — [Codex] Owner notifications and training load speed

Owner requested all account/form activity notifications at steve@ and faster training pages. Added private owner queue for new account/access/reset requests, newsletter signup, profile/photo saves and lesson/quiz submissions, with sandbox isolation and cron retry. Existing training registration/payment and enquiry notices retained; enquiry routing always includes steve@. No passwords or access links are copied. Public training catalogue/programmes now server-render cached published course data, skip browser catalogue/dashboard waits, and defer dashboard/community bundles. Private header profile reads use a small summary response. Baseline live heading times: catalogue 6.9s, mentorship 5.4s (single-run observations). Verification in progress.

## 2026-09-18 — [Codex] Owner alerts and faster training pages released

Production dpl_1Q7Xj6NGKX5RE6vnDwk7EJihKzhd (pacific-wave-website-4acjmrhzz-pacificwaveprojects.vercel.app). Account/access/reset, newsletter, profile/photo and lesson/quiz summaries route to steve@ through private retried queue. Existing registration/payment/enquiry alerts preserved, with steve@ mandatory for enquiries. Public training pages server-render cached public courses, avoid unnecessary catalogue/dashboard requests, dynamically load dashboard/community, and serve Inter/Jakarta locally. Header uses lightweight profile summary. 39 tests, lint and Vercel builds passed; six live desktop/mobile navigation checks and JS-disabled public rendering passed. Final staged CSS confirmed self-hosted font variables and no Google CSS import. Direct one-recipient Steve test confirmed delivered. Local database integration could not complete due network timeouts; no QA accounts remained. See handoff for precise verification/queue limitations. Source remains uncommitted/unpushed.

## 2026-09-18 — [Codex] LMS administration expansion in progress

Building manual package access, course coupons and advanced assessments. Manual grants use explicit granted/revoked status and zero collected amount; paid orders remain untouched. Coupon allocations are serialized in PostgreSQL and consumed when applied, not on payment; one per order. Questions and settings are snapshotted per server-timed attempt; answer keys stay server-side. Eight question types include instructor-graded essays. Existing MCQ data remains supported. Migration not yet applied; verification/release pending. Memory CLI remains unavailable due missing numpy; shared markdown updated.

## 2026-09-18 — [Codex] Advanced LMS migration applied

Applied 20260918_lms_advanced.sql to verified Supabase project rndegttgwtpkbjtvjgnc after 41 passing code/SQL tests. Added atomic quiz finalization/progress, service-only coupon redemption and explicit manual access statuses. Production build/lint/TypeScript pass. Local port 3100 runs the new build with non-production email dispatch disabled; isolated integration/browser verification underway. Public production app not yet updated. See docs/LMS-ADVANCED-ADMIN.md for operation and explicit boundaries.

## 2026-09-18 — [Codex] Advanced LMS released

Promoted dpl_zXaUViQ2ECjk7Ch3CwamjPkV1U1C (pacific-wave-website-enpsr4kd9-pacificwaveprojects.vercel.app) to pacificwavedigital.com. Access, Coupons and Grading tabs; modules and draft lesson duplication; eight quiz types, reusable JSON question banks, weighted points, pass marks, server-timed/limited attempts, instructor marks/feedback and atomic completion are live. Coupon currency is pinned; grant updates cannot replace concurrently started payments. Granted students join enrolled-course campaigns. Both 20260918 LMS migrations applied. 41 code/SQL tests, lint, TypeScript and local/Vercel production builds pass. Isolated real API/browser checks passed grant/revoke/reactivation, course privacy, coupon ownership/full discount, no-charge checkout denial, instructor grading, editor save and desktop/mobile quiz flow. All temporary accounts, courses, coupons, attempts and jobs removed. Live public smoke verification follows. Source remains uncommitted/unpushed.

— [Codex] 2026-09-18: All six post-promotion live desktop/mobile public checks passed (catalogue, October entry, mentorship details and main pages; no hydration or horizontal-overflow failures). Release verification complete.

## 2026-09-18 — [Codex] Lesson thumbnails in progress

Adding per-lesson admin image upload, automatic 960×540 WebP conversion, private storage and signed previews for admin/enrolled course readers. Artwork appears in the lesson list and selected lesson. Renaming admin Placeholder to Draft; publication remains explicit. Database migration, integration checks and release pending.

## 2026-09-18 — [Codex] Lesson thumbnails released

Live production dpl_Eu5HccX8AogwF9wDrQpv5u4YSiyv (pacific-wave-website-ni0edia2m-pacificwaveprojects.vercel.app). Each lesson supports admin thumbnail upload/preview/replace/remove; saving persists artwork. Admin and student lesson lists show thumbnails, selected lessons show a 16:9 cover. Private course-scoped storage, signed URLs, bounded 3 MB uploads and decoded 960×540 WebP conversion. Image-signing errors fall back to default artwork without blocking lesson data. Admin Placeholder renamed Draft; explicit publish changes it to Published. 20260918_lesson_thumbnails.sql applied. 43 automated tests, lint, TypeScript/build, and real isolated upload/privacy/save/reload/replace/remove/publication desktop/mobile checks pass. Fixtures and files removed. Staged live email/Stripe/VUV banks verified; public page 200 and unauthenticated upload 401 checked after promotion. Local 3100 matches, with email dispatch disabled for QA. Source remains uncommitted/unpushed.

## 2026-09-22 — [Codex] Training outage restored; source recovery underway

Sept 21 Git deployment dpl_CE4qtFyHy5GfQKCBPSLbqhZQew5x (SEO PR #3, c24210f) omitted the uncommitted LMS source. Training, account, October and catalogue API returned 404. Promoted last complete release dpl_Eu5HccX8AogwF9wDrQpv5u4YSiyv; all four public routes now return 200, with three courses and live email/Stripe configuration. Combining complete application source with origin/main SEO changes in isolated fix/restore-training-with-seo worktree; no database changes.

## 2026-09-22 — [Codex] Complete LMS + SEO release verified and promoted

Committed recovery source as 5f0128c on fix/restore-training-with-seo (based on c24210f origin/main), preserving all seven SEO service pages, dynamic sitemap, Search Console verification, title fixes, and full previously released LMS/readiness source. No marketing branch history or secrets included. Required-route build guard added. 43 unit/SQL tests, lint, local/Vercel production builds and eight desktop/mobile public smoke tests passed. Candidate live email/Stripe/two VUV banks/October VUV35000 verified. Promoted dpl_BtUeFdTMiT2r3UfUMKNVE135bnsu (pacific-wave-website-6ostut74h-pacificwaveprojects.vercel.app). Read-only database counts confirm existing registration and order records remain accessible; no database writes/migrations were performed. Git publication and final live smoke checks follow. Shared original checkout has merged SEO files, guard and instructions; its marketing branch/history is preserved.

## 2026-09-22 — [Codex] Recovery complete on production main

Pushed complete recovery commits 5f0128c and 560681e to origin/main (fast-forward, no marketing commits). Automatic Git production deployment dpl_GZHG67KGEDywDwuB9htiNzPorv97 / pacific-wave-website-lnf7wq37q-pacificwaveprojects.vercel.app reached READY and owns pacificwavedigital.com. All eight live desktop/mobile read-only browser checks passed, covering main pages, training catalogue/account entry, both programmes, seven SEO service pages, navigation and combined sitemap. Public October registration, login and catalogue routes return 200; catalogue confirms live email, Stripe, ANZ/BRED VUV and open October enrollment. Existing database records remain accessible (aggregate-only check); no students/payments were modified. Source on main now includes all LMS features and route build guard, resolving the source/deployment mismatch. This final verification note is local handoff documentation; deployed application source is committed/pushed.

## 2026-09-22 — [Codex] Simplified training enrollment

User requested signup-first CTAs and immediate account access without mailbox confirmation. Implementing training-only new-account creation (existing users unchanged, shared Supabase auth settings unchanged), required name/phone/location/attendance/consent, pending enrollment at the server-side course price, immediate password login, and non-blocking welcome email. Payment/grant checks still protect paid lessons. Verification in progress.

— [Codex] 2026-09-22: 45 code/SQL tests pass. Real isolated new-account signup/password sign-in and contact persistence passed; duplicate accounts and preexisting unconfirmed accounts remain unchanged. Temporary accounts/profiles cleaned, no QA course orders or emails created. Browser fixture verifies automatic signup-to-payment with no second details form. Final mobile retest/release pending.

— [Codex] 2026-09-22: Final production build/lint/45 unit and SQL tests pass. Eight desktop/mobile browser checks pass, including signup-first CTAs, required fields, automatic payment handoff without a second form, closed courses and retained SEO pages. One earlier mobile run hit a transient catalog/database wait; final run passed in 9.5 seconds. Publishing the complete source to main with the existing release-route guard.

## 2026-09-22 — [Codex] Simplified signup released

Main af8aed3 contains the complete tested signup-first flow. Staged dpl_Gh62gMGjhEEcYmSGFbDCeF4qHcqX passed live email/Stripe/ANZ+BRED/VUV35000 verification and was promoted. Git production dpl_6LGo8aEtxhEiEh9R9RfpY4QxxHaR (pacific-wave-website-jlgswo38n-pacificwaveprojects.vercel.app) is READY. 45 unit/SQL tests, lint/build, 10 local desktop/mobile checks and six live read-only enrollment checks pass. Real isolated new-account authentication/contact persistence and existing-account protection verified; all temporary accounts/profiles removed. No QA charges, orders or emails were created. No database migration or project-wide auth setting change. Final handoff notes are local; all application source is committed/pushed.

## 2026-09-23 — [Codex] Registration visibility in admin

Read-only investigation confirmed the reported October student is in LMS orders with bank proof and review status; owner was viewing legacy /admin/training enquiries. No payment approved or record modified. Adding explicit Registrations & payments sidebar/deep link, legacy-page banner and refreshed labels. Verification/release pending.

— [Codex] 2026-09-23: Lint and production build passed, including release route guard. Added /admin/training-center/registrations opening the existing protected payments interface, renamed legacy enquiries, linked sidebar and legacy banner, and added refresh/status explanation. No database/payment mutations.

— [Codex] 2026-09-23: Default registrations filter changed from review-only to All payments so pending and approved students remain visible too. Owner still chooses review-only when processing bank receipts.
