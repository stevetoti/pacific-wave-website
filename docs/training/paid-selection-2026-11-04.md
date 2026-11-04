# Individual student paid-status selection

## 2026-11-04 — [Codex] Acceptance register
Owner reports checking one pending student still proposes marking all students paid. Original defect: BulkMarkPaid received no roster selection and GET preview enumerated every pending order in a course. Existing POST/RPC uses explicit IDs correctly; no database migration required.

| ID | Criterion | Result |
|---|---|---|
| P1 | No action without a selected pending student; paid/rejected rows do not enter a pending batch | Pending browser |
| P2 | Selecting one student confirms their name and updates only their order; another pending student remains unchanged | SQL PASS; deployed pending |
| P3 | Explicit multiple selection works; course changes reset selection; search cannot add unchecked students | Pending browser |
| P4 | Confirmation cancel, errors, permission and course boundaries are safe; no fallback to all-course preview | Pending |
| P5 | Saved result survives leave/reopen/reload; audits accurate; no messages/charges and synthetic cleanup | Pending |
| P6 | Exact released build, current source lineage, mobile/desktop and independent cold review | Pending |

Context: Pacific Wave Digital tenant rndegttgwtpkbjtvjgnc; administrator roster. Existing real student payment records must remain unchanged. UI intercepted tests use only synthetic records; deployed mutable verification uses temporary admin/student/instructor, unpublished private QA courses and no-fee QA orders. Queue suppression and cleanup are scoped to those fixtures. No email, WhatsApp, SMS, real charge, enrolment or commission action is authorised by this task.
