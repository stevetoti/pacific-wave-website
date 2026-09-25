# Student video coaches

Four roles are available in every paid/granted PWD training course: Onboarding Tutor, Class Student Assistant, Business Development Coach, and Branding Coach. This covers the October cohort, future cohorts, recorded courses and private mentorship without course-specific provisioning.

## Student workflow

Open a course and select **Your personal AI faculty**. Review the context-sharing notice, choose microphone or typing input and start a tutor. The floating session can be minimized while navigating lessons or community tabs inside that course. Selecting an authorized lesson updates the tutor context. Leaving the course ends the session. Sessions last up to 15 minutes, with eight starts per rolling 24 hours across all courses and one active session at a time.

All four roles use the same student/course coaching notes and recent session dialogue. Students can edit/clear notes and review the last three transcripts. Profile fields come from the student's existing profile; progress and lesson availability come from the LMS. Only relevant learning/business fields are shared, not payment records, credentials or identity documents. Notes/transcripts are unverified student context, not authoritative grades. AI cannot change grades, payment/access, certificates or saved notes through speech. Students save their notes explicitly.

## Architecture and operations

- Browser: lazy-loaded `@anam-ai/js-sdk`, ephemeral token only; no API key in browser bundles.
- API: `/api/lms-coach`, verified Supabase user and current paid/granted course order. Private lessons are scoped to the exact student's enrollment; unpublished material and answer keys are excluded.
- Tables: `pwd_lms_coach_notes`, `pwd_lms_coach_sessions`; service-role-only access and RLS. Atomic RPC reserves session/quota.
- Configuration: `ANAM_API_KEY`, `ANAM_PERSONA_ONBOARDING`, `ANAM_PERSONA_TECH_SUPPORT`, `ANAM_PERSONA_STRATEGY_COACH`. Reused from authorized Digiassist settings. Branding and business share the strategy avatar/voice with different per-session instructions. Shared Anam personas are never modified.
- Each session fetches avatar/voice/model metadata and mints a personalized ephemeral configuration. Respect the actual avatar model (currently cara-3); do not force a different model.
- Transcripts persist when a session ends normally. Abrupt browser/network termination may lose the current transcript; reservation expires after 15 minutes. Do not promise crash-proof conversation memory.
- Access is rechecked when context refreshes and once per minute while connected. Provider token is limited to 15 minutes; active media cannot be forcibly revoked by this app after a malicious client ignores the close instruction. New context/session requests always reauthorize.
- Existing `apiError` reporting covers provider and database failures without exposing secrets or student transcripts. No new student emails are sent by coaches.

Apply `supabase/migrations/20260925_student_video_coaches.sql` before deploying. Existing LMS/payment/community tables are unchanged. To disable video starts, remove the new Anam credentials from the PWD deployment (not Digiassist). Preserve transcript/notes tables for existing student history.

## Verification

`npm test`, `npm run lint`, `npm run build` plus `scripts/verify-student-coaches.mjs` with isolated synthetic accounts. Public desktop/mobile LMS and release smoke suites must pass before promotion. The integration script uses localhost:3105, cleans fixtures, and writes ignored screenshots under `.deployment/`. Never run it against a production API. Keep local email dispatch disabled.
