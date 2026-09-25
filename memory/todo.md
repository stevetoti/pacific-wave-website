# Todo

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
