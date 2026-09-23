## 2026-09-23 — [Codex] Course communication update

Live admin link: https://pacificwavedigital.com/admin/training-center/community. Select a course to use its shared conversations/private groups. Students open Community & groups inside their paid/granted course; mentorship students use Private mentor chat. Tags notify inside the community, not by email. Private files use current access checks and a 4 MB limit. Full guide: `docs/COURSE-COMMUNICATION.md`. Applied migrations: `20260923_community_features.sql`, `20260923_mentorship_communication.sql`. Complete release source is in `.deployment/training-recovery` on main history; do not deploy the old marketing branch.

# Pacific Wave Digital training centre

## Status — [Codex] 2026-09-15

Implemented locally at `/training-center`. The October campaign now links to checkout. The additive LMS database migration is applied to `rndegttgwtpkbjtvjgnc`; no other tenant tables or shared authentication settings were changed. Production is unchanged.

**Preview deployment was blocked by automatic approval review**: it requires explicit owner approval to send the Supabase service-role and Resend keys to the existing Vercel project as deployment-specific environment variables. Do not bypass this rejection. The local production preview is available while the local server runs at http://localhost:3100/training-center.

## Implemented

- Public live/recorded course catalogue and course-specific checkout.
- Student account creation, email verification, password sign-in and password recovery.
- Shared Supabase public signup is disabled. The server generates a scoped verification/recovery link through the admin auth API and sends it through Resend. This avoids enabling shared public signup or changing shared SMTP/redirect settings. The student explicitly confirms the link; the Supabase SDK verifies the token before creating the browser session.
- Orders use immutable server-selected price/currency and unique student/course keys. October registration obeys both course availability and the existing cohort closure/date settings.
- Hosted Stripe checkout integration, signed webhook fulfillment, amount/currency/order checks, idempotent checkout requests, payment-operation leases, and full-refund access removal. Unrelated Stripe sessions are ignored. **Live Stripe calls remain unverified until keys/account access are supplied.**
- ANZ/BRED bank settings in admin, private PDF/JPEG/PNG proof upload (3 MB maximum), signature/type validation, authenticated ownership checks, expiring admin-only download links, approval/rejection and student-facing review notes.
- Unpaid students can view introductions/timetables. Paid students can access published lessons. Private notes, recordings, meeting links and answer keys are withheld server-side.
- Course dashboard, completed-lesson count, calendar download, click-to-load YouTube recordings, quizzes graded server-side with a 70% pass mark.
- Admin course creation/editing, draft/published states, enrollment closure, lesson/date/meeting/video authoring, visual quiz builder, payment review and bank account editor.
- October course seeded with all 12 confirmed 3 pm Pacific/Efate dates, 5–31 October. Videos and teaching materials remain unpublished placeholders for the trainer to fill.
- Durable registration/payment notification outbox. Successful sends are marked provider-accepted, not inbox-delivered. Pending jobs retry on subsequent authenticated dashboard requests, registration/payment actions or the admin retry button. Live transactional mail copies the course contact; sandbox mail only goes to delivered@resend.dev.
- Privacy notice, site navigation, sitemap and October payment copy updated. Existing legacy training API/admin records are retained; previous registrations are not silently marked paid or converted into student accounts.

## Owner inputs required before advertising

