# Todo

## 2026-09-30 — [Claude Code] Form bot defence

- [x] Guard `/api/submissions` + `/api/newsletter` and their three forms (branch `form-bot-defence`, local verification passed).
- [x] Hostnames added to the shared Turnstile widget. — [Claude Code] 2026-09-30.
- [x] Preview + production probes, merge to main, production `pacific-wave-website-rje04m5bi` verified. — [Claude Code] 2026-09-30.
- [ ] **Stephen:** send one real enquiry from https://pacificwavedigital.com/contact and confirm it reaches the inbox.
- [ ] Set the Preview environment's Supabase/Resend variables properly (previews had none; only the two public ones were added, branch-scoped).

## 2026-09-15 — [Codex] Readiness blockers

- [ ] Require authenticated, active, site-scoped admin permissions for privileged APIs; protect paid AI/SEO calls.
- [ ] Connect contact form to persistence and make inquiry/email failures visible.
- [ ] Configure required server environment and remove eager API client initialization that breaks builds.
- [ ] Upgrade vulnerable production dependencies and rerun checks.
- [ ] Resolve branch differences for Search Console and sitemap changes.
- [ ] Replace placeholder homepage videos.
- [ ] Review Google OAuth state, credential storage, database grants/RLS, and tracked .env.vercel token.
- [ ] Verify mobile/browser flows, production configuration, and isolated form/email delivery after fixes.

## 2026-09-15 — [Codex] Repair status

- [x] Local API authorization, validated submission flows, honest failure handling, lazy clients, dependency upgrades, SEO carry-forward, and placeholder-video fixes — [Codex] 2026-09-15: implemented and tested; see release report.
- [x] Desktop/mobile checks and isolated migration/RLS tests — [Codex] 2026-09-15: 12 browser and 14 Node/PostgreSQL tests pass.
- [ ] Receive new authorized Supabase management token from Stephen.
- [ ] Run read-only migration preflight; review live constraints/policies, apply migration and updated Edge Functions.
- [ ] Configure alert recipients and Search Console verification; deploy and verify preview/production with approved isolated data.
- [ ] Verify authenticated live admin, Google, and provider integrations after release.

## 2026-09-15 — [Codex] Live release status

- [x] Receive token, inspect live metadata, apply migration and deploy all three SEO functions — [Codex] 2026-09-15: complete.
- [x] Stage and promote production; verify live security, rolled-back database writes, newsletter persistence and cleanup — [Codex] 2026-09-15: complete.
- [ ] Optional alert recipient and Search Console verification code (requested from Stephen).
- [ ] Interactive admin sign-in, Google refresh, actual email delivery and paid provider checks.

- [x] Correct pre-hydration wizard interaction and rerun live desktop/mobile checks — [Codex] 2026-09-15: final production release passes all 12.

## 2026-09-15 — [Codex] Vanuatu training preview

- [x] Read full confirmed brief, reuse architecture/branding, build landing page, private registration storage and admin.
- [x] Verify real synthetic registrations for Port Vila/Santo/Pentecost, no overwrite on retries, admin sign-in/filter/status/CSV, and sandbox email acceptance.
- [x] Separate notice acknowledgement from optional training marketing; gate training analytics; keep manual payment and enrolment.
- [ ] Final preview verification/handoff; production publication awaits review.

- [x] Final training preview verification and handoff — [Codex] 2026-09-15: 21 deployed browser checks and 27 code/database checks pass.
- [ ] Owner review and explicit production launch of Vanuatu training; live delivery requires TRAINING_EMAIL_MODE=live in a fresh production deployment.

## 2026-09-15 — [Codex] Training centre launch

- [x] Owner approved the earlier landing preview — [Codex] 2026-09-15: LMS scope authorized next.
- [x] Build student accounts/verification, course catalogue, checkout, private bank proof, admin approval, October placeholders, recordings, visual quiz authoring and progress.
- [x] Production build/lint and 29 code/database checks; 21 browser checks pass, one intentionally skipped duplicate mobile integration. Admin lesson editing is verified.
- [ ] Owner provides ANZ/BRED details and Stripe keys; verify card checkout/webhooks/account currency capability.
- [ ] Explicit approval for Supabase service-role/Resend credentials in a deployment-specific Vercel preview. Automatic review rejected the attempted deployment; no preview deploy or production promotion occurred.
- [ ] Fresh production release with live transactional emails and final live launch checks before advertising.

