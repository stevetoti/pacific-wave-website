# October digital workbook

2026-10-03 — [Codex]

Course: vanuatu-october-2026. Component appears to paid/granted participants above the lesson area. Open workbook reveals all 12 dated lessons and 96 response fields with per-lesson self-checks. Answers are private to the account; no instructor/group/AI access is granted.

Data: pwd_lms_workbook_answers; server-only access, no direct authenticated/anonymous privileges. Additive 20261003_digital_workbook.sql is applied. Revision comparisons reject stale writes, including competing first saves. UI preserves failed/conflicting drafts and provides a local notes download before reload.

Exports: blank 69-page workbook PDF; same workbook followed by a dated private answer appendix using embedded Noto Sans for accented text. Both exports require active course access and use private/no-store responses. Student downloads do not edit their saved answers.

Editable DOCX, content builder, source images and full render QA are in Training Hub/Vanuatu October 2026/workbook-v1. Website source: src/lib/lms/october-workbook.json. Rebuild both from the shared content source when editing lessons; preserve field IDs to retain answers. No generated screenshots or invented interface steps. External affiliate network eligibility remains to be selected/verified.

Verification: lint, TypeScript and production build pass; three workbook tests cover schema, SQL privileges/concurrency/revocation and long Unicode PDF export. Eight public desktop/mobile release tests pass (two existing opt-in integration tests skipped). scripts/verify-workbook.mjs passed with temporary real accounts: authentication/enrollment, private saves/read, stale writes, forged identity, direct-table denial, desktop/mobile save/reload, simulated failed-save recovery, actual PDF downloads and revoked read/write/export denial. All temporary accounts/orders/answers/email guard removed. No test emails sent.

Release status: staged deployment pending at time of this entry.
