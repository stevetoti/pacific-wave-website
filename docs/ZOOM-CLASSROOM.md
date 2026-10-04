# Zoom live classroom

## 2026-10-05 — [Codex] Published classroom

Students with paid/granted course access can open a published lesson’s Zoom meeting inside the course dashboard. An isolated full-screen Meeting SDK client view keeps its React runtime separate from Next.js. Return to course removes the iframe. Open in Zoom remains available when embedding cannot connect. Instructors start meetings with their normal Zoom app. This uses Zoom Meeting SDK, not Video SDK.

Server-only settings: `ZOOM_MEETING_SDK_CLIENT_ID` and `ZOOM_MEETING_SDK_CLIENT_SECRET`. Do not use account passwords or NEXT_PUBLIC secrets. The signature endpoint fixes role to attendee, validates enrollment/publication/private-session ownership and accepts only a lesson ID. It returns a 30-minute signature; tokens never go into URLs. The iframe handshake checks origin and window source. No contact or recording API access is required for this initial same-account integration.

Apply `supabase/migrations/20261004_zoom_classroom.sql` before publishing. In lesson editing, enter the meeting URL and actual meeting passcode; the encrypted invitation pwd parameter is not a plain passcode. Passcodes are excluded from the ordinary student course response and returned only by the authorized join endpoint. A lesson can be attended live before its recording exists.

Zoom account was verified as Workplace Pro. Its 10 GB cloud recording allocation was full; no storage upgrade, deletion or purchase was performed. Record locally with the host desktop app and use the existing LMS recording uploader as needed.

### Account and meeting setup — 2026-10-05 [Codex]

Stephen approved app creation and complete setup. Created PWD Live Classroom (`Csf1JhkcQZGE-2PEyJV-Rw`) with Meeting SDK enabled and no API scopes. Production credentials are stored in ignored local environment files and sensitive Vercel production settings. The additive migration is applied.

October classroom meeting ID: 962 8326 1755. Twelve sessions: 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29 and 31 October, 3–5 PM Vanuatu time. Zoom uses its equivalent Solomon Islands UTC+11 timezone label. Passcode + waiting room retained, participants muted on entry, video off by default, automatic AI summaries/transcription and automatic recording off. No invitee emails sent. All twelve course lessons have the meeting attached; only first lesson was newly published, later lessons retain their draft state.

Host: sign into the existing PWD Zoom account, open Meetings → PWD — Build Your Online Business in 30 Days — October Training → Start. Admit enrolled learners from the waiting room. Students: Training Centre → their October course → Live class 1 → Join inside dashboard, then Zoom Join. Open in Zoom is the fallback. Local recording must be started by the host in the desktop app; cloud storage remains full.

Real SDK tests reach the pre-join screen on desktop/mobile. Accepting Zoom terms for the final QA Join requires separate browser confirmation; pending. Full audio/video transmission has not been verified. Initially promoted as `dpl_x52pz9XRGAKRLAXdyoBwC3Wd7xBR` (app commit `96aa12d`). Main source/guide commit `6fc1418` then built `dpl_C5vDgcqAYjE4YHLrdiB9wTeeGdGK`, verified READY and serving pacificwavedigital.com. Eight live public desktop/mobile release checks pass. Candidate API verified through authenticated Vercel CLI. Ordinary candidate browser tests hit Vercel protection; no protection settings were weakened and the rejected cookie approach was not used.

### Validation

TypeScript, lint and production build passed. Three focused parser/signature/authorization tests passed. Desktop/mobile classroom lifecycle tests passed with a mocked external meeting service (open, failure fallback, handshake, leave, reopen, focus return and no horizontal overflow). Six public LMS checks and two release smoke checks passed; two opt-in live fixture tests were skipped. Real SDK 6.5.0 loaded successfully in headless Chromium with init/join available. On the live domain, real approved-student API signing returned 200 and both screen sizes reached the Zoom pre-join screen after correcting the masked passcode capture. Ten combined desktop/mobile release/LMS/classroom checks passed on the final build. Final Join/audio/video test remains pending terms confirmation.

References: https://developers.zoom.us/docs/meeting-sdk/auth/ and https://developers.zoom.us/docs/meeting-sdk/get-credentials/ .


### Reusable PWD branding — 2026-10-05 [Codex]

Stephen reports successful joining. All course classrooms now show the actual PWD logo, navy/orange brand colours, course title, lesson title/number and scheduled Vanuatu time. Artwork uses the lesson thumbnail first, then existing course artwork, then a generic PWD training image. Failed image requests fall back to the generic image. No per-course code or Zoom app changes are needed.

The desktop details panel becomes a compact course banner on mobile. Focus view hides the panel without remounting/disconnecting Zoom. A native modal keeps keyboard focus inside the classroom and returns it to the join button after exit. Zoom's meeting controls, student display names and legal notices stay intact.
