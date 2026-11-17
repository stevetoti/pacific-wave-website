# Zoom cloud class recordings — 17 November 2026

[Codex] Owner requested Zoom links without downloading, retaining YouTube for other recordings. Owner explicitly confirmed the supplied October-labelled31October recording belongs on November–December Day One. Do not change its Zoom title/date or other lessons.

Acceptance matrix:

| ID | Criterion | Status |
|---|---|---|
| Z1 | Save/reopen/publish Zoom recording plus passcode in lesson recordings editor | PASS |
| Z2 | Paid/granted students see Watch recording in a new Zoom tab | PASS |
| Z3 | Unpaid/draft/unpublished responses contain no recording URL/passcode | PASS |
| Z4 | YouTube links and uploaded/private recordings still work | PASS |
| Z5 | Day One contains exactly the owner-supplied URL/passcode; other lesson fields preserved | PASS |
| Z6 | Student labels switch to Bislama/French; mobile layout fits | PASS |

Recordings use separate zoom_recording_url/passcode fields, never live meeting_url/zoom_passcode. External shared recording links can be forwarded; dashboard gating does not turn Zoom sharing into per-student DRM. Private one-to-one programmes retain private storage only. No recording downloads, YouTube uploads, emails or live-meeting changes.

## Published release and evidence — [Codex] 17 November 2026

- App `fbfcc8a1178936f6fc6530accb9b9187fc7b1733`, pushed branch `codex/zoom-cloud-recordings-20261117`, Vercel `dpl_BgprrpkoVvxFFdZRHT7GrBxFoURA`, https://pacificwavedigital.com/training-center. Complete source remains `.deployment/bislama-release-20261116`. Current alias readback matches.
- Additive migration applied to expected database; anon/authenticated direct lesson SELECT is denied and RLS stays enabled. Existing lessons/recordings were not rewritten by migration.
- Fifteen focused locale, recording validation/publication/permission and PGlite migration/regression tests pass. TypeScript, changed-file lint, cloud production build and eight route guards pass. Final protected unauthenticated course request401, public training page200 on first candidate.
- Real owner admin Chrome: save Day One draft, switch to lesson2 (blank recording fields), return to Day One (saved fields restored), hard reload/reopen, publish. Exact persisted passcode checked through trusted DB read, never logged.
- Owner expressly authorised one temporary test student/enrolment, no emails, paid/unpaid tests and cleanup. Admin-managed `app_metadata.lms_qa_no_email` ensures this identity never dispatches the shared legacy email queue. Real-user dispatch is unchanged. Fixture has no admin/instructor permissions.
- Actual live APIs under granted and paid test enrolment return exact Zoom URL/passcode; pending returns both empty; draft returns both empty even when approved. Anonymous401, student edit403. No fixture email rows queued.
- Actual live student browser: dashboard → course → Day One → Watch recording. Pending status plus reload shows Unlock your learning and zero watch links. Paid status restores card; Bislama and French labels work, passcode/URL retained;390×844 card297px/page375px fits390px. Viewport reset. Clicking opens correct Zoom recording player.
- Zoom itself was already signed into the host account in available browsers; anonymous Zoom passcode-entry flow was not independently exercised. No Zoom sharing settings changed. No download, playback capture, transcript generation, third-party upload or email send.
- YouTube editor remains alongside Zoom, parser/additive migration regressions pass; existing YouTube and upload fields retained. New cloud links remain prohibited for private one-to-one lessons. No new private video was uploaded in this acceptance run.
- Persisted before/after comparison: all14other November lessons identical (new columns blank). Day One changes only zoom_recording_url, zoom_recording_passcode, recordings_published. All live meeting fields, schedule, notes, quizzes and YouTube IDs match.
- Temporary user/profile/order/emails removed and zero remnants verified. Existing Jeane Claude grant is real data and was not touched.

Evidence is in workspace `output/zoom-recordings-20261117/`: `api-granted-draft.json`, approved/paid/pending API receipts, `migration.json`, `preservation.json`, `cleanup.json`, `student-replay.png`; private backup/fixture files are outside tracked source.

## Operation

Admin → Training centre → Lessons → course → lesson → Class recordings. Paste Zoom recording share/play URL and recording passcode, then Publish recordings. Use YouTube links or existing MP4/WebM upload for other recordings. Draft/unpublish hides recordings while leaving live joining intact. Zoom opens in a separate tab; its existing sharing rules apply, and links/passcodes can be forwarded.

## Rollback

Pre-feature app was5d933fc/dpl_DMRAMVahW1j1zwnkg9RWK164SSxs. Its course projection spreads unknown database columns, so do NOT roll back to that build while nonempty Zoom recording fields exist: back up/clear those fields first or retain the new explicit redaction. Additive columns can remain. New-feature candidate dpl_HeLCuUm3hN4TGJnDRa3XDmzkpGEn contains the same access gating but predates the lesson-editor key fix; final deployment above is preferred.
