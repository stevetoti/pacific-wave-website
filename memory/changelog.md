# Changelog — pacific-wave-website

## 2026-10-01 — [Claude Code] Shared table: anon insert policy on project_submissions closed

Dropped `"Enable insert for everyone"` (anon INSERT, `with check true`) on
`public.project_submissions` in the shared Supabase project `rndegttgwtpkbjtvjgnc`.
It was the last open write path into the table: rapidentrepreneurs.com's Get started
wizard inserted from the browser with the anon key until 2026-10-01 (it now posts to a
guarded server route with the service role, like this site). Remaining policies:
authenticated read/update, the `pwd_*` restrictive guards, and `pwd_write_allow` for
PWD admins. Every site writes through its own server route now; the anon key can no
longer insert enquiries from anywhere. Verified by listing `pg_policies` afterwards.

## 2026-09-30 — [Claude Code] Bot defence on the contact form, project wizard and newsletter

Spam enquiries (e.g. name `IAZbdEISQtLfatghMgdRBA`, message `3283763479`, 29 Sep 19:43) were
reaching Steve's inbox. The route already had a honeypot and a per-IP limit; bots left the
honeypot empty and submitted digit-only messages in under a second. Applied the
`form-bot-defence` skill (built from the Digiassist AI signup incident):
- `src/lib/security/{bot-signals,turnstile,form-guard}.ts` + `src/components/security/
  {TurnstileWidget,FormBotFields}.tsx` (skill templates).
- `/api/submissions` and `/api/newsletter` run `guardPublicForm` BEFORE the rate limit, the
  database insert and the owner email: honeypot (silent 200), minimum 3 s fill time,
  digit/link-only message refusal, server-verified Cloudflare Turnstile (fail-closed when
  keys are missing). A generated-looking name adds "Review signals" to the notification.
- Contact page, get-started wizard (final step) and NewsletterCTA send the three fields and
  render the Turnstile widget; tokens are re-issued after every attempt.
- Test: `tests/form-bot-defence.test.ts` (node:test) pins the signals and message sanity.
- Turnstile keys (shared PWD widget) added to Vercel Production + Preview(form-bot-defence)
  by stdin pipe. Preview env also received the two public Supabase vars (previews had none).

