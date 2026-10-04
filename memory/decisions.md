# Decisions

## 2026-09-30 — [Claude Code] Public forms use the shared PWD bot-defence layers

CAPTCHA alone is porous (tokens are purchasable) and honeypots are skipped by current bots,
so every public form runs cheap signals (honeypot, fill time, content sanity) first, then
server-verified Turnstile that fails closed, then the durable per-IP limit, and only then
saves and emails the owner. One Cloudflare widget is shared across PWD sites; hostnames are
added per site. Soft signals are flagged in the notification, never auto-deleted.

## 2026-09-15 — [Codex] Review scope

Readiness assessment only: preserve application code, branches, and production data. Fix authorization and lead capture before launch sign-off. Verify target Supabase/Vercel environment before changes; historical project references conflict.

## 2026-09-15 — [Codex] Authorized repair scope

Stephen subsequently authorized fixing the readiness issues. Implemented local repairs; production rollout must follow the tested migration. Preserve unrelated tenants and marketing history. Await the replacement management token Stephen agreed to provide.

## 2026-09-15 — [Codex] Training preview safety and registration design

Use dedicated private PWD training tables and the confirmed cohort JSON; protect duplicate registration with a unique normalised-email/cohort constraint and privately mapped receipt references. Do not overwrite anonymous repeats. Payment remains manual. Preview mail is sandbox-only and credentials are scoped to the deployment. Production needs an explicitly reviewed fresh build/environment, not promotion of the sandbox preview.

## 2026-09-15 — [Codex] LMS access model

Students receive dashboard/introduction access after ordering; paid lessons require verified bank payment or server-confirmed Stripe payment. Dedicated private PWD LMS tables; server ownership checks on every student request. Existing campaign remains, with checkout linked into training centre.

## 2026-09-15 — [Codex] Mentorship programme

Owner requested VUV 25,000 for three months; presented as one total fee. Schedule agreed individually after payment, with private per-enrolment lessons and replays retained after mentoring ends. Private storage replaces unlisted YouTube for individual recordings. Closed business course has no public price until launch details are supplied.

## 2026-09-15 — [Codex] Corrected mentorship package

Supersedes the previous VUV 25,000 note: owner corrected price to VUV 250,000 total for three months. Includes building one software project during the programme and three free months of Digi Assist AI Pro. Pro activation is arranged by the team; the website does not provision Digi Assist entitlements automatically.

## 2026-09-15 — [Codex] Group communities and account emails

Paid group-course students share lounge discussions; instructors (active site admins/super admins) manage announcements and public/private subgroups. Private mentorship remains separate. Existing verified accounts must receive sign-in instructions when signup is retried, never silently claim an email was sent. Account mail shows course recommendations and records provider receipts for admin delivery checks.

## 2026-09-15 — [Codex] Student profile privacy and dashboard

Student profiles and photos are private to their account, not published in course chat. Profile fields are optional except full name; editing them never rewrites past purchase details. Photos are decoded, cropped to 384px WebP and served through signed private URLs. Dashboard schedules and results use owned enrolment records, including individually assigned mentorship sessions.

## 2026-09-16 — [Codex] Training email correspondence

Use existing Resend sender and admin Campaigns area for course follow-ups, with explicit draft/review/send. SMS stays in Vanuconnect. Replies stay in steve@ inbox. Campaign audiences are limited to training-associated verified accounts and opted-in legacy leads, never all auth.users from the shared project. Persist per-recipient status and unsubscribe preferences; do not resend uncertain sends beyond provider idempotency lifetime.

## 2026-09-18 — [Codex] Owner activity notifications

Stephen wants website account/form activity at steve@pacificwavedigital.com. Use separate account summaries rather than BCCing credentials or verification/reset links. Public course caching contains only published metadata; student information stays uncached and authenticated.

## 2026-09-18 — [Codex] LMS administration expansion in progress

Building manual package access, course coupons and advanced assessments. Manual grants use explicit granted/revoked status and zero collected amount; paid orders remain untouched. Coupon allocations are serialized in PostgreSQL and consumed when applied, not on payment; one per order. Questions and settings are snapshotted per server-timed attempt; answer keys stay server-side. Eight question types include instructor-graded essays. Existing MCQ data remains supported. Migration not yet applied; verification/release pending. Memory CLI remains unavailable due missing numpy; shared markdown updated.