1. Actual ANZ and BRED account names, account numbers, branches and currencies. No fabricated bank instructions remain.
2. Stripe credentials and account currency capability check. `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` blank fields were added to the gitignored `.env.production.local`. Never paste secrets into chat or commit this file. Test credentials are required to exercise cards in preview. No real card charge has been attempted.
3. Approve deployment-specific use of the existing Supabase/Resend credentials in the existing Vercel project, following the automatic-review block.
4. Fresh production release with `TRAINING_EMAIL_MODE=live`, working payment configuration and production Stripe webhook URL `https://pacificwavedigital.com/api/lms/stripe-webhook`. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`. Do not promote a sandbox-email deployment unchanged.
5. Publish trainer-approved class content and meeting links as available. Existing Yumiwork schedule and confirmed course terms are retained. Certificate issuance, AI tutoring, assignment submission and mentorship booking are not included in this first core release.

## Files

- `supabase/migrations/20260915_training_center.sql`: dedicated private LMS tables, October seed, private storage bucket, email outbox and payment lease RPCs.
- `src/lib/lms/`: public types, monetary display and validation.
- `src/lib/server/lms.ts`, `lms-email.ts`: verified student identity, payment fulfillment and notifications.
- `src/app/api/lms/[action]/route.ts`: public catalogue, student and admin endpoints. Every private operation validates the user or active site-scoped admin role.
- `src/app/api/lms/stripe-webhook/route.ts`: raw-body signature verification and fulfillment/refund handling.
- `src/components/lms/TrainingCenter.tsx`, `TrainingAdmin.tsx`: student and admin UI.
- `src/app/(website)/training-center/`: route, metadata and scoped responsive styles.
- `src/app/(admin)/admin/training-center/page.tsx`: existing admin integration.
- `scripts/apply-lms-migration.mjs`: read-only preflight by default; refuses to overwrite an existing LMS schema.
- `scripts/check-lms-auth.mjs`: synthetic signup/token verification and cleanup, without email delivery.
- `scripts/cleanup-lms-tests.mjs`: exact UUID-pattern synthetic fixture cleanup only; never real registrations.

## Verification

- Lint, TypeScript and production build passed.
- 29 Node/PostgreSQL checks passed, including repeatable LMS migration, RLS, seed dates, order uniqueness, notification queue leases, payment locks, price/quiz validation and all earlier registration/security checks.
- Synthetic signup link generation and verification succeeded despite shared public signup being disabled; account was deleted.
- Real local browser workflow passed for signup-session login, order creation, bank PNG proof upload, proof privacy, ownership denial, unpaid content withholding, admin approval, hidden quiz answers, failed/passed quiz attempts and persisted progress.
- Final combined browser regression/admin-authoring results are recorded below when complete.
- All verification emails use the Resend sandbox. Actual recipient inbox delivery and Stripe checkout remain launch checks.

## Notes for the next agent

Read `CLAUDE.md` and shared memory first. Source remains uncommitted and unpushed alongside earlier readiness/training work; preserve unrelated changes. `next.config.js` disables automatic Next.js AGENTS.md rewrites so the canonical CLAUDE.md workflow stays intact.

Use the existing preview deployment script only after the blocked credential transfer is explicitly authorized. Do not broaden persistent preview environment scope. Existing production deployment remains the readiness release identified in CLAUDE.md.

### Final combined verification — [Codex] 2026-09-15

21 browser checks passed and one duplicate mobile integration was intentionally skipped against the local production build. Includes the existing site regression suite, updated October-to-checkout journey, private LMS APIs, real synthetic student/bank-proof/approval/quiz workflow and authenticated admin lesson editing. Desktop/mobile and admin screenshots were inspected. No new public deployment was made because automatic review blocked credential transfer.

## 2026-09-15 — [Codex] Final email and cleanup verification

Repeated the full synthetic workflow with a database assertion that the new notification was accepted by the Resend sandbox; passed. Cleanup verification reports zero leftover synthetic courses or accounts. Local production server remains on port 3100 for review; Codex browser open was queued. Hosted preview is still blocked pending explicit credential-transfer approval.

## 2026-09-15 — [Codex] VUV accounts and shared Stripe configured

Supersedes the earlier missing-bank/key notes. Owner supplied `/Users/stephentotimeh/Coworker/Pacific-Wave-Digital-Accounts.pdf` and explicitly requested only Vatu accounts plus Digi Assist AI's Stripe setup.

- BRED VUV account `013482810100013`, Pacific Wave Digital Ltd., Port Vila, Vanuatu.
- ANZ VUV account `2016305`, Pacific Wave Digital Limited, branch `010982`, SWIFT `ANZBVUVX`, PMB 9003, Port Vila, Vanuatu.
- The USD account was excluded. Settings were saved and read back from the private settings table. Admin/student UI now supports SWIFT and bank address separately.
- Reused only Digiassist AI's live Stripe API key in the ignored `.env.production.local`. The merchant is Global Digital Prime, Inc. (US); charges/payouts are enabled, VUV is supported. Card checkout now discloses this merchant.
- Created a NEW training webhook at `https://pacificwavedigital.com/api/lms/stripe-webhook`, saved its separate signing secret locally, and disabled it until deployment. Its ID/state is in ignored `.deployment/pwd-stripe-endpoint.json`. Do not copy Digi Assist's webhook secret or modify its webhook.
- Training Checkout/PaymentIntent metadata uses `application=pwd_training_center` and `pwd_order_id`, with no generic `order_id` or `client_reference_id`. This avoids Digi Assist's webhook trying to resolve a training order against its own order table. The training webhook also ignores other applications.
- Verified a live VUV 35,000 Checkout Session could be created and then immediately expired it, without card details or any charge. This is account/checkout configuration verification, not a completed card-payment test.
- New safety switch: `TRAINING_PAYMENTS_MODE=live` is required alongside `VERCEL_ENV=production` to use a live key. Keep previews/local runs at the default test mode; live keys cannot make charges from those flows. Set both `TRAINING_EMAIL_MODE=live` and `TRAINING_PAYMENTS_MODE=live` for a reviewed production release, then enable the dedicated webhook.
- Hosted deployment remains blocked by the earlier automatic-review rejection of Supabase/Resend credential transfer to Vercel. This user turn authorized bank/Stripe configuration, not that outstanding credential-transfer approval.
- 30 code/database tests and lint pass, including a regression for ignoring other apps' Stripe orders/refunds.