Verified locally on the built app: honeypot → 200 swallow; 0.5 s fill → 400; digit-only
message → 400; no CAPTCHA token → 400 on both routes. Local build + typecheck of changed
files clean (pre-existing unrelated tsc errors remain in the old checkout's node_modules).
**Released:** Stephen added the hostnames to the shared widget; branch merged into main
(`ce6f337`, clean merge over the messaging release), pushed, Git production
`pacific-wave-website-rje04m5bi` READY on pacificwavedigital.com. Live checks: `/`, `/contact`,
`/get-started`, `/blog` 200; contact page renders the Turnstile widget (Cloudflare challenge
responses 200, screenshot); honeypot → silent 200; digit-only message → 400; no CAPTCHA token
→ 400 on `/api/submissions` and `/api/newsletter`. No rows written, no emails sent by the
probes. Preview probes via `vercel curl --deployment` (deployment protection) matched.
Branch and worktree removed. Stephen's one real enquiry is the final inbox proof.
(Earlier note, superseded:) Branch `form-bot-defence` from origin/main; NOT merged to main yet — Stephen must add
`pacificwavedigital.com`, `www.pacificwavedigital.com` and
`pacific-wave-website-git-form-bot-defence-pacificwaveprojects.vercel.app` to the shared
Turnstile widget, then the preview widget check and merge follow.

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

— [Codex] 2026-09-23: Published main 4dd7781, Git production dpl_5X9Ez3ALx5pDoXykiXzBAgg7VWmz READY and aliased to pacificwavedigital.com. New registrations route and legacy page return 200; anonymous LMS admin API remains 401. Lint and production builds passed. No student, bank proof, or payment decision changed.

## 2026-09-23 — [Codex] Course communication expansion underway

Building direct course communication navigation plus member-scoped mentions, replies, reactions, search/pins, unread markers, private file sharing and reporting/moderation. Preserve paid/granted course access and private group boundaries. In-app mention notifications only; no automatic chat email blasts. Additive private tables and service-only RPCs; migration not yet applied.

— [Codex] 2026-09-23: Applied additive community features and private mentorship conversation migrations to rndegttgwtpkbjtvjgnc. Paid/granted mentorship orders receive isolated student/instructor rooms; backfill avoids changing orders or payment/email workflows. Added direct admin Course communication route. All 47 unit/SQL tests and production build pass; isolated API/browser verification underway with temporary users/courses, test email jobs removed in the same transaction as fixture orders.

— [Codex] 2026-09-23: All 55 authenticated API checks passed, including mentions/unread, replies, edits, reactions, pins/search, private reports, file conversion/download, membership revocation, locked/archived posting rules and isolated mentor rooms. Temporary fixture data/uploads cleaned. 47 unit/SQL tests, lint and production build passed; eight desktop/mobile public regression checks passed (two unrelated opt-in tests skipped). Completing authenticated browser verification and release. Final file limit is 4 MB to stay below Vercel's function request/response limits; polling avoids overlapping feed requests and browser requests time out rather than hanging indefinitely.

## 2026-09-23 — [Codex] Advanced course communication released

Application commits d0c8d98 and 4e2f971; production dpl_3eyTu3HTRsVAHJukjYmPR3MeLRmp (pacific-wave-website-oi7sgyoee-pacificwaveprojects.vercel.app) passed configuration checks and was promoted. Dedicated Course communication sidebar/deep link, member-scoped tags, in-app unread counts, replies, reactions, pins/search, private groups/files, room lock/archive and reporting/moderation are live. Paid/granted mentorship enrollments receive separate private instructor conversations.

Verification: 47 unit/SQL tests, lint, final complete production build with eight required routes; 55 authenticated API assertions; persisted instructor tag/message, desktop/mobile student messages, mobile private mentor message and no horizontal overflow verified with isolated users. Mobile conversation picker reviewed visually. Eight public desktop/mobile regression checks passed (two unrelated opt-in tests skipped). All temporary accounts, courses, orders, groups, messages and uploads removed. Test order/email changes were atomic; no emails or messages were sent to real students and no real payment decisions changed. First API run hit a transient remote read failure; rerun passed. Browser locator errors were corrected and final checks wait for persisted messages, not composer text.

## 2026-09-25 — [Codex] Student video tutors in progress

Owner confirmed scope: every PWD training course, October/future cohorts and private mentorship. Implementing four shared roles (onboarding, class assistant, business development, branding) on codex/student-video-agents in the canonical release checkout. Reusing owner-authorized Digiassist Anam avatar/voice IDs with per-session PWD prompts; shared Digiassist personas will not be edited. Per-student/course context, authorized private lessons and student-editable coaching notes are required. No live release yet.

## 2026-09-25 — [Codex] Video coach verification

Additive private coach tables applied. Fifty unit/SQL tests, TypeScript, lint/build and eight desktop/mobile public LMS/SEO release checks pass. Isolated real API tests verify authentication, private lesson/course isolation, note ownership and consent. Browser test confirmed actual Anam video, personalized name/tourism-goal answer, lesson navigation without disconnection, and saved transcript. Fixed early-message drop by awaiting DATA_CHANNEL_OPEN. Checking explicit typed-message retention before staged release. Temporary student/course fixtures cleaned after every run; no existing student/payments changed.

## 2026-09-25 — [Codex] Student video coaches live

Promoted dpl_hrAquD7amYg2fmtGyYigk83kaLsR (application fe3e6d2). Production authenticated context confirms all four roles; Anam token creation/end passed. Eight live desktop/mobile release tests passed, matching local 50 tests, lint and build plus real video/personalization/transcript integration. Live payment/email configuration, two VUV banks and October 35,000 fee preserved. All temporary fixtures removed. Complete source published to main; canonical recovery checkout remains deployment source.

## 2026-09-25 — [Codex] Three specialist coaches in progress

User authorized all recommended roles: sales practice, marketing/content and project review. Extending the existing catalog and database role constraint with tailored prompts; reuse configured avatars, private student/course context and shared session allowance. Memory CLI still fails because numpy is unavailable; shared markdown used.

## 2026-09-25 — [Codex] Specialist coach verification complete

All three new roles created real Anam tokens and persisted ended sessions. Seven cards verified at desktop/mobile widths; real video, personalized response and transcript regression passed. Fifty unit/database tests, lint, full build with route guards and eight public desktop/mobile checks passed. Role constraint migration applied; temporary students/courses removed. Preparing staged production release.

## 2026-09-25 — [Codex] Seven-coach release verified live

Application 6be80a8 promoted as dpl_H9qHeZNugrB2Y43k5mMYbt6YiJFv. Live API advertises all seven roles; sales_practice, marketing_content and project_review each create Anam token and end/save successfully. Eight live desktop/mobile tests passed. Fixtures removed and complete source published to main. Existing payment flags, VUV banks and October price verified unchanged.

## 2026-09-26 — [Codex] Course-grounded onboarding and conference design

User requested fixed timetable orientation, natural spoken times, coach usage guidance, unique meeting artwork, one-time onboarding and a 50/50 video meeting. Implementing explicit per-course completion (interrupted sessions retry), authoritative cohort config/public curriculum, course-duration access and optional local-only camera/fullscreen. Generated seven distinct images using authorized Anam avatar references. No release yet.

## 2026-09-26 — [Codex] Conference and onboarding verification passed

52 unit/SQL tests, lint/build and eight public desktop/mobile tests pass. Isolated real Anam meeting answered with fixed Mondays/Thursdays/Saturdays from three p.m. to five p.m. Vanuatu time and refused rescheduling. Verified equal video tiles, fake-camera preview, native fullscreen, stopped camera track on end, minimize/lesson navigation, transcript persistence, explicit completion hiding onboarding on another viewport/context, other-student isolation, notes preserving completion, repeat onboarding 409 and ended-course starts 403. All fixtures removed. Seven 52–72 KB WebP illustrations inspected. Staging release next.

## 2026-09-26 — [Codex] Conference coaching released

Promoted dpl_9d75LYBQnc2oXNUgu9UUQTn3q5bq, application d2f2162. Live synthetic student verified official spoken timetable and end date, Anam onboarding token, persistent completion and repeat rejection; all seven images load. Eight live desktop/mobile checks passed. QA fixtures removed. Complete source and handoff published to main. Shared markdown used because persistent-memory CLI still lacks numpy.


## 2026-09-27 — [Codex] Voice coaching and student learning hub
In progress: saved profile approval, voice/video meetings, live verified research, private session history and researched email/PDF reports; course imagery/navigation and cohort recording uploads. Implementation is not yet deployed or verified.

### 2026-09-27 — [Codex] Verification checkpoint

Additive report/cohort-recording migration applied to `rndegttgwtpkbjtvjgnc`. Live research returned verified official Vanuatu sources; real Anam speech invoked the client research tool. Branded six-page sample PDF rendered and inspected; Resend accepted a synthetic report with PDF at its test inbox. Queue/privacy/link checks, account-email routing/idempotency tests, recording isolation, complete build and eight public desktop/mobile checks pass. End-to-end session report and final deployment checks are still in progress. A transient access-check failure found during the voice test now leaves an otherwise valid meeting running instead of immediately ending it.

### 2026-09-27 — [Codex] End-to-end acceptance

Full real Anam speech → awaited live research → ended-session report → private renamed dashboard page → authenticated PDF flow passed. Cross-student reads return 404; saved consent persists across courses; desktop/mobile faculty and equal camera/coach tiles pass. All synthetic fixtures removed. Exact October welcome layout, twelve thumbnails, dates and one approval passed at 1440px and 390px. Fifty-five unit/database tests pass. Production packaging includes the PDF logo in all three relevant functions; final candidate verification/promotion pending.


## 2026-09-27 — [Codex] Coaching learning hub released

Application `1bc7246` and recovery migration `c6e86f2`; production candidate `dpl_AEkNSt6dUMawBjWqAaD7wiBJDZXu` passed private history/rename/PDF/logo/auth checks and was promoted. Eight live desktop/mobile release checks passed; payment modes, banks and course prices preserved. Source/report/public-image checks and synthetic test cleanup completed. Existing training documentation and CLAUDE resume snapshot updated; full source being synchronized to main.

## 2026-09-29 — [Claude Code] Course affiliate programme

- Students apply from Dashboard → **Affiliate programme**; admin approves in Admin → Training centre → **Affiliates** (`?tab=affiliates`). Default commission 15% of the amount the student actually paid (after coupons), overridable per affiliate.
- Share links: `/go/CODE` (optionally `?to=/training-center/programs/<slug>`) log a click and set a 30-day httpOnly `pwd_aff` cookie (last click wins). `to` is restricted to training paths (no open redirect).
- Referral attaches once to a pending/rejected order at signup, `/api/lms/order`, checkout and bank-proof upload via `pwd_lms_attach_affiliate` (self-referral and non-approved codes ignored).
- Commission rows are created by trigger `pwd_lms_affiliate_commission` on order status → paid (covers Stripe, bank review and coupon paths; zero-amount orders skipped). Refund/revoke voids unpaid commissions; already-paid ones are flagged "recover manually".
- Payouts are manual: admin approves → marks paid with reference. Affiliates get status emails (approve/reject/suspend); owner gets an alert on new applications.
- Files: migration `20260929_course_affiliates.sql`, `src/app/go/[code]/route.ts`, `src/app/api/lms-affiliates/route.ts`, `src/lib/server/affiliates.ts`, `AffiliateCenter.tsx`, `AffiliateAdmin.tsx`, hooks in `api/lms/[action]/route.ts` and `lms-signup.ts`, test `tests/affiliates.test.ts`.
- Non-students can join: public `/affiliates` landing page (footer link + sitemap) → `/training-center/account?mode=signup&next=affiliate` (free account, no course, attendance question hidden) → dashboard Affiliate tab. Signed-in users with `next=affiliate` go straight to the tab.
- Cohort courses link to `/vanuatu-training` (catch-all 404s `programs/vanuatu-october-2026`).
- Verified locally: 57/57 tests, lint, TypeScript, `npm run build` with release route guard.
- Migration `20260929_course_affiliates` applied to rndegttgwtpkbjtvjgnc; RLS on, anon has no access, trigger present, existing 6 orders untouched.
- **Released** — [Claude Code] 2026-09-29: commit `c8d281b` on main → production `dpl_cjecVin47Ysx1mdxiwr7rJ9Fosom` aliased to pacificwavedigital.com. Live checks: /affiliates 200, affiliate signup 200, /training-center + /vanuatu-training 200, /go/UNKNOWN → 307 to safe path (external `to` rejected), /api/lms-affiliates 401 unauthenticated. End-to-end apply → approve → link → paid commission flow left for owner testing on live (no production test accounts created).

## 2026-09-29 — [Claude Code] Affiliate page imagery
- Owner requested a more professional /affiliates page. Split hero with photo, floating "15% commission" and "30-day tracking" badges; the three step cards now have photos, step labels and overlapping icon badges.
- Released 4c97ff6 → dpl_9Cx3gSK9vv9iTzpnnPWR1zgudGG7 (live, page + images return 200).
- Four new photoreal Port Vila images (Higgsfield Nano Banana 2, 2K) optimised to WebP in `public/images/affiliates/` (hero 148 KB, cards ~90 KB). Desktop 1440 and mobile 390 screenshots checked, no horizontal overflow.

## 2026-09-29 — [Claude Code] Non-student dashboard access fix
- Report: a non-student could not get into the dashboard. Data showed the dashboard itself works without a course (no server errors; a non-student signed up and applied today). Root cause: signed-out dashboard links (incl. the affiliate approval email) sent people to the SIGN-UP form, which fails with "email already used", and the target tab was lost after sign-in.
- Fix: signed-out dashboard panel → `account?mode=signin&next=<tab>` plus "New here? Create a free account"; generic `next=<tab>` return after sign-in/sign-up (and auto-redirect if already signed in); header link now "Sign in"/"My dashboard"; account menu adds My dashboard + Affiliate programme; sidebar says "Your account" when no paid course; approval email links to sign-in with next=affiliate.
- Released 71e7625 → dpl_GYxxScu4uSDGLaJhhnr4cYqzt8ze; live signed-out affiliate dashboard shows sign-in heading and signin&next=affiliate link.
- Verified on local production build against live DB with emails disabled: signed-out → sign-in (not signup), non-student signup from /affiliates (no attendance question) → affiliate tab → application submitted → sign-out → sign back in lands on affiliate tab; overview/courses/purchases/profile/settings show no errors with zero courses. QA account, profile, affiliate row and queued owner alert deleted.

## 2026-09-29 — [Claude Code] Affiliate auto-approval + branded welcome email
- New affiliate applications are approved instantly (setting `pwd_lms_settings` id `affiliate_program` `{auto_approve}`; missing row = on). Admin Affiliates tab has an "Approve new affiliates automatically" switch. Previously rejected re-applicants still go to manual review.
- New branded welcome email (`src/lib/email/affiliate-template.ts`): approved badge, rate/30-day/code stats, every share link with per-sale earnings, dashboard CTA, ready-to-send WhatsApp message, six best practices, payout explanation and programme rules; responsive (stats stack on phones). Sent on auto-approval and on manual approval; logged in `pwd_lms_account_emails` as `affiliate_approved` (visible in admin Emails) with idempotency + one retry.
- Affiliate sign-ups (`intent: "affiliate"`) skip the student course-welcome email. Owner alert says "joined (auto-approved)".
- Dashboard: instant "You're approved!" banner, ready-to-send message with copy/WhatsApp, collapsible "How top affiliates succeed" + rules (shared copy in `src/lib/lms/affiliate-guide.ts`). /affiliates copy now says approved instantly.
- Released 0c7758a → dpl_DYd6pxk2jDH2biE3FpZEWJ6qvkLR (live /affiliates shows "approved instantly").
- Verified: 57 tests, lint, tsc, build; local production build against live DB in sandbox email mode: non-student signup → join → auto-approved → Resend accepted welcome (test inbox, receipt logged) → no student welcome sent; email rendered at 700px and 375px (no overflow). QA account/rows removed.

## 2026-09-30 — [Claude Code] Phase 1: per-course instructors
- Migration `20260930_course_instructors.sql` (applied): `pwd_lms_course_instructors(course_id,user_id)`, profile `instructor_title`/`expertise`, `pwd_lms_chat_people` now = enrolled students + assigned instructors + active admins, helpers `pwd_lms_user_by_email`, `pwd_lms_instructor_list` (service-role only).
- `src/lib/server/teaching.ts` `teachingAccess()`: admins = all courses; assigned instructors = their courses only. Applied to `/api/lms/admin` GET/POST (instructors: lesson + recording_upload only; no payments/banks/course settings), `/api/lms-thumbnails`, `/api/lms-manage` (instructors: grading queue + grade only). Chat `access()` treats assigned instructors as instructors.
- `/api/lms-instructors`: admin list/invite (creates confirmed account + branded set-password invite via recovery link, `next=teach`)/assign/remove/resend; `scope=me` for nav; `scope=public&course=slug` for course pages.
- UI: admin Training centre → Instructors tab; `/training-center/teach` Teaching workspace (TrainingAdmin mode="teach": Lessons, My students, Grading, Course communication, My instructor profile); nav links in account menu + dashboard sidebar; "Your instructors" cards on programme pages and /vanuatu-training (hidden until profiles exist). Teach page hides marketing footer/widgets.
- Stephen assigned to all 3 courses, title "Founder & Lead Instructor".
- Released 5c48d04 → dpl_2e9yMcf7WLyXxo26MYb5dvekzkHJ; live: /training-center/teach signed-out shows "Sign in to teach", /vanuatu-training shows "Your instructors" card, admin/me instructor APIs return 401 unauthenticated.
- Verified: 58 tests, lint, tsc, build; local production build vs live DB (emails disabled) with temp instructor/student/admin/invitee + hidden QA course: instructor sees only own course, can create lessons there, gets 403 for other courses, banks, course edits, grants, affiliates and admin instructor list; chat instructor flag on own course only; profile save; student sees "not an instructor"; admin invite creates + assigns account, remove works; admin Instructors tab renders. All QA users/admin/course/lesson/channels/logs deleted.

## 2026-09-30 — [Claude Code] Phase 2: student directory, connections and direct messages
- Migration `20260930_student_messaging.sql` (applied): profile `directory_visible`/`message_emails`; tables connections, blocks, dm_threads/messages/files/reads/reports; SQL `pwd_lms_is_student`, `pwd_lms_teaches`, `pwd_lms_can_message`, `pwd_lms_directory`, `pwd_lms_request_connection`, `pwd_lms_message_counts`, `pwd_lms_due_message_reminders`. All service-role only.
- `/api/lms-messages` (overview, directory, thread, file download, upload, request/respond/remove/open/send/delete/read/block/unblock/report/settings; admin reports scope). `src/lib/server/messages.ts` (person cards without email/phone, request + reminder emails with opt-out, cron reminder job). `readChatFile()` extracted from community-files and shared.
- UI: Dashboard → Messages (`MessagesCenter.tsx`), nav badges (`useMessageCounts`), Teaching workspace Messages tab, admin Message reports tab (`MessageReports.tsx`). Docs: `docs/STUDENT-MESSAGING.md`.
- Released 422e302 → dpl_C2uxTy3TUCAggdNyvb4g2zP6TtwR; live routes 200, messages API 401 unauthenticated.
- Verified: 59 tests (incl. SQL messaging test), lint, tsc, build; local production build vs live DB with emails disabled and temp students A/B/C, instructor T, admin on a hidden course: directory (no email/phone), request with note, badge, accept, C blocked from messaging A without connection (403), A↔B text + image attachment, polling reply, instructor contacts + direct message to C, block → 403 + hidden from directory, report → admin sees only that conversation → resolve, third party 404 on others' threads, students 403 on admin scope, desktop + 390px mobile layouts without overflow. All QA users, admin row, course, orders, threads, files (incl. storage object) and logs deleted.

## 2026-10-01 — [Claude Code] Message notifications: in-app bell + branded batched emails
- Owner chose: email for every new message (smart-batched), bell + pop-ups + sound, private messages + group @mentions + instructor announcements (not every group message).
- Migration `20260930_notifications.sql` (applied): `pwd_lms_notifications` (kind message/connection_request/connection_accepted/mention/announcement, group_key, count, read_at, email_state/due/attempts), `pwd_lms_notify()` merges into the unsent unread notification of the same conversation (bursts → one email), `pwd_lms_claim_notification_emails()` (skip-locked, max 3 attempts).
- `src/lib/server/notifications.ts`: `notify()`, `markNotificationsRead()`, `processNotificationEmails()` (skips read/opted-out, logs `notify_<kind>` in admin Emails). New every-minute cron `/api/cron/notifications` (vercel.json). Delays: messages/mentions 2 min, announcements 1 min, connection events immediate. Reading a chat marks its notification read → email skipped. Old 1-hour reminder removed from the 5-minute cron (SQL function left unused).
- Hooks: DM send, connection request/accept (`/api/lms-messages`); course chat @mentions and instructor announcements (announcements go to enrolled students only, not admins/instructors) and channel read clears them (`/api/lms-community`). Mention markup rendered as @Name in previews.
- UI: `NotificationBell.tsx` in LMS nav + Teaching workspace (dropdown, unread dots, mark all read, pop-up toast + WebAudio chime, suppressed for the chat on screen); `/api/lms-notifications`. Branded email `src/lib/email/notification-template.ts` (sender photo/name/headline, quoted message, Reply CTA, opt-out). Settings copy updated. Removed profile-photo badge (bell carries the count).
- Verified: tsc, lint, build; new tests `tests/notifications.test.ts` pass; local build vs live DB (sandbox email) with temp A/B/T on hidden course: request → B bell + toast; accept → A notified; 3 quick messages → 1 notification count 3 → one email; announcement → only students; message while reading → no toast, email skipped; Resend test inbox accepted all; email rendered 640/375px. Safety guard caught announcement notifying admins → fixed; stray row deleted before any email. QA data removed.
- Released fea9229 → dpl_2UKHTKge8FuEFZx7iwoRiGK5hAwm; production cron `/api/cron/notifications` confirmed running every minute (claim RPC 200s in Supabase logs), no server errors.
- Known, not mine: 4 contact-form tests in `tests/api.test.ts` fail on main since the form-bot-defence release (submissions now need bot-defence fields / Turnstile) — confirmed on a clean origin/main checkout.

## 2026-10-01 — [Claude Code] Mobile checkout + step-by-step payment guidance
- Problem reported: on phones a student about to pay only saw the coupon box; bank details were hidden behind a "Choose your bank" dropdown and the payment panel sat below the long course description.
- New `PaymentOptions.tsx` (+ `PaymentBrands.tsx` drawn Visa/Mastercard marks and ANZ/BRED badges — not official logo files): amount-to-pay card with short payment reference `PWD-XXXXXXXX` (+copy), "Option 1 · Pay by bank transfer" with 4 illustrated numbered steps (send to either account — all accounts always visible with copy buttons; write reference; keep receipt; upload with bank radio + large file picker), "Option 2 · Pay by card" with 3 steps and full-width "Pay VUV … by card" button, coupon collapsed under "Have a coupon code?", WhatsApp help.
- Phones: payment panel shown before course details; compact steps; floating call/chat widgets hidden on checkout; fixed LMS header where bell + photo overlapped the nav links (`.lms-nav-actions` grid placement).
- `paymentReference()` in `src/lib/lms/types.ts` (first 8 hex chars of the order id). Admin Payments shows it + full ID and adds a search box (name/email/phone/reference). Registration status emails show the short reference and pending/rejected ones explain both payment options.
- Released 4b56a5a → dpl_GZVwcsmvx7MnwgRkHDPLsAyMsmUA; live checkout serves new payment + header styles.
- Verified: tsc, lint, build, 60/64 tests (same 4 pre-existing contact-form failures); local build with temp account and a browser-only mocked pending order (no real registration/email): payment above course details at 390px, both bank accounts visible without choosing, no horizontal overflow on catalogue/programme/October/signup/dashboard/checkout, desktop layout intact. QA account deleted.

## 2026-10-01 — [Claude Code] Read receipts in private messages
- My messages show one grey tick when sent and two green ticks once the other person has read them (from their existing `pwd_lms_dm_reads.last_read_id`, updated whenever they view the chat; my open chat polls every 8 s). "Seen by <first name>" appears under my latest read message; the conversation list shows the tick on my last message. No migration.
- `/api/lms-messages`: thread returns `seen_up_to` and per-message `seen`; overview returns `last_seen`. UI in `MessagesCenter.tsx`; bold ticks (#4ade80 on navy bubbles) in training-center.css. Course group chats unchanged.
- Released a62416d → dpl_3nW5e7smJaoAZiJJ9ZXfLqTBbRoS (live CSS includes receipt styles).
- Verified: tsc, lint, build, 60/64 tests (same 4 pre-existing contact-form failures); local build vs live DB with two temp users (instructors of a hidden QA course + accepted connection, no orders/emails): single ticks before read → green double ticks + "Seen by" after the other opened the chat, reply auto-seen while chat open, list tick; desktop + 390px screenshots. Fixtures deleted.

## 2026-10-01 — [Codex] Private BLP workshop implementation

In progress: unlisted workshop registration and full LMS reuse, private-cohort messaging boundaries, BLP branding and existing workshop curriculum. Working in canonical clean training-recovery checkout at 57af418. No deployment/database mutation yet. Persistent-memory CLI remains unavailable (numpy missing); shared markdown is current.

### 2026-10-01 — [Codex] Approved workshop files and acceptance checkpoint
Owner supplied approved v4 PDFs in original checkout BLP Logos/BLP Workshop Manuals and Outlines and explicitly requested all three (outline, facilitator/course guide, participant workbook) for students. Replacing v3 resources with v4, adding guide. Live schema applied; BLP course remains unpublished. Local real participant/admin approval, access revocation, resources and messaging isolation passed; cleanup found auto-generated mentorship lessons on a public test enrollment and is being repaired. No real participants enrolled.

### 2026-10-01 — [Codex] Final v4 resource checks
All three owner-approved PDFs uploaded privately; browser View/Download and three PDF response checks pass. Local admin approval → refresh → participant access, revoke, private/public directories, accepted DM, unrelated historical thread/attachment denial passed. All six synthetic accounts and auto-generated mentor lessons/orders, temporary private course, admin row, conversations and fixture email guard removed. Twelve desktop/mobile public regressions pass. Application ee6ecc2 pushed to codex/private-blp-workshop; staged production candidate building.

## 2026-10-01 — [Codex] Private BLP workshop live
Application ee6ecc2 promoted as dpl_HV9QtyTsu7Ck9CCaWvyPYA6w75VA. Applied 20261001_private_workshops.sql; published only after privacy-aware code owned production. Shared unlisted link /training-center/programs/blp-digital-skills-workshop. Free pending signup, admin Access approval queue; full LMS after approval; direct-message private cohort boundaries apply to existing threads/files/notifications too. Nine approved-outline modules, BLP branding and three owner-approved v4 PDFs (including facilitator guide as explicitly requested) with private View/Download.
Staged real six-identity approval/resources/chat/revocation checks passed; fixtures removed. Eight live public desktop/mobile release checks pass plus BLP-specific desktop/mobile page/signup/public-exclusion checks. Independent anonymous live mobile reviewer passed, no new findings. All PDF storage objects SHA256 match supplied originals. New-account and returning sign-in checks passed against the production build; the session-readiness correction is deployed as eb24ee7 → dpl_4EHmChDX33NZxsidsangmBhDDuxU. Four pre-existing contact-form tests remain unrelated failures.

### 2026-10-01 — [Codex] New-account race found and corrected
Final real signup exposed a checkout/account redirect loop: newly server-rendered direct-course checkout had course readiness before auth readiness. Added a separate authReady guard before redirecting anonymous checkout visitors. Account and pending order creation were already correct; route transition fix under verification. Synthetic signup accounts/guards cleaned after each attempt.

### 2026-10-01 — [Codex] Final production verification
Signup session fix is live; eight production desktop/mobile public release tests passed again. Local real new account and returning sign-in both persist pending approval and open the course; no fee or duplicate registration. QA mail is disabled and exact fixture queue guards are cleaned up. Live UI verification uses only localhost account creation to avoid test welcome mail; production sign-in and dashboard requests are real.

Live mobile signup/sign-in transition and pending dashboard verification completed PASS on dpl_4EHmChDX33NZxsidsangmBhDDuxU; all fixtures removed. Final source synchronized to main after verification.