## 2026-09-18 — [Codex] Package access and assessment rules

Manual package assignment selects existing verified training accounts by email and one or more courses; it is not a new bundle storefront. Grants record zero collected payment with explicit granted/revoked statuses; real paid/refunded transactions are not overwritten. Coupon redemption consumes an allocation when applied to an order, uses one code per order, snapshots amount/currency and expires any open Stripe session before repricing. Questions/settings are snapshotted per attempt; student question text is released only after the server starts/resumes the attempt. Essay feedback appears in the lesson attempt history. Automatic question scoring is all-or-nothing per question; no partial automatic credit. See docs/LMS-ADVANCED-ADMIN.md.

## 2026-09-18 — [Codex] Lesson thumbnail handling

Lesson artwork uses private course-scoped storage paths and one-hour signed URLs for admins and the existing authorized lesson list. Uploads accept decoded JPG/PNG/WebP up to 3 MB, strip metadata and become 960×540 WebP. Save attaches/removes the path; old files are retained because duplicated lessons can share artwork. Artwork does not publish a lesson. The admin label is Draft until published; students see Coming soon for unpublished lessons.

## 2026-09-22 — [Codex] Training deployment recovery

Production application source must be committed alongside SEO before Git production deployment. Required-route build guard and combined SEO/training browser coverage protect against partial application releases.

## 2026-09-22 — [Codex] Simplified training enrollment

User requested signup-first CTAs and immediate account access without mailbox confirmation. Implementing training-only new-account creation (existing users unchanged, shared Supabase auth settings unchanged), required name/phone/location/attendance/consent, pending enrollment at the server-side course price, immediate password login, and non-blocking welcome email. Payment/grant checks still protect paid lessons. Verification in progress.

## 2026-09-23 — [Codex] Course communication privacy and delivery

- Community messages/mentions notify inside course conversations with unread badges; no automatic chat email campaign.
- Group courses support course lounge, instructor announcements and instructor-managed private groups. Mentorship gets one private room per paid/granted enrollment, with fixed student membership; instructors can access it, other mentees cannot.
- Community attachment storage is private. Downloads proxy through current course/group authorization; membership removal or refund revokes access. Accepted images are re-encoded; up to three files per message, 4 MB per file.
- Eight-second foreground feed polling and fifteen-second conversation count updates; browsing older history pauses live feed replacement. Mention names/IDs come from the current room roster, without exposing student emails.

## 2026-09-25 — [Codex] Course-wide video tutors

All paid/granted courses automatically expose onboarding, class assistant, business-development and branding roles. Reuse authorized Digiassist Anam personas only as avatar/voice/model sources; build PWD-specific ephemeral prompts with verified student/course context. No shared persona edits. Student/course notes are editable and shared across roles; recent device transcripts are explicitly unverified context, never grades. Private lessons stay enrollment-scoped, no answer keys/payment/identity documents enter prompts. Per-user atomic reservation: one active 15-minute session, eight starts per rolling day. Minimize within a course; leaving it ends the session. Wait for the Anam data channel before enabling typed questions (stream readiness alone drops early input).

## 2026-09-25 — [Codex] Specialist coaching roles

User authorized the three recommended additions. Seven roles use the existing private context and shared eight-session allowance. Sales and marketing reuse the strategy avatar; project review reuses the technical tutor avatar. Sales role-play is fictional practice, marketing cannot publish, and project feedback is formative based on shared text rather than unseen files or URLs. No new provider credentials required.

## 2026-09-26 — [Codex] Structured onboarding and meeting lifecycle

Fixed cohort schedules come from the linked cohort config; October curriculum reuses the public outline. Personal practice does not reschedule classes. Explicit Complete onboarding is once per student/course and only accepts a nonempty two-sided dialogue; ordinary ending/interruption permits retry. No retroactive completion of earlier sessions. Coaching availability follows published course end boundaries, with an admin date override and unknown-end courses retaining paid/granted access. Student camera is optional local-only preview alongside Anam in equal tiles, never uploaded or recorded. Seven distinct generated meeting illustrations use the actual configured avatar references; prompts retained.

## 2026-09-27 — [Codex] Voice-only coaching and private report delivery