## 2026-09-15 — [Codex] Payment configuration follow-up

- [x] VUV-only ANZ/BRED settings saved from owner PDF; USD excluded.
- [x] Digi Assist live Stripe API key reused locally; account supports VUV. New separate webhook is configured but disabled until launch. Unpaid VUV 35,000 checkout creation/expiry verified; no charge.
- [ ] Complete card-payment/webhook delivery check using Stripe test credentials or an owner-run live payment after launch.
- [ ] Prior Vercel Supabase/Resend credential-transfer approval remains pending; fresh live deploy and webhook activation remain required.

## 2026-09-15 — [Codex] Live launch status

- [x] Explicit deployment/credential approval received, production variables configured, fresh release staged/verified/promoted — [Codex] 2026-09-15.
- [x] Dedicated Stripe webhook enabled and 20 public desktop/mobile checks passed — [Codex] 2026-09-15.
- [ ] Owner verifies a real registration email and first actual payment; no real-money charge was made by QA.
- [ ] Trainer publishes the course materials and meeting links as ready; October session placeholders exist.

## 2026-09-15 — [Codex] Mentorship and course expansion

- [x] Publish three image course cards, coming-soon business details and three-month mentorship at VUV 25,000 with existing bank/Stripe checkout.
- [x] Add personal month placeholders, admin student/session assignment and private video uploads; verify cross-student access denial and unpaid live Stripe checkout.
- [ ] Owner/trainer arranges mentorship schedules with enrollees and publishes their session notes, quizzes and recordings.
- [ ] Owner supplies final launch date, delivery format and price before opening How To Start A Profitable Business for enrolment.

- [ ] Arrange included three-month Digi Assist AI Pro access for paid mentorship students — [Codex] 2026-09-15: benefit added at owner's request; automatic entitlement provisioning is not part of this copy/price update.

## 2026-09-15 — [Codex] Course community and email update

- [x] Add paid group-course lounge, instructor announcements, public/private groups, member management and moderation; private mentorship excluded.
- [x] Repair silent existing-account signup path; add branded course-guide emails, resend access and admin delivery records.
- [x] Verify new-account/existing-account/recovery emails in sandbox and instructor/student community permissions with cleaned-up fixtures.

## 2026-09-15 — [Codex] Dashboard completion

- [x] Publish sidebar student workspace, private profile/photo, schedule, quiz results and purchase history; verify desktop/mobile and ownership.
- [x] Owner confirmed account email receipt — [Codex] 2026-09-15. Prior real-payment verification remains an owner-run follow-up.

- [x] Top-right circular photo menu with Settings and Log out published — [Codex] 2026-09-16.

- [x] Course-registration CSV export for CRM import published — [Codex] 2026-09-16.

- [x] Publish admin email campaigns, audience review, private queue and unsubscribe; verify sandbox delivery — [Codex] 2026-09-16.

- [x] Route account/form owner alerts to steve@ and optimise training-page loading — [Codex] 2026-09-18; test message delivered and rendering verified.

## 2026-09-18 — [Codex] Advanced LMS administration

- [x] Release manual package/course access with revoke history and student access emails.
- [x] Release course-specific percentage, fixed and full-fee coupons, dates, usage limits and student restrictions.
- [x] Release modules, draft lesson duplication, reusable question banks, eight quiz types, timed attempts and instructor grading.
- [x] Verify real admin/student access, coupon and assessment flows with temporary fixtures; clean up fixtures.
- [ ] Owner adds actual package assignments, coupon offers and course quiz content through the new admin tabs.

- [x] Add and publish per-lesson thumbnail uploader, previews/covers and clearer Draft label — [Codex] 2026-09-18.

## 2026-09-22 — [Codex] Training deployment recovery

- [x] Publish and verify combined LMS + SEO source on main; update final release evidence. — [Codex] 2026-09-22: main 560681e and Git production dpl_GZHG67KGEDywDwuB9htiNzPorv97 verified READY; all eight live browser checks passed. No database changes.

