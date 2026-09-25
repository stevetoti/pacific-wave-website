# Decisions

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
