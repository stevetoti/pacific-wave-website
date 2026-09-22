# Vanuatu training — preview handoff

## Scope and status

Implemented the complete owner-supplied brief from `/Users/stephentotimeh/Projects/Training Hub/Vanuatu October 2026/source/website-agent-handoff.md`. Preview only; **not promoted to pacificwavedigital.com**.

Review page: https://pacific-wave-website-fnfd25myj-pacificwaveprojects.vercel.app/vanuatu-training

Review admin: https://pacific-wave-website-fnfd25myj-pacificwaveprojects.vercel.app/admin/training

Vercel deployment: `dpl_D5LoJ99TmDLvS4WTEYzNKa3DJWfz`. Vercel authentication may be required to view the protected preview. Admin also requires an active PWD admin/super-admin account.

## Implemented

- Native, responsive landing page; original PWD logo; compressed illustrative Ni-Vanuatu laptop scene (103 KB WebP). Dates and commercial terms remain text, not a flattened flyer. No trainer identity, private meeting links, invented payment method or income guarantee.
- Confirmed October cohort, 12 dates, Pacific/Efate (UTC+11), 3–5 pm, VUV 35,000 with zero-decimal storage, three Pro months worth US$891 and one additional mentorship month.
- Required Unicode name, email, editable international phone, location and attendance; Other/Outside details conditional; optional area, business direction and 500-character question. Separate required fee/privacy acknowledgement and optional training marketing.
- Registration saves atomically before success. Unique cohort/normalised-email constraint; retries do not overwrite applicants or duplicate registrations. Every attempt has an unguessable receipt, mapped privately to the registration, so public responses never reveal duplicate membership or another applicant's original reference.
- Email runs after the response; independent student/internal state, attempts, atomic two-minute processing lease, provider idempotency keys, redacted errors and admin retry for pending notifications. Public success does not claim email delivery.
- Admin listing, cohort/location/attendance/status filtering, status changes, notes, pagination and formula-safe filtered CSV export. Existing authentication, active role and PWD site checks; new tables and RPCs are inaccessible to anonymous/authenticated direct database roles.
- Owner can explicitly close/reopen registration in the admin; API and page also close after the teaching end. No invented future cohort or seat counter.
- Training navigation link, sitemap/canonical/metadata and branded generated sharing image; course-specific contacts. Existing company-wide footer contacts preserved. Login labels now properly associated with fields.
- Privacy page includes course registration processing and consent. Training analytics remain off until a separate session-scoped analytics choice; form events contain only cohort ID, never answers or receipt references. Existing unrelated-page analytics behavior is preserved.

## Key files

- `src/app/(website)/vanuatu-training/page.tsx`, `training.css`, `opengraph-image.tsx`
- `src/components/training/RegistrationForm.tsx`
- `src/lib/training/cohort.json`, `config.ts`, `schema.ts`, `csv.ts`, `email-templates.ts`
- `src/lib/server/training.ts`, `training-register.ts`, `training-email.ts`
- `src/app/api/training/register/route.ts`
- `src/app/api/admin/training/route.ts`, `[id]/route.ts`, `cohort/route.ts`
- `src/app/(admin)/admin/training/page.tsx`
- `supabase/migrations/20260915_vanuatu_training.sql`
- `scripts/apply-training-migration.mjs`, `scripts/deploy-training-preview.mjs`
- `tests/training.test.ts`, `tests/browser/training.spec.ts`
- Integration edits: Navbar, admin layout/permissions, privacy page, sitemap, GoogleAnalytics, `.env.example`, Playwright configuration.

## Database and configuration

The additive migration and confirmed configuration are applied to `rndegttgwtpkbjtvjgnc`. No previous tenant tables were modified. New tables: `pwd_training_cohorts`, `pwd_training_registrations`, `pwd_training_receipts`.

`src/lib/training/cohort.json` is the checked-in confirmed seed. Its database copy controls runtime registration/schedule/fee and is snapshotted on each registration. The seed script uses `ON CONFLICT DO NOTHING`; rerunning it does not overwrite an owner's closed state or changed configuration. Deliberate future configuration changes must update the reviewed JSON and database row together, then regenerate metadata; no automatic rollover.

