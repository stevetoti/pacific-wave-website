# October digital workbook

2026-10-03 — [Codex]

Course: vanuatu-october-2026. Component appears to paid/granted participants above the lesson area. Open workbook reveals all 12 dated lessons and 96 response fields with per-lesson self-checks. Answers remain hidden from other students. Assigned course instructors and administrators have read-only review access through Workbooks. AI faculty receives only the authenticated student’s saved workbook excerpts at each new session, with labels, dates and explicit truncation markers.

Data: pwd_lms_workbook_answers; server-only access, no direct authenticated/anonymous privileges. Additive 20261003_digital_workbook.sql is applied. Revision comparisons reject stale writes, including competing first saves. UI preserves failed/conflicting drafts and provides a local notes download before reload.

Exports: blank 69-page workbook PDF; same workbook followed by a dated private answer appendix using embedded Noto Sans for accented text. Both exports require active course access and use private/no-store responses. Student downloads do not edit their saved answers.

Editable DOCX, content builder, source images and full render QA are in Training Hub/Vanuatu October 2026/workbook-v1. Website source: src/lib/lms/october-workbook.json. Rebuild both from the shared content source when editing lessons; preserve field IDs to retain answers. No generated screenshots or invented interface steps. External affiliate network eligibility remains to be selected/verified.

Verification: lint, TypeScript and production build pass; three workbook tests cover schema, SQL privileges/concurrency/revocation and long Unicode PDF export. Eight public desktop/mobile release tests pass (two existing opt-in integration tests skipped). scripts/verify-workbook.mjs passed with temporary real accounts: authentication/enrollment, private saves/read, stale writes, forged identity, direct-table denial, desktop/mobile save/reload, simulated failed-save recovery, actual PDF downloads and revoked read/write/export denial. All temporary accounts/orders/answers/email guard removed. No test emails sent.

Release status: staged deployment pending at time of this entry.

## 2026-10-03 — [Codex] Workbook release awaiting production approval

Application commit 6552eef; Vercel staged deployment dpl_HHAz8UH8RKoH2h2ZwAXz9jU53UHW at https://pacific-wave-website-erogead2w-pacificwaveprojects.vercel.app is READY. Real local multi-user desktop/mobile tests pass, as do three focused tests, lint/build and eight public release checks. Staged browser checks hit Vercel Login rather than the app; this is not an application test pass. Automatic approval review rejected `vercel promote` because user authorised building but not explicit production promotion, and staged browser checks were protected. Do not promote or push to main (auto-deploy) as a workaround. Ask Stephen for explicit permission to publish; after permission promote and run live checks. No production promotion occurred and commit is not pushed. Additive private-workbook migration IS applied; no learner responses were changed. Temporary QA accounts/orders/answers and email guard were removed.

## 2026-10-03 — [Codex] October workbook published and verified

Stephen explicitly authorised publishing. Promoted application 6552eef as dpl_HHAz8UH8RKoH2h2ZwAXz9jU53UHW; live domain confirmed READY. Eight public desktop/mobile release checks pass. Real live temporary-account verification passes for private saves/reloads, conflicts, identity/RLS denial, failure recovery, PDF downloads and revoked read/write/export access. All temporary QA accounts, orders, answers and email guard removed; no test emails sent. Course URL: https://pacificwavedigital.com/training-center/course/21cb833b-6e9b-4ec2-9aca-a7629dffda8a.

The earlier production-promotion approval blocker is resolved. A separate automatic approval review rejected pushing HEAD to main because this branch mutation can trigger another deployment and was not explicitly authorised. Source commits remain local. Do not push main indirectly; request explicit source-push approval.

## 2026-10-03 — [Codex] Source push authorised

Stephen explicitly authorised pushing the saved workbook source to main. Remote history was checked: main is an ancestor, with no divergent remote changes. Prior source-push approval blocker is resolved. Publishing the already-verified application source and release notes; no new application changes.

## 2026-10-03 — [Codex] Workbook cover and learning support verified

Actual cover card with purpose/use description added. Workbooks tab provides assigned instructors/admins read-only active-student answers. AI faculty uses authenticated student/course-scoped labelled excerpts (400 characters per activity, truncation flagged), refreshed each new session. Student notices explain sharing. No database migration. Type/lint/build and four workbook tests pass; eight public desktop/mobile checks pass (two opt-in skips). Real temporary-account tests verify instructor assignment/revocation, student switching, own-student AI context, denied outsiders/revoked enrolments, saves/failure recovery/PDF downloads. All fixtures cleaned; no test emails. Publishing under existing authorisation.