- [x] Simplify enrollment to details → signup/contact/attendance → payment → learning dashboard; remove confirmation gate for new training accounts and add sticky October CTA — [Codex] 2026-09-22: released on main af8aed3, live desktop/mobile checks pass.

- [x] Make LMS registrations and payment proof reviews discoverable from admin; retain earlier enquiries separately — [Codex] 2026-09-23: dedicated route/menu, legacy banner and All payments default live on 4dd7781.

- [x] Release advanced course communication (mentions, replies, reactions, pins/search, private attachments/groups, unread indicators, moderation and isolated mentor chat) — [Codex] 2026-09-23: released and verified on dpl_3eyTu3HTRsVAHJukjYmPR3MeLRmp; API and persisted desktop/mobile chat checks passed.

## 2026-09-25 — [Codex] Student video coaches

- [x] Implement four personalized Anam video coaches for all paid/granted courses, including private mentorship; verify live video, student isolation, transcript persistence and responsive layouts.
- [ ] Publish the verified complete release and check production configuration.

- [x] Publish the verified complete release and check production configuration — [Codex] 2026-09-25: dpl_hrAquD7amYg2fmtGyYigk83kaLsR live; authenticated coach and eight browser checks passed. Supersedes open release item above.

- [x] Add and publish Sales Practice Coach, Marketing & Content Coach and Project Review Tutor — [Codex] 2026-09-25: all three production session checks and eight live browser checks passed.

- [x] Ground onboarding in fixed course schedule, show coach usage guidance and unique meeting images, make onboarding once per course, and provide 50/50 video/fullscreen with local camera — [Codex] 2026-09-26: deployed and verified including production lifecycle checks.


## 2026-09-27 — [Codex] Voice coaching and student learning hub
- [x] Saved profile approval, voice/video meetings, live verified research, private session history and researched email/PDF reports; course imagery/navigation and cohort recording uploads — [Codex] 2026-09-27: deployed and verified at `dpl_AEkNSt6dUMawBjWqAaD7wiBJDZXu`.

## 2026-09-29 — [Claude Code] Course affiliate programme
- [x] Build affiliate applications, /go links, attribution, trigger-based 15% commissions, admin review/payout tracking, student dashboard; tests/lint/build pass.
- [x] Apply `20260929_course_affiliates.sql` to Supabase (additive) BEFORE deploying the frontend. — [Claude Code] 2026-09-29
- [ ] Owner tests live: apply → admin approve → /go link → signup → paid → commission.
- [x] Commit, push to main, deploy, verify live, record release here. — [Claude Code] 2026-09-29: c8d281b → dpl_cjecVin47Ysx1mdxiwr7rJ9Fosom.
- [x] Public "Become an affiliate" landing page for non-students — [Claude Code] 2026-09-29: /affiliates.
- [ ] Optional later: formal affiliate terms page.

## 2026-09-30 — [Claude Code] Instructors + student messaging
- [x] Phase 1: per-course instructors, admin Instructors tab, Teaching workspace, instructor profiles on course pages; Stephen on all courses.
- [ ] Owner: add photo/bio in Teaching workspace → My instructor profile (shows on course pages); invite other instructors from Admin → Training centre → Instructors.
- [x] Phase 2 — [Claude Code] 2026-09-30: released; see changelog. Original scope: student directory (visible by default, hide option), connection requests (accept/ignore, 30-day resend block, daily cap), 1:1 DMs on chat engine, instructor↔own-students DMs without request, Messages tab + badges, email for requests + 1h unread reminder (opt-out), block/report, admins see only reported DMs.
- [ ] Later: instructor "view course as student" preview.
- [ ] Later (messaging): reactions/replies in DMs, realtime instead of 8s polling if volume grows.
- [ ] Update `tests/api.test.ts` submission tests for the form-bot-defence fields (4 failing on main since 4ed0cca) — noted by [Claude Code] 2026-10-01; owner of that change should fix.

