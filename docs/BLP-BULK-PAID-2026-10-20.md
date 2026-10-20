# BLP bulk payment status

Stephen requested all pending BLP students marked paid and a reusable bulk button for the selected course. He explicitly selected a manual bulk button rather than automatic approval of new registrations.

## Current BLP records

On 20 October 2026 the owner-authorised maintenance operation changed exactly 15 pending registrations in BLP course `2baed8ea-ddcc-49af-80fa-13fa8c23e546` to `paid`. Their amounts remain zero and method remains `grant`. The two existing `granted` registrations and all other existing registrations were compared before/after and remained unchanged. Each change records the owner as reviewer, a reason and a `bulk_mark_paid` audit row. No status emails were queued. Future registrations still wait for approval.

## Admin workflow

Admin → Training centre → Students → choose a course → Mark pending students as paid. The server loads an authoritative preview independently of the 500-row roster limit and search filters. The admin checks course/count and recorded amount, enters a reason, then confirms. The result shows updated/skipped counts and refreshes the roster.

Each batch covers up to 1,000 IDs captured in the preview. Additional pending registrations require another batch. Registrations created after the preview stay unchanged. Paid, granted, review, rejected, refunded and revoked rows are skipped. An active Stripe session or checkout lock is also skipped to avoid falsely reconciling a still-payable checkout. Amounts, payment methods, provider references and balances are preserved. This function changes enrolment status/access; it does not charge a card, issue a receipt or send email.

## Implementation

- Admin-only `/api/lms-bulk-paid` GET/POST using the existing website/site-role authorization.
- Service-role-only `pwd_lms_bulk_mark_paid` RPC validates the acting admin and all IDs against one course, then updates and audits atomically.
- Status predicates make repeat/concurrent operations idempotent. Cross-course or missing IDs refuse the whole batch.
- A transaction-local flag suppresses only this operation's existing status-email trigger and is restored afterward. Other notification paths remain unchanged.
- Existing manual access revocation accepts both `granted` and `paid` method-`grant` registrations. It still excludes bank/card purchases.
- Migration `20261020_bulk_mark_paid.sql` is already applied to website database `rndegttgwtpkbjtvjgnc`.

## Acceptance matrix

| Criterion | Result | Evidence |
| --- | --- | --- |
| Fifteen current BLP pending registrations paid, zero fees preserved | PASS | Owner operation and per-order persisted audit |
| Existing approved/other-course records untouched | PASS | Owner operation before/after assertions |
| No status email queued for bulk update | PASS | Owner operation and SQL trigger tests |
| Pending snapshot, duplicate retries, cross-course guard and audit rollback | PASS | Four PGlite behavioral tests |
| BLP recording/progress privacy unchanged | PASS | Two existing BLP behavioral tests |
| Desktop/mobile preview, cancel, confirmation, reload and visible preview failure | PASS | New browser suite |
| Course-first roster isolation and public release routes | PASS | Existing desktop/mobile roster/release suites |
| Real admin/student/instructor permission and persisted API/UI flow | PASS | Actual local API/desktop/mobile journey; synthetic fixture cleanup verified |
| Actual staged feature, permissions, persistence and desktop/mobile regressions | PASS | dpl_HabQfC6SDH1yzQSNqM6DahRXa4h3, actual account test and six browser checks |
| Final live-domain verification | PASS | Actual live temporary-admin save/reopen/hard reload, student/instructor denial, desktop/mobile and six browser regressions |

Engineering checks: changed-file lint, TypeScript and complete production build/eight route guards pass. Initial local build was blocked by sandbox DNS for font downloads, then passed with authorised network access. An initial browser test had an ambiguous alert selector; the corrected test passes without an application change. Temporary-course cleanup was extended to delete its automatically created community channels before deleting the course; initial synthetic fixtures were removed. No customer rows were used for test mutations.

Source: complete live lineage `98d8844`, isolated checkout `/Users/stephentotimeh/Projects/Training Hub/.work/pwd-blp-payments`, branch `codex/blp-paid-enrolments`. Preserve this complete lineage when integrating into the main website repository. Private acceptance artifacts live under ignored `.deployment/blp-bulk-evidence/` and must never be uploaded or committed.

The initial maintenance script's temporary receipt files were cleared by the browser runner's output cleanup after its assertions passed. The executed command output and persisted audit remain the evidence of that operation. Maintenance evidence paths now use `.deployment/blp-bulk-evidence/` to avoid future collisions.


Staged production build: app `9fbf5d7`, deployment `dpl_HabQfC6SDH1yzQSNqM6DahRXa4h3`, https://pacific-wave-website-4y51bqk5l-pacificwaveprojects.vercel.app. Remote full build and eight route guards pass. Live domain has not yet been changed. Source backed up on `codex/blp-paid-enrolments`; original GitHub account restored. Staged acceptance is underway.


All five real-account acceptance criteria pass on staging, including anonymous/student/instructor denial, admin preview/write, cross-course rejection, desktop/mobile leave/reopen/hard reload, audit/zero-fee preservation and no email jobs. Synthetic users/courses/orders/audits cleaned. All six staged browser regressions also pass. Publishing the exact tested deployment; no application edits after staging.


## Final live release

Application `9fbf5d7` / `dpl_HabQfC6SDH1yzQSNqM6DahRXa4h3` is live on pacificwavedigital.com. Live alias inspection confirms the exact staged build. All five actual-account acceptance criteria and six desktop/mobile browser regressions pass on the live domain; synthetic fixtures cleaned. The mutation is separately audited; application rollback does not undo owner-approved payment statuses. No production settings, payment provider configuration, course prices or enrolment approval defaults changed.