Public receipt references are support references, not public lookup capabilities. Additional receipts from duplicate submissions appear privately in the admin.

## Email and preview safety

The preview uses `TRAINING_EMAIL_MODE=sandbox`. Student and internal templates are delivered only to **delivered@resend.dev**, not real applicants or company mailboxes. `test_accepted` is visibly distinct from actual recipient acceptance. Preview/local code cannot enable real recipients even if mode is accidentally set to live: `VERCEL_ENV=production` is also required.

Credentials were passed as **deployment-specific** overrides. No secrets were added to all preview environments. Auto-review rejected the earlier broader destination; the narrower single-deployment approach was approved. Local env files, verification cookies and snapshots remain gitignored; never commit them.

For an approved production launch, set production `TRAINING_EMAIL_MODE=live` and create a fresh production deployment using the normal existing production environment. **Do not simply promote this sandbox preview**: its environment is intentionally different. Production training mail goes to the submitted student email and steve@pacificwavedigital.com. Keep test registrations out of the real cohort before launch. Manual payment and staff status changes remain required.

Existing successful email acceptance is not an inbox guarantee. If a provider accepts but state persistence fails, the stable provider key covers immediate retries; long-delayed uncertain attempts should be reviewed before retry because provider idempotency retention is finite.

## Checks

- Lint clean; Next.js production build passes locally and in Vercel.
- 27 Node/PostgreSQL tests pass. Coverage includes schema validation, dates/fee, duplicate immutability, RLS, receipt mapping, closed state, email claim concurrency, CSV injection, save failure, notification failure and sandbox-only recipients.
- Local desktop/mobile training checks pass, plus real synthetic Port Vila/in-person, Luganville/online and Pentecost/mixed registrations, retry deduplication, real temporary-admin login, filtering, status persistence and CSV export. Both student/internal templates accepted by Resend's test recipient.
- Generated social image resolves to 200 image/png using Next.js's file-based metadata route. Desktop 1280px and phone 390px visuals inspected.
- Final deployed-browser results are recorded in the release journal below.

Test fixtures use UUID-tagged `training-test-…@example.com` addresses and temporary `training-admin-…@example.com` accounts. Tests clean exact fixtures in `finally`; if a worker is forcibly terminated, inspect and remove only those known synthetic records. A prior timed-out run was cleaned explicitly. Do not send live email to real people for QA.

## Re-run

```sh
npm run lint
npm test
npm run build
npm run start -- --port 3100
# Standard UI checks (no real records):
npm run test:e2e
# Explicit synthetic database + sandbox-email test, local server required:
TRAINING_LIVE_TESTS=1 node --env-file=.env.production.local node_modules/@playwright/test/cli.js test tests/browser/training.spec.ts
# Single preview deployment, no persistent env edits or production promotion:
node --env-file=.env.production.local scripts/deploy-training-preview.mjs
```

Never rebuild `.next` while a server is serving it. For protected preview browser tests, `PLAYWRIGHT_STORAGE_STATE` may reference a gitignored domain-scoped Vercel authentication cookie file. No bypass secret should be added globally to browser headers that could reach third parties. See [Vercel automation testing documentation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation).

## Owner inputs and review

No further inputs are required for reviewing this registration page. Before payment/teaching follow-up, supply the payment instructions and refund terms, Pro activation dates/renewal arrangements, recording access arrangements, mentorship cadence and actual meeting links. None is fabricated or publicly implied to exist. Live email delivery to actual students/company and payment processing have not been tested.

All changes remain uncommitted on the existing `pwd-030-proof-production` checkout alongside the earlier readiness repairs. Marketing assets/history are untouched.

## Final deployed result — 2026-09-15 [Codex]

Final protected preview dpl_D5LoJ99TmDLvS4WTEYzNKa3DJWfz passed 21 desktop/mobile Playwright checks; one duplicate mobile integration run was intentionally skipped. This includes the 12 existing site checks and nine new training checks, with real persisted synthetic registrations, temporary admin login, cohort/location/attendance/status filtering, status change, formula-safe export and sandbox email acceptance. All 27 Node/PostgreSQL tests pass; lint and production build pass. Direct anonymous REST access to all three training tables was verified blocked. Test applicant and temporary admin profile counts were checked after cleanup.
