# Student video coaches

Seven roles are available in every paid/granted PWD training course: Onboarding Tutor, Class Student Assistant, Business Development Coach, Branding Coach, Sales Practice Coach, Marketing & Content Coach, and Project Review Tutor. This covers the October cohort, future cohorts, recorded courses and private mentorship without course-specific provisioning.

## Student workflow

Open a course and select **Your personal AI faculty**. Review the context-sharing notice, choose microphone or typing input and start a tutor. The floating session can be minimized while navigating lessons or community tabs inside that course. Selecting an authorized lesson updates the tutor context. Leaving the course ends the session. Sessions last up to 15 minutes, with eight starts per rolling 24 hours across all courses and one active session at a time.

All seven roles use the same student/course coaching notes and recent session dialogue. Students can edit/clear notes and review the last three transcripts. Profile fields come from the student's existing profile; progress and lesson availability come from the LMS. Only relevant learning/business fields are shared, not payment records, credentials or identity documents. Notes/transcripts are unverified student context, not authoritative grades. AI cannot change grades, payment/access, certificates or saved notes through speech. Students save their notes explicitly.

## Architecture and operations

- Browser: lazy-loaded `@anam-ai/js-sdk`, ephemeral token only; no API key in browser bundles.
- API: `/api/lms-coach`, verified Supabase user and current paid/granted course order. Private lessons are scoped to the exact student's enrollment; unpublished material and answer keys are excluded.
- Tables: `pwd_lms_coach_notes`, `pwd_lms_coach_sessions`; service-role-only access and RLS. Atomic RPC reserves session/quota.
- Configuration: `ANAM_API_KEY`, `ANAM_PERSONA_ONBOARDING`, `ANAM_PERSONA_TECH_SUPPORT`, `ANAM_PERSONA_STRATEGY_COACH`. Reused from authorized Digiassist settings. Sales, marketing, branding and business share the strategy avatar/voice with different per-session instructions. Project review uses the technical tutor avatar/voice. Shared Anam personas are never modified.
- Each session fetches avatar/voice/model metadata and mints a personalized ephemeral configuration. Respect the actual avatar model (currently cara-3); do not force a different model.
- Transcripts persist when a session ends normally. Abrupt browser/network termination may lose the current transcript; reservation expires after 15 minutes. Do not promise crash-proof conversation memory.
- Access is rechecked when context refreshes and once per minute while connected. Provider token is limited to 15 minutes; active media cannot be forcibly revoked by this app after a malicious client ignores the close instruction. New context/session requests always reauthorize.
- Existing `apiError` reporting covers provider and database failures without exposing secrets or student transcripts. No new student emails are sent by coaches.

Apply `supabase/migrations/20260925_student_video_coaches.sql` and `supabase/migrations/20260925_add_specialist_coaches.sql` before deploying. Existing LMS/payment/community tables are unchanged. To disable video starts, remove the new Anam credentials from the PWD deployment (not Digiassist). Preserve transcript/notes tables for existing student history.

## Verification

`npm test`, `npm run lint`, `npm run build` plus `scripts/verify-student-coaches.mjs` with isolated synthetic accounts. Public desktop/mobile LMS and release smoke suites must pass before promotion. The integration script uses localhost:3105, cleans fixtures, and writes ignored screenshots under `.deployment/`. Never run it against a production API. Keep local email dispatch disabled.

## Specialist coaching

Sales practice offers clearly labelled simulated buyer conversations, specific feedback and retries. Marketing helps students draft and critique text and plan measurable campaigns; it does not publish content. Project review provides formative feedback on text or descriptions students paste into chat or notes, using a supplied brief/rubric where available. It cannot inspect URLs, screens or uploaded files and never awards official grades. All seven roles share the existing student-level session allowance.

## 26 September: structured orientation and meeting view

Onboarding now reads the linked cohort's official days, times, timezone, dates and teaching/action-period boundaries. Spoken time labels expand ranges (for example, “from three p.m. to five p.m. Vanuatu time”). October's four-week outline is shared with the public course page. Published modules/lessons and known programme outlines ground other courses. The tutor must explain the published structure; student preferences cannot change fixed cohort class times. Private mentorship without published appointments is referred to the human mentor.

Each card has distinct generated meeting artwork based on the configured Anam avatar, a role description and explicit “when to use” guidance. Images are in `public/images/coaches/`; built-in image-generation prompts and provenance are in `docs/COACH-IMAGE-PROMPTS.json`. Student figures in these illustrations are generated, not actual enrolled students.