## 2026-09-15 — [Codex] Training centre live release complete

Owner explicitly authorized deployment. Production deployment `dpl_GDMQGXbLDezkkBkjpdtmSiNZ1a3W` (https://pacific-wave-website-82c1vo9ba-pacificwaveprojects.vercel.app) is promoted to https://pacificwavedigital.com. Production-only Supabase/Resend/Stripe settings are persisted in Vercel; TRAINING_EMAIL_MODE and TRAINING_PAYMENTS_MODE are live. Dedicated PWD Stripe webhook is enabled. The previous automatic-review credential-transfer blocker is resolved.

Public catalogue verification confirms live email/card flags, only ANZ/BRED VUV accounts, and the October VUV 35,000 course. All 20 live desktop/mobile regression checks passed; two transactional integration runs were deliberately skipped on live email settings. Earlier synthetic bank-proof/approval/quiz/admin flow and sandbox email acceptance passed; a VUV 35,000 Stripe checkout was created/expired unpaid. No actual card payment or real inbox delivery was certified in this release.

Public URLs: /training-center, /vanuatu-training. Admin: /admin/training-center. Source remains uncommitted/unpushed alongside prior work.

## 2026-09-15 — [Codex] Split account design published

Published `dpl_4hVMN7LorqANfAWf1QT2fSZHo9Jg` (https://pacific-wave-website-b5ikxteog-pacificwaveprojects.vercel.app). Sign-in/signup/recovery share a student-photo left panel and refined right form; mobile stacks a compact photo cover over the form. Contact widgets are suppressed only on the account route to avoid covering fields/buttons. No auth/payment logic or database changes. Local and Vercel builds, lint and TypeScript pass; local desktop/mobile screenshots inspected. Localhost:3100 was restarted with the same design.

## 2026-09-15 — [Codex] Programme expansion

- Three image-led desktop cards, stacked on mobile. Dedicated public details at `/training-center/programs/how-to-start-a-profitable-business` (coming soon; enrolment closed) and `/training-center/programs/one-on-one-mentorship` (VUV 25,000 total for three months; open).
- `src/lib/lms/programs.ts` holds programme imagery, outcomes and curriculum copy. Database remains authoritative for prices, published/enrolment flags and introductions. The coming-soon course has an internal non-purchasable placeholder amount of 1 to satisfy the existing positive-price constraint; its price is hidden and checkout/order creation blocked. Set the actual price before opening it.
- Additive `20260915_mentorship.sql` applied to verified project. Mentorship course has `private_sessions=true`; each new order gets three personally assigned month placeholders. Trainer arranges actual start/session times. No automatic access expiry after three months, so paid students retain replays.
- Admin > Training centre > Lessons: choose mentorship, select the student's enrolment, edit month placeholders or add individual sessions. Add time/notes/quiz and upload MP4/WebM (bucket limit 500 MB). Save the lesson and mark published when ready. Students must be paid to access materials. File upload goes directly to private Supabase storage using an admin-issued signed upload token.
- Private recordings cannot use YouTube. Restrictive storage policy blocks direct authenticated/anonymous access even alongside other apps' permissive policies. Playback API checks paid owner, course, assignment and publication before generating a four-hour signed URL. Link refresh is available in player. A signed link can be shared within its validity window; this is access control, not DRM.
- Tests: SQL constraints and cross-course assignments, two real temporary students' private isolation, admin-only signed upload, student playback URL, direct storage denial, refunded access denial, desktop/mobile catalogue/detail/checkout/closed-course flows. QA records and clip removed; no real payment or email sent. Existing ANZ/BRED VUV settings reused.

## 2026-09-15 — [Codex] Owner price correction

Supersedes VUV 25,000 references above: mentorship is VUV 250,000 total for three months. Includes one software project built during training and three free months of Digi Assist AI Pro. Live course description/introduction and catalogue/checkout/page copy updated. No existing mentorship orders existed during correction. `20260915_mentorship_offer_correction.sql` records the matching data update for fresh installations. Team must arrange the included Pro access; this update does not create an automatic Digi Assist entitlement integration.

## 2026-09-15 — [Codex] Community and email repair

Group courses now have a Community & groups tab. Paid students can read/post in their course lounge; active PWD admins/super admins are instructors and can post announcements, create course groups, choose private membership and remove messages. Admin > Training centre > Community exposes the same controls. Private mentorship is excluded. New group courses automatically receive a lounge and announcements room. Plain-text messages update every eight seconds while the page is visible; 50-message pages support loading history. No cross-course access, anonymous access, attachments or external message notifications. There is no separate direct-message inbox; students talk through course rooms and instructor-managed groups.

The steve@ account was already verified; previous signup swallowed email_exists and falsely suggested a message was sent. Existing accounts now receive a branded sign-in/course-guide email without changing their password. New accounts get verification and recommendations; recovery sends a secure reset link. Resend access email is available after submission. Verification/recovery keep the selected course. Live recipients are the actual submitted email; previews stay sandbox-only. Account emails use bounded retries with provider idempotency, private receipt logs and explicit failure feedback. Admin > Emails can query provider delivery status. Branded payment/registration updates share the same template. Provider delivered means acceptance by the recipient mail server, not guaranteed inbox placement.

Migration: `20260915_course_community.sql` is additive, all tables private with RLS/direct grants revoked. Instructor group membership replacement is atomic. QA uses isolated synthetic courses/users/messages; all sandbox email tests and community access tests are cleaned up afterwards.

## Student dashboard — 2026-09-15 [Codex]

The student workspace has sidebar sections for overview, courses, schedule (ICS export), quiz results, purchase history (CSV export), course communities, profile and account settings. Mobile uses a section selector. Profiles support photo, name, phone, city, country, occupation, organisation, website, timezone, bio and learning goals. Only name is required. Data is private to the account; historical orders remain unchanged.

Migration `20260915_student_profiles.sql` adds private `pwd_lms_profiles` and private `pwd-student-avatars` storage. `/api/lms-profile` requires student authentication and enforces ownership. JPEG/PNG/WebP inputs up to 3MB are decoded/cropped to 384px WebP; SVG is rejected. Signed URLs expire in one hour. Course summaries exclude other students’ private mentorship sessions and never return quiz answers or recording URLs. Verification: `scripts/verify-student-dashboard.mjs` uses temporary fixtures and intercepts dashboard email dispatch during QA.

## 2026-09-15 — [Codex] Student dashboard released

Production is dpl_EijQoYo5diBD1oDgC7onY9qGa23f (https://pacific-wave-website-31443gwud-pacificwaveprojects.vercel.app). New sidebar dashboard, private profile/photo editing, course progress, schedules/ICS, quiz results, purchases/CSV, community shortcuts and settings are live. Migration applied. Build, lint, 35 tests, isolated student API/browser checks and six live desktop/mobile checks passed. Temporary accounts, photos, courses and orders removed. Production email/Stripe/VUV banks verified unchanged. Source remains uncommitted/unpushed in the shared working tree.

## 2026-09-16 — [Codex] CRM export released

Published dpl_A6wW8HkLbbNHNVg7QtmfgpjYXesU (pacific-wave-website-hgm7jtsds-pacificwaveprojects.vercel.app). /admin/training-center Payments now offers course/status-filtered CSV export via admin-only /api/lms/students_export. Includes order contact/course/payment fields, all matching records through pagination, CSV formula neutralisation. Private profile details excluded. Build/lint and isolated admin/student/filter/export checks passed; fixtures removed. No bulk email composer exists; Emails remains delivery tracking. No messages sent.

## Admin email campaigns — 2026-09-16 [Codex]

Open Training centre LMS → Campaigns. Create a campaign, choose a starter template or write paragraphs, select the audience, save the draft, review recipients, optionally send a test to the signed-in admin email, then use the explicit Send button. Each recipient gets a separate branded message. `{{first_name}}` personalises the greeting. Replies go to steve@pacificwavedigital.com; this release does not replace that inbox with an inbound conversation interface.

Audiences: verified training-associated accounts; accounts with no order; pending/review/rejected payments (optionally course-filtered); paid students (optionally course-filtered); accounts with no registration for a selected course; legacy October leads who opted into future training. Other shared Supabase app accounts are excluded. Suppressions and duplicate email addresses are removed. Review creates a fixed snapshot. Editing a draft discards the snapshot; sent campaigns are immutable and can be copied into new drafts.

Migration `20260916_training_campaigns.sql` creates private campaigns, recipients and suppression tables plus service-role-only SQL functions. Queue claims use locks; provider keys are stable per recipient; retries stop for uncertain deliveries older than 23 hours rather than risk a duplicate outside the provider's 24h idempotency window. `needs_review` indicates uncertainty, not confirmed failure. Cancel stops remaining deliveries; in-flight messages may still arrive. Preview/local emails always target Resend's sandbox. Real sends require production+live flags and a production-created campaign.

Vercel cron `/api/cron/training-campaigns` runs every five minutes with CRON_SECRET; new sends also start a worker immediately. Drafts never send automatically. Refresh campaign view for local counts; Check delivery with provider refreshes up to 20 receipts at a time and suppresses bounces/complaints. Accepted is provider acceptance, not proof of inbox placement. Campaigns include a confirmation unsubscribe page plus RFC one-click endpoint; essential account/payment emails are unaffected.

Validation: 37 automated tests, build/lint and real isolated admin/student desktop/mobile workflow. Personalised sandbox receipt, audience scope, duplicate-send rejection, immutable sent campaign and unsubscribe exclusion verified; QA fixtures removed. No student campaign sent during implementation.

## 2026-09-16 — [Codex] Registration email links published

Live dpl_4ejLgpzijr8ULmHPUrtXaSdTQ2xa (pacific-wave-website-mzhtr363p-pacificwaveprojects.vercel.app). New October form emails include account/sign-in, direct October checkout, Stripe/bank-proof instructions and dashboard link in branded HTML and plain text. Removed obsolete manual-payment-instructions promise. LMS pending/rejected emails link to checkout; paid/review emails link to course. Meeting links remain instructor-published. 37 tests, lint and Vercel build passed; production live flags verified. Existing recipients were not resent messages.

## Owner alerts and performance — 2026-09-18 [Codex]

Owner requested all account/form activity at steve@. Account signup/access/reset requests, new newsletter subscriptions, student profile/photo saves and lesson/quiz submissions now queue a separate owner summary in `pwd_owner_notifications`. No passwords, auth tokens, verification/reset links, private biographies or learning goals are copied. Existing course-registration/payment BCCs and October internal emails remain. Project/contact enquiry routing always includes steve@ regardless of the configurable additional recipients. Duplicate newsletter subscriptions do not generate duplicate alerts.

Queue migration `20260918_owner_notifications.sql` applied. Private service-only queue, unique event keys, lease locking, stable provider keys, production/sandbox separation and cron retries. Existing five-minute training worker processes owner alerts before campaigns; maxDuration 120 seconds. Pending sends older than the provider idempotency window become `needs_review`. UI profile summary endpoint returns only name/photo for the account menu. This covers submitted forms/account activity, not passive visits or each community chat message.

Training catalogue and public programme pages now receive cached published course data during server rendering (60-second cache). No student/session information enters the cache. Public visitors do not wait for client catalogue/session/dashboard requests; private course pages skip irrelevant catalogue loading. Dashboard and community code is dynamically imported; image priorities and lazy image loading retained. Same Inter/Jakarta fonts moved from render-blocking Google CSS import to Next-managed self-hosted font files.

39 automated checks and lint passed. Production build and six desktop/mobile public navigation checks passed for the server-rendering release. Deployed pages work with JavaScript disabled. Local real-database integration was interrupted by connection timeouts; management inspection confirmed no temporary accounts remained. A one-recipient test (receipt 01a0b46d-4d85-7304-a04d-75f061e53fdb) sent directly to steve@ was confirmed delivered. The generic worker was not invoked for that test because automatic review correctly blocked its potential to process student campaigns. Network instability made speed samples variable; do not present them as a guaranteed load-time improvement percentage.

## 2026-09-18 — [Codex] Advanced course administration

Live deployment: dpl_zXaUViQ2ECjk7Ch3CwamjPkV1U1C, https://pacific-wave-website-enpsr4kd9-pacificwaveprojects.vercel.app. Full operational guide: `docs/LMS-ADVANCED-ADMIN.md`.

Access grants, course coupons, modules/lesson duplication, eight assessment types, import/export question banks, attempts/timers, and instructor grading are released. New private migrations applied. Grants preserve actual paid transactions and recorded money; coupons use the shared locked checkout flow and zero-fee redemption bypasses payment. Group community access and enrolled-student campaigns include grants; private mentorship ownership remains enforced. Correct answers stay server-side and questions load only when an attempt starts.

Validation: 41 automated code/SQL tests; lint/TypeScript; local and Vercel production builds; isolated real Supabase admin/student API checks and browser editor/desktop/mobile quiz flows. Fixtures cleaned up. Staged live email, live Stripe, both VUV banks and October VUV35,000 verified. No actual-money payment was made by QA. Source remains uncommitted/unpushed.

Post-promotion verification: all six live public desktop/mobile smoke checks passed, including course catalogue, October registration entry, mentorship navigation, hydration and layout. Release complete.

## 2026-09-18 — [Codex] Lesson thumbnails

Live dpl_Eu5HccX8AogwF9wDrQpv5u4YSiyv. Admin Lessons → open lesson → Upload lesson thumbnail → Save lesson. JPG/PNG/WebP, max 3 MB, converted to 960×540 WebP. Replace or remove and save. Private signed images appear in admin/student lesson lists and selected lesson covers. Placeholder is renamed Draft; publishing remains explicit. Migration applied; 43 tests plus real upload/ownership/privacy/save/reload/replacement/removal/publication and desktop/mobile visual checks passed. Fixtures cleaned up; production email/payment flags unchanged.

## 2026-09-22 — [Codex] Simplified signup-first enrollment

Course registration CTAs now open `account?mode=signup&course=<slug>` directly. The October detail page includes a sticky Join class CTA. New student signup requires full name, phone, location, online/in-person/mixed attendance, email, password and privacy consent. Server creates only a NEW confirmed training account, saves the contact profile and a pending course order at the server-controlled fee. Browser signs in immediately and opens payment; there is no email confirmation gate or second registration form. Course payment/grant protections remain in place. Welcome/owner notifications run after the response. Existing users must sign in/reset their own password; signup cannot confirm, change or take over existing accounts. Supabase project-wide auth settings are unchanged. Legacy email verification and password reset links remain supported.

Location is stored in the existing profile city/location field; attendance is in account metadata and the selected course order. No schema migration is required. Existing-email/closed-course cases are covered by tests; an isolated real auth check verified immediate sign-in, profile persistence, unchanged existing unconfirmed users and fixture cleanup. Final release status is in shared memory.
