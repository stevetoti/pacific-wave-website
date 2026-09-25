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
