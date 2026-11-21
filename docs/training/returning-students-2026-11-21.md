# Returning students go directly to payment — 21 November 2026

[Codex] Stephen reported an October student trying to create another account, then supplied a screenshot showing signed-in checkout asking for contact details again. Final instruction: all returning students should reuse their saved details and go directly to payment for a newly selected course.

## Live release

- Application `d5ba4686f240bab36787c217e1991d4e242d9a50`, deployment `dpl_DfezAgh27JmxxiTSc2bAUtkTETcE`, production READY. Exact `pacificwavedigital.com` alias/SHA verified through Vercel.
- Complete source `.deployment/returning-students-20261121`, pushed branch `codex/returning-students-20261121`. Later commits contain tests/handoff only. Preserves full November, Bislama, SEO, Zoom, private replay and access-gating lineage.
- Previous complete release `dpl_BgprrpkoVvxFFdZRHT7GrBxFoURA`. Interim direct-payment release `dpl_G3dhjKwXkZL6tR3PEfC9FaMnMmQk` lacks the final account-ready guard. No database migration or provider configuration change.

## Behaviour

Authenticated dashboard returns a minimal registration summary resolved from this user's profile and previous orders, with account-name fallback. Explicit selected paid-course checkout reuses those details to prepare one pending order through the existing server-priced/idempotent order action and opens bank/card payment options. It never charges or grants paid access automatically. Missing required contact is collected with known fields preserved. Existing paid/granted/review orders keep their prior handling. Closed-course checks, server prices and affiliate attribution remain.

The saved-details request is bound to the expected signed-in user. The server re-reads only that user's own saved contact instead of trusting supplied contact/price. Switching accounts rejects the pending request. Existing paid orders are not overwritten by repeat visits.

Signup now shows existing-account sign-in before its fields. Structured duplicate/partially-completed-signup errors hand off to sign-in, retaining email/course and clearing the proposed new password. No existing password, confirmation state or profile is overwritten. Sign-in/reset/signup mode updates the browser URL synchronously; selected course/onboarding/dashboard destination survives. Account controls wait for client initialization so early entries cannot be lost during hydration. Bislama/French labels included.

## Acceptance matrix

| ID | Criterion | Result |
|---|---|---|
| R1 | Existing October identity and paid enrolment retained | PASS — targeted read-only check; saved contact complete |
| R2 | Prominent sign-in works without signup verification | PASS — desktop/mobile deployed browser contracts |
| R3 | Duplicate email hands off with same email/course and cleared password | PASS — desktop/mobile; no implicit login |
| R4 | Wrong password and recovery remain actionable; reset mode survives reload | PASS — desktop/mobile contracts; email actions intercepted |
| R5 | Returning student reaches payment without repeating contact form; repeat visits reuse pending order | PASS — browser contract plus server handler tests; real pre-seeded pending-order checkout/reload |
| R6 | Server-price/user-scope/idempotence/closed-course/missing-contact boundaries | PASS — focused handler/helper and existing SQL tests |
| R7 | Actual student sign-in, payment UI and Stripe checkout on desktop/mobile, no overflow/errors | PASS — real isolated identity on staged and final live builds |
| R8 | Exact tested application maps to live alias | PASS — Vercel deployment metadata |
| R9 | Stripe displays VUV250000 for selected one-on-one programme | PASS — actual provider page plus retrieved live session amount/currency/metadata; unpaid |
| R10 | Early sign-in fields remain disabled while JS is deliberately delayed, then work | PASS — staged desktop/mobile and live focused checks; asset pattern includes version query |
| R11 | Additional full desktop marketing-page walkthrough | BLOCKED — live browser walkthrough timed out during page navigation/evaluation; previous staged public suite and live mobile full walkthrough passed |

## Evidence and limits

19 focused tests pass; types/lint/cloud production build/eight source+built route guards pass. Final staged account/signup browser suite14passes/2provider-only skips. Live student contract cases pass across desktop/mobile including targeted retries after transient navigation timeouts. Real student role has no admin/instructor permissions: login -> selected payment -> leave/reload -> bank/card options -> actual Stripe page, both viewports, zero page errors/overflow. Full staged public suite and live mobile public suite passed; broad live desktop marketing walk-through remains uncompleted as recorded above. No claim of real payment completion/webhook or reset-email delivery.

Browser contracts intercept signup/recovery/auth/order requests and do not mutate customers. The actual provider journey used one temporary QA identity and one pending registration seeded with the database email trigger suppressed;18private lesson rows belonged only to that order. Stripe session was verified live/open/unpaid, then explicitly expired. No card details entered, payment made, email queued or message sent. Cleanup verified zero test users/profiles/orders/lessons/emails. All three30minute staging shares revoked. Production error-log scan for final deployment returned zero entries. No separate human cold reviewer was available.

Private evidence is in workspace `output/returning-students-20261121`: verification.json, real-signin-pacificwavedigital.com.json, stripe-verification.json, signin-cleanup.json and desktop/mobile screenshots. Test credentials and temporary-access files removed after cleanup; no secrets committed.

## Student links

Existing-account entry: https://pacificwavedigital.com/training-center/account?mode=signin&course=one-on-one-mentorship

Already signed in: https://pacificwavedigital.com/training-center/checkout?course=one-on-one-mentorship

Ask students with an old open tab to refresh once. Sign in with their original student email; do not create another account.