Use one account-level saved consent across courses; preserve per-course onboarding completion. Anam tools are ephemeral per-session, with awaited authenticated live research. GPT-5.4 hosted web search and DNS-pinned link verification support current sourced guidance. Keep transcript-only summaries separate from supplementary research. Queue reports in Supabase with leased retries and idempotent Resend delivery to the student's account only. All reports/PDFs remain private. Reuse the private recording bucket for course-owned cohort uploads while retaining assigned-student mentorship guards.

## 2026-09-29 — [Claude Code] Affiliate commissions via database trigger
**Context:** Orders become paid in four places (Stripe `fulfill`, admin bank review, 100% coupon RPC, grants). **Decision:** Create commissions in an AFTER UPDATE OF status trigger on `pwd_lms_orders`, with attribution stored on the order (`affiliate_id`) from a server-set httpOnly cookie. **Reason:** One place covers every payment path and future ones; referral cannot be forged client-side and never blocks checkout (best-effort attach). Owner chose: application + approval, 15% of amount paid, manual payouts, no buyer discount.

## 2026-09-30 — [Claude Code] Instructors and student messaging design (owner-approved)
**Context:** "Instructor" was any admin on every course; chat was course-scoped only. Owner wants per-course instructors with their own login/profile and LinkedIn-style student DMs.
**Decision:** Phase 1: `pwd_lms_course_instructors` (many per course), same Training Centre login, admin Instructors tab (invite by email + assign courses), instructor profile (title/bio/expertise) shown on course pages, `/training-center/teach` workspace with FULL teaching control for assigned courses (roster, lessons, recordings, quizzes, grading, announcements, groups, messages) but no payments/banks/coupons/affiliates. Chat instructor powers = assigned instructor or admin. Phase 2: student directory of ALL students (visible by default, can hide; never email/phone), connection requests (accept/ignore, 30-day re-send block, daily cap), 1:1 DMs reusing chat engine, instructors↔their students DM without request, Messages tab; email for requests + one unread-DM reminder after 1h (opt-out); DMs private — admins see only reported conversations.
**Reason:** Owner chose all recommended options 2026-09-30.

## 2026-10-01 — [Codex] Private BLP workshop approval
Owner confirmed no participant fee and admin approval before access; forwarded links must not grant access. Use existing pending → granted/revoked enrollment records with an explicit requires_approval flag, admin participant queue, and no payment/coupon bypass. No OTP is needed for this approval-based path. Private participant eligibility controls discovery/DM/read/download/notification access, even for old connections. Active private participation takes priority over a public enrollment; assigned instructors retain access.

## 2026-10-01 — [Codex] Approved BLP student resources
Owner explicitly requested all three approved v4 PDFs, including facilitator/course guide, in the student dashboard. Store in private bucket and stream only to approved BLP enrollees, with View/Download. Admin approval is the selected eligibility mechanism; no OTP issued. The shared page is unlisted/noindex, while actual learning/chat/resources remain enrollment-protected.

## 2026-10-01 — [Codex] Private-course email scope
Owner requested no other-course promotions or generic payment language for private BLP participants. Private-course account emails skip the catalogue entirely; BLP welcome and approval updates use its branding, schedule, workshop dashboard and eligibility instructions. Public-course recommendations remain unchanged. No old emails are resent.

## 2026-10-01 — [Codex] Locked BLP topic previews
BLP topics without a linked/uploaded recording display a darkened image with lock icon and “Recording coming after training”. Selecting a topic shows the instructor upload notice, without the workbook activity or completion button. Uploading/linking the recording restores the normal player and completion flow. Progress API rejects completing an unrecorded BLP topic; other courses retain their existing behavior. Two targeted tests (including API denial/no progress write), lint/type/build, all nine topic views on desktop/mobile and eight required public release checks passed. No migration or existing progress deletion.

## 2026-10-01 — [Codex] BLP session recording administration
Use the existing private recording uploader and shared lesson editor for all nine BLP sessions. Add explicit upload/save/publish instructions and per-session pending/available/draft status; leave shared course enrollment selected for all approved participants. Actual private storage limit verified at 500 MB with MP4/WebM MIME types. Instructor assignment exists; no separate BLP upload subsystem or migration needed.

## 2026-10-03 — [Codex] October digital workbook implementation