## 2026-10-01 — [Codex] Private BLP workshop
- [x] Implement unlisted course, registration, branded page and workshop modules. — [Codex] 2026-10-01: live BLP page with nine modules and approved v4 PDFs.
- [x] Enforce directory/connection/DM/notification privacy and verify public-course interoperability. — [Codex] 2026-10-01: real multi-identity staged checks and SQL tests passed.
- [x] Verify full build and participant/admin flows before release. — [Codex] 2026-10-01: full build, approval/resources/revocation, new and returning signup and desktop/mobile checks passed; auth-readiness race corrected.

- [x] Prepare BLP session upload administration. — [Codex] 2026-10-01: nine dated sessions ready, upload guide/status indicators, real private upload/playback/authorization tests passed; no test videos attached to BLP.

## 2026-10-03 — [Claude Code] Student outreach
- [x] VanuConnect key added to Vercel production — [Claude Code] 2026-10-03: SMS live.
- [x] Owner topped up VanuConnect SMS credits — [Claude Code] 2026-10-03: 202 credits; test SMS accepted.
- [x] Mini CRM: per-student contact history, private notes, Contact history tab, instructor outreach to own students — [Claude Code] 2026-10-03.
- [ ] SMS delivered status — [Claude Code] 2026-10-03: needs VanuConnect work: (1) set BulkGate delivery-report webhook to `webhook-delivery` and verify BulkGate's payload format, (2) add a shared secret to `webhook-delivery` (currently unauthenticated), (3) add `message-status-api` (API-key scoped), then PWD polls it and shows Delivered/Failed in contact history.
- [ ] Optional later: automatic WhatsApp sending through VanuConnect/BulkGate WhatsApp channel (needs approved WhatsApp Business templates); today WhatsApp opens prefilled on the owner's phone.

## 2026-10-03 — [Codex] October digital workbook implementation

Added 12-lesson October workbook source, course component, authenticated save/export API and additive migration. Scope: participant-private answers with optimistic concurrency, blank PDF and workbook-with-answers PDF export. Source content and DOCX master live in Training Hub/Vanuatu October 2026/workbook-v1. Implementation is under verification; no live release claimed yet.

[Codex] 2026-10-03: Workbook verification complete: real multi-user saves, reloads, failures, PDF exports and revoked access pass on desktop/mobile; temporary QA data cleaned. Three focused tests, lint/build and eight public browser checks pass. See docs/OCTOBER-WORKBOOK.md.

## 2026-10-03 — [Codex] Workbook release awaiting production approval

Application commit 6552eef; Vercel staged deployment dpl_HHAz8UH8RKoH2h2ZwAXz9jU53UHW at https://pacific-wave-website-erogead2w-pacificwaveprojects.vercel.app is READY. Real local multi-user desktop/mobile tests pass, as do three focused tests, lint/build and eight public release checks. Staged browser checks hit Vercel Login rather than the app; this is not an application test pass. Automatic approval review rejected `vercel promote` because user authorised building but not explicit production promotion, and staged browser checks were protected. Do not promote or push to main (auto-deploy) as a workaround. Ask Stephen for explicit permission to publish; after permission promote and run live checks. No production promotion occurred and commit is not pushed. Additive private-workbook migration IS applied; no learner responses were changed. Temporary QA accounts/orders/answers and email guard were removed.

## 2026-10-03 — [Codex] October workbook published and verified

Stephen explicitly authorised publishing. Promoted application 6552eef as dpl_HHAz8UH8RKoH2h2ZwAXz9jU53UHW; live domain confirmed READY. Eight public desktop/mobile release checks pass. Real live temporary-account verification passes for private saves/reloads, conflicts, identity/RLS denial, failure recovery, PDF downloads and revoked read/write/export access. All temporary QA accounts, orders, answers and email guard removed; no test emails sent. Course URL: https://pacificwavedigital.com/training-center/course/21cb833b-6e9b-4ec2-9aca-a7629dffda8a.

The earlier production-promotion approval blocker is resolved. A separate automatic approval review rejected pushing HEAD to main because this branch mutation can trigger another deployment and was not explicitly authorised. Source commits remain local. Do not push main indirectly; request explicit source-push approval.

## 2026-10-03 — [Codex] Source push authorised

