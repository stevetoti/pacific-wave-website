# Individual student paid-status selection

## 2026-11-04 — [Codex] Acceptance register
Owner reports checking one pending student still proposes marking all students paid. Original defect: BulkMarkPaid received no roster selection and GET preview enumerated every pending order in a course. Existing POST/RPC uses explicit IDs correctly; no database migration required.

| ID | Criterion | Result |
|---|---|---|
| P1 | No action without a selected pending student; paid/rejected rows do not enter a pending batch | PASS: desktop/mobile local + live selection journeys |
| P2 | Selecting one student confirms their name and updates only their order; another pending student remains unchanged | PASS: five SQL tests plus actual live one-student save; other pending order unchanged |
| P3 | Explicit multiple selection works; course changes reset selection; search cannot add unchecked students | PASS: desktop/mobile local + live selection journeys |
| P4 | Confirmation cancel, errors, permission and course boundaries are safe; no fallback to all-course preview | PASS: real role/API guards, cancel/error handling and independent live check |
| P5 | Saved result survives leave/reopen/reload; audits accurate; no messages/charges and synthetic cleanup | PASS: actual admin desktop/mobile leave/reopen/reload; persisted one audit/no emails, zero fixture remnants |
| P6 | Exact released build, current source lineage, mobile/desktop and independent cold review | PASS: exact84e58d5 build, live alias, local/cloud build and independent live cold review |

Context: Pacific Wave Digital tenant rndegttgwtpkbjtvjgnc; administrator roster. Existing real student payment records must remain unchanged. UI intercepted tests use only synthetic records; deployed mutable verification uses temporary admin/student/instructor, unpublished private QA courses and no-fee QA orders. Queue suppression and cleanup are scoped to those fixtures. No email, WhatsApp, SMS, real charge, enrolment or commission action is authorised by this task.

## 2026-11-04 — [Codex] Released evidence
Application84e58d55ee60d16711279ececd422d5cf5184669, exact READY deploymentdpl_GxheFtqABnwq6ZJz2seC2wqRSQLT promoted; apex alias confirmed. Prior live rollbackdpl_BYoaKYQS94JQquzwTpfRu2owStbC. Complete source `.deployment/quote-release-20261023` on pushed`codex/november-december-cohort`, includes latest live October closure and main SEOpublication lineage. Clean tracked-only clone used for upload; private env and QA evidence excluded. No database migration or RPC change needed.

Fix: roster supplies selected pending order IDs, action disabled without eligible selection, GET preview requires explicit UUIDs and filters by those IDs/course/pending status, confirmation lists actual names/email and only confirmed IDs reach POST. Client rejects unrequested/duplicate IDs or mismatched name rows. Selection clears after save and on course change. Search retains existing checked rows intentionally; the displayed count and confirmation names still reflect the exact selection and never add unchecked rows. Select all shown remains explicit; paid/rejected rows never join the pending-payment batch.

Engineering: TypeScript, changed-file ESLint, five actual SQL persistence/authorization/rollback/side-effect tests pass. Local and remote production build/eight route guards pass. Initial local build required standard ignored `.env.production.local` and font network access; final build passed. Persistent-memory CLI unavailable due missing numpy; shared Markdown journals updated. Before-fix browser regression failed against old live UI; fixed local/live browser journeys each pass desktop/mobile. Protected stage was checked privately through authenticated Vercel curl (unsigned application API401), without creating a public share link.

Actual live administrator workflow verified using scripts/verify-bulk-paid.mjs: temporary admin/student/assigned instructor, two unpublished private no-fee courses and three pending QA orders. One checked main-course student confirmed by name and saved paid. Other pending student in same course and other-course order stayed pending; amount/method retained, exactly one audit, zero queued emails, idempotent retry updatedzero. Actual desktop/mobile leave/reopen/hardreload shows one paid registration. Anonymous401, student/instructor403, missing selection400 and forged cross-course409 verified. Independent live cold tests pass2/2 desktop/mobile with synthetic intercepted data plus anonymous401. No messages, provider calls or real student record/status changes.

All temporary auth/admin/course/instructor/channel/order/audit/queue rows removed by exact generated IDs. Zero auth users/admins/orders/emails/courses verified after cleanup. Actual receipts/screenshots: `.deployment/paid-selection-20261104/deployed-acceptance.json`, desktop-confirmation.png, desktop-persisted.png and mobile-persisted.png (confirmation visually inspected). Intercepted browser outputs `/tmp/paid-selection-local` and `/tmp/paid-selection-live`; SQL receipt `/tmp/paid-selection-unit.log`. No remaining required checks.