Added 12-lesson October workbook source, course component, authenticated save/export API and additive migration. Scope: participant-private answers with optimistic concurrency, blank PDF and workbook-with-answers PDF export. Source content and DOCX master live in Training Hub/Vanuatu October 2026/workbook-v1. Implementation is under verification; no live release claimed yet.

## 2026-10-03 — [Codex] Workbook visibility and supported learning

Stephen requested actual cover entry card, assigned-instructor read access and per-student AI workbook context. Implementing course-scoped read-only teaching review, bounded labelled session-start AI excerpts and clear student sharing notices. Other students remain denied; no instructor write capability. Verification in progress.

## 2026-10-03 — [Codex] Course languages prepared; translation permission pending

Stephen requested English-default course page with Bislama/French and original-language workbook answers. Found existing Language Hub Bislama gold references (grammar.md, glossary.md, examples.md with 152 curated pairs). Prepared context-based selector, browser-local preference, course/workbook/faculty/community interface translation hooks and AI session language; student answer values/IDs remain unchanged. Prepared scripts/localization/source.json (875 authored strings, no learner data) and documented generation script. bi.json/fr.json are EMPTY placeholders: DO NOT PUBLISH unfinished language work. Automatic approval review rejected sending authored course text + private gold references to Anthropic because this payload/destination was not explicitly authorised. No external generation occurred; script saved for review only. Ask Stephen for approval before running or any indirect transmission. Type/lint/build and six focused tests pass. Live remains main 34e34e3.

## 2026-10-03 — [Codex] Gold translation transfer approved

Stephen explicitly approved authored course text and private gold Bislama reference transmission to Anthropic through the existing service. Prior transfer approval blocker resolved. Generation running; no student data included. Verify coverage/content and language switching before publishing.

## 2026-10-04 — [Codex] Course-first student lists

Stephen requested Students show courses first, then only the chosen course roster. Implemented course drill-down/back navigation, separate no-course account entry, scoped proof/reminder/bulk-contact lists, and selection reset on course change. Existing CRM features retained. Verification in progress; no student data changed or messages sent.


## 2026-10-04 — [Codex] Zoom classroom handoff
Use same-account Zoom Meeting SDK client view for desktop/mobile; instructors host in Zoom. Credentials remain server-only; no contact/recording scopes or paid Video SDK. Encrypted invite pwd is not a plain passcode. App creation requires pending browser security confirmation.


## 2026-10-05 — [Codex] Zoom connection verified
App creation approval resolved. Production secrets/migration and 12-session October meeting configured; first lesson published. Real temporary-student endpoint returned 200, corrected passcode, desktop/mobile real SDK pre-join screen verified. Ten release checks pass. QA Join explicitly accepts Zoom terms; separate confirmation pending, deployment proceeds. No full audio/video claim.


## 2026-10-05 — [Codex] Reusable classroom branding
Use shared PWD shell with lesson thumbnail → course artwork → generic training fallback; course/lesson titles and Vanuatu schedule supplied from existing course data. Desktop panel/mobile banner, focus view preserving iframe, native keyboard modal. User reports successful joining. Verification/publication in progress.


## 2026-10-05 — [Codex] Live-day access and replay lifecycle
User requests Zoom for all twelve days, no live-only completion, and uncropped artwork. Confirmed all twelve existing meeting links; days 2–12 are drafts with empty content/quiz/recordings. Publishing these scheduled lessons under explicit request, retaining enrolment checks. Shared live-recording guard prevents completion until replay; wide artwork uses contain and stacked mobile card. Verification in progress.


## 2026-10-05 — [Codex] Course Challenges in progress
Building Challenges under AI Faculty, private evidence submissions, course-scoped instructor review and admin prize publication/fulfilment. Earliest verified achievement after closing wins; ties use submission time. Awards serialize and respect prize capacity. Configurable drafts for affiliate week 1/2, business launch and first customer. Prize preference asked; no unconfirmed cash commitment.


## 2026-10-05 — [Codex] Challenge prizes approved
Stephen approved VT 2,000 + one Pro month for Week 1 (5–11 October), VT 1,000 + one Pro month for Week 2 (12–18 October), total VT 3,000/two Pro months. Seeded these two published challenge records; business-page/first-customer ideas remain drafts. RLS/service-only schema applied; no cash transfers/subscription changes. Build passed after clearing generated cache to recover disk space. End-to-end verification underway.
