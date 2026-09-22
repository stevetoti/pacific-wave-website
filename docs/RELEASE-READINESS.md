# Readiness repairs — 2026-09-15

## Current status

Repairs are deployed to **https://pacificwavedigital.com**. Supabase migrations and all three SEO Edge Functions are applied. Production deployment: `dpl_5QiQSCyiizuResfNZZRrxZjWHkrn` (staged checks passed before promotion).

The supplied management token worked. Live verification found a legacy `newsletter_subscribers` schema collision; PWD now uses its own private `pwd_newsletter_subscribers` table. Existing subscriber records were preserved. Both migration files are required for the recorded release history; the main migration now uses the dedicated table for fresh installations.

Verified production target: Vercel `pacificwaveprojects/pacific-wave-website` (`prj_DuwpSNfiGkHmLB2n5dJLaWmoZKde`). Database content site ID: `pwd`; admin profile site ID: `pacific-wave-digital`. This database contains other companies' applications: never reset it or apply blanket policies.

## Implemented

- Next.js 16.3.5 and React 19.3.0; updated related/transitive dependencies. Full audit reports zero known vulnerabilities.
- Server-side identity, active-role and site checks for admin, analytics, paid SEO/AI and help-content APIs; authenticated browser requests include the current session. Nested admin routes use specific permissions.
- Lazy server clients prevent build failures when optional server secrets are absent. Inputs are bounded and validated; paid operations and public signups use a database-backed request limit.
- Project-wizard controls remain disabled until browser event handlers are ready, preventing lost early clicks.
- Contact and project wizard share durable server-side lead capture. Database failure is visible and preserves inputs. Notification failure leaves a saved inquiry pending, with a retry action in Submissions. Email uses plain text and a stable idempotency key.
- Blog index and article newsletter forms save actual subscriptions. No simulated confirmation email.
- Transcripts persist in a protected table; removed fictional sample records. Competitor research requests real provider results; removed fabricated scores/statistics and unfinished content-improvement menu action.
- Google credentials/tokens move to a service-only table. OAuth initiation requires an admin session; callback state is random, browser-bound, expiring and single-use. Existing credentials are copied during migration.
- Added service-error records, an admin viewer, and optional alerts configured with `ERROR_NOTIFICATION_EMAILS`. Reporter never discloses request bodies or secrets.
- Restored Search Console verification metadata and dynamic sitemap from the existing SEO branch. Removed placeholder video defaults; real videos configured in settings remain available. Lazy-load videos and voice widget.
- Sanitize rendered blog HTML and escape structured-data script contents. Removed the tracked expired Vercel OIDC token file.

## Checks

- `npm run build`: passes; 14 published article paths fetched from the verified content database.
- `npm run lint`: clean.
- `npm test`: 14 tests pass, including rejected anonymous/wrong-role/other-site requests, bounded inputs, saved-before-email ordering, failure behavior, and PostgreSQL RLS/migration tests.
- PostgreSQL migration test applies migration twice, verifies PWD protections and preserves other tenants' existing access, and tests request limits.
- Browser tests use mocked submission/email acceptance to prevent real emails or customer records. Public page reads use real website content. **All 12 browser tests pass** across desktop and mobile, including the complete six-step inquiry retry flow.

## Live verification and remaining integration checks

- Reviewed live constraints, policies and RLS flags; applied the database migration transaction and newsletter compatibility migration.
- All 10 live security checks passed: published blogs remain public, private drafts/inquiries/settings are protected, private tables reject anonymous reads, and all three SEO Edge Functions reject anonymous callers.
- A rolled-back live transaction verified an existing admin's transcript write permissions and service-role inquiry/newsletter inserts. No test emails sent or records retained.
- The live newsletter API accepted and persisted a unique test subscription; the exact test row was then deleted successfully.
- Staged homepage/help API checks passed; credential API returned 401. Final deployment was promoted successfully. **All 12 desktop/mobile browser checks passed against the live domain**, including the corrected six-step wizard. Lint is clean; 14 Node/PostgreSQL tests pass.
- Existing Google client ID, client secret and refresh token remain configured in private storage. Interactive admin sign-in, Google token refresh, email delivery and paid provider operations still require end-to-end verification; the tests above do not certify them.
- Optional `ERROR_NOTIFICATION_EMAILS` and `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` remain unset pending real values. Errors are still logged to the admin viewer.

## Re-running locally

```sh
npm ci
npm run lint
npm test
npm run build
npm run start -- --port 3100
# In another terminal, once the server is ready:
npm run test:e2e
```

Do not build into `.next` while the verification server is running. Restart the server after each build before browser tests.

Current branch remains `pwd-030-proof-production`; source changes are uncommitted and unpushed. Production was deployed from this checkout through the CLI. Marketing assets and unrelated branch history remain untouched; `.vercelignore` excludes campaign files and local secrets/artifacts from deployments.

## 2026-09-22 — [Codex] Source recovery supersedes old branch notes

The uncommitted-source deployment practice below/above caused the Sept 21 outage. Recovery combines the complete live application with current SEO pages in fix/restore-training-with-seo, based on origin/main. Publish this complete source to main and deploy only complete Git snapshots going forward. Required-route checks run before/after every build. See memory/changelog.md for final verification and release details.