Students explicitly select **Complete onboarding** after a conversation. Completion is stored per user/course, hides that card across devices and prevents new onboarding reservations. Ordinary End, disconnection or an empty session does not mark completion. Existing old sessions are not retroactively treated as completed so learners can receive the corrected orientation. Other coaches remain available during the course window; transcripts/notes remain readable afterward.

Course coaching ends at the end of the configured local calendar date. The course editor has an optional **AI coaching last day** override (Vanuatu date for courses without a cohort). Otherwise use the cohort action-period end, then its teaching end; known three-month mentorship uses the first published personal appointment plus three months. A course with no end date or scheduled mentorship start remains available with paid/granted access until a date is supplied. Revoked access always blocks coach requests. Active sessions recheck eligibility each minute and have a provider-enforced 15-minute maximum; this does not remotely revoke a provider token from a modified client.

The meeting window has two equal video tiles, native fullscreen with an expanded-viewport fallback, minimize, microphone and optional camera controls. The student's camera is a muted, mirrored **local preview only**: it is not sent to Anam or stored. Permission denial leaves voice/typing available. Ending/leaving a session stops every preview camera track. Transcripts retain the previous normal-end limitations.

Apply `supabase/migrations/20260926_coach_orientation.sql` before deployment. It adds course end dates, private onboarding completion and an atomic owner-scoped finish RPC; existing student notes are preserved.

## 2026-09-27 — Voice sessions, live research and learning reports [Codex]

The course journey now places AI Faculty after Start here and before the live lessons. Welcome cards link to faculty, session history, classes and community. October has twelve generated class thumbnails; an admin-uploaded thumbnail takes precedence. Coming-soon dates describe the scheduled class, and recordings appear only after the trainer publishes them.

Students approve profile/context processing once per account (version `2026-09-27`), shared across courses. Voice is required; camera remains an optional local preview. There is no typed chat or live transcript on the meeting screen. Internal Anam speech history is checkpointed about every 15 seconds and saved at session end. The meeting is portalled outside the course layout so it remains visible across lesson/community navigation. Temporary network failures in background access checks do not immediately terminate a meeting; revoked course access still does.

Every Anam persona receives an ephemeral `live_research` client tool with awaited results. The authenticated API reserves up to six searches per active session; student/session/course ownership and course access are checked. GPT-5.4 Responses hosted web search supplies cited sources; the model can be changed with `COACH_RESEARCH_MODEL`. The coach asks relevant jurisdiction/ownership context instead of inferring citizenship. Official sources are preferred for regulatory questions. Search content is untrusted data. HTTPS source checks pin DNS to public IPs, revalidate redirects, reject private/local targets and enforce a deadline. Links are checked at generation time, not guaranteed permanently.

Migration `20260927_coach_reports.sql` adds private preferences, research records, report jobs and session titles. An ended-session trigger queues a job once. `after()` processes the specific session; the existing five-minute cron recovers expired sessions and queued/retry work. Job leases, three bounded attempts, frozen email payloads and Resend idempotency protect retries. Reports remain available if email fails. Student report email is sent only to the authenticated account's email, with no owner BCC. Preview sends use Resend's test inbox; `TRAINING_EMAIL_MODE=disabled` suppresses delivery and global queue processing locally.

The report writer separately summarizes only the transcript, then develops supplementary sourced research and next steps. A navy/orange HTML email, private dashboard report and PDF share the structured content. PDFs include PWD logo, course/coach/student/session metadata, page numbers and clickable source links. The logo is explicitly included in Vercel function traces. `/training-center/sessions` lists all owned sessions with pagination; detail pages allow renaming and authenticated PDF download. No service-role credential or private email payload is returned to the browser.

### Uploading a class recording

In **Admin → Training Centre**, select the course and lesson, then use **Upload class recording** for an MP4/WebM up to 500 MB. Save the lesson, and publish it when ready. Cohort recordings use a course-owned path in the existing private recording bucket; private mentorship still requires its assigned enrolment. Signed playback is restricted to paid/granted members (or the assigned private student). The database guard rejects cross-course/cross-enrolment paths. Longer videos should be compressed or split to meet the upload limit.

### Operational limits

Sessions retain the existing 15-minute / eight-starts-per-24-hours limits. Reports usually take a few minutes. Abrupt browser closure may lose speech since the last successful checkpoint; transcript loss is disclosed instead of fabricated. Source sites may block automated verification; unavailable links are excluded and the report explains uncertainty. Report failures are visible in the session page and standard server-error reporting; a failed email does not erase the dashboard report. Renaming a session updates its dashboard/PDF title but does not resend an already delivered email.