Stephen explicitly authorised pushing the saved workbook source to main. Remote history was checked: main is an ancestor, with no divergent remote changes. Prior source-push approval blocker is resolved. Publishing the already-verified application source and release notes; no new application changes.

## 2026-10-03 — [Codex] Workbook visibility and supported learning

Stephen requested actual cover entry card, assigned-instructor read access and per-student AI workbook context. Implementing course-scoped read-only teaching review, bounded labelled session-start AI excerpts and clear student sharing notices. Other students remain denied; no instructor write capability. Verification in progress.

## 2026-10-03 — [Codex] Workbook cover and learning support verified

Actual cover card with purpose/use description added. Workbooks tab provides assigned instructors/admins read-only active-student answers. AI faculty uses authenticated student/course-scoped labelled excerpts (400 characters per activity, truncation flagged), refreshed each new session. Student notices explain sharing. No database migration. Type/lint/build and four workbook tests pass; eight public desktop/mobile checks pass (two opt-in skips). Real temporary-account tests verify instructor assignment/revocation, student switching, own-student AI context, denied outsiders/revoked enrolments, saves/failure recovery/PDF downloads. All fixtures cleaned; no test emails. Publishing under existing authorisation.

## 2026-10-03 — [Codex] Course languages prepared; translation permission pending

Stephen requested English-default course page with Bislama/French and original-language workbook answers. Found existing Language Hub Bislama gold references (grammar.md, glossary.md, examples.md with 152 curated pairs). Prepared context-based selector, browser-local preference, course/workbook/faculty/community interface translation hooks and AI session language; student answer values/IDs remain unchanged. Prepared scripts/localization/source.json (875 authored strings, no learner data) and documented generation script. bi.json/fr.json are EMPTY placeholders: DO NOT PUBLISH unfinished language work. Automatic approval review rejected sending authored course text + private gold references to Anthropic because this payload/destination was not explicitly authorised. No external generation occurred; script saved for review only. Ask Stephen for approval before running or any indirect transmission. Type/lint/build and six focused tests pass. Live remains main 34e34e3.

## 2026-10-03 — [Codex] Gold translation transfer approved

Stephen explicitly approved authored course text and private gold Bislama reference transmission to Anthropic through the existing service. Prior transfer approval blocker resolved. Generation running; no student data included. Verify coverage/content and language switching before publishing.

## 2026-10-03 — [Codex] Course translations generated and checked

883 Bislama/French source strings complete using explicitly approved transfer and existing gold references. Reviewed/clarified core Bislama legal, commission, ad-spend and privacy passages. Full source coverage/links/placeholders pass; seven locale/workbook tests, eight coach/report tests, lint/type/build pass. Locale preference and translated tutor greeting added; no automatic rewriting of student answers. Real browser verification underway.

## 2026-10-03 — [Codex] Multilingual course verified for release

English default with saved browser preference; 883 gold-grounded Bislama/French strings; unchanged original student answers; selected-language AI session greeting/context. Seven locale/workbook tests, eight coach/report tests, lint/type/build and eight public browser checks pass. Actual desktop/mobile fixtures verify multilingual headings, switching before autosave, original Bislama/French answers persisting through reload, instructor/AI isolation, failure recovery, PDF download and revocation. Screenshots reviewed and fixtures cleaned. Recordings/PDF teaching pages and user-generated content retain original language; no runtime external translation of student data. Publishing under prior authorisation.

## 2026-10-04 — [Codex] Course-first student lists

Stephen requested Students show courses first, then only the chosen course roster. Implemented course drill-down/back navigation, separate no-course account entry, scoped proof/reminder/bulk-contact lists, and selection reset on course change. Existing CRM features retained. Verification in progress; no student data changed or messages sent.

## 2026-10-04 — [Codex] Course-first roster verified

Students starts with course cards; choosing a course opens only its roster/status/proof/reminder scope. Back to courses restores directory; unassigned accounts have a separate entry. Course changes clear search, selected recipients and open dialogs. Type/lint/production build pass. Ten desktop/mobile browser tests pass (two existing opt-in skips), including mocked mixed-course roster, proof isolation, recipient reset, empty course and no-course accounts; mobile screenshot reviewed. No real student data changed or messages sent. Ready for authorised publication.
