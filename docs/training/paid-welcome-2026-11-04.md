# Welcome email after selected paid status

## 2026-11-04 — [Codex] Acceptance register
Owner requests welcome/dashboard/pre-class guidance when marking students paid, superseding the previous no-email behaviour. Owner separately confirmed the identity of the November student just marked paid for one targeted catch-up. No general historical backfill is authorised.

| ID | Criterion | Result |
|---|---|---|
| W1 | Exactly one welcome queued atomically per selected newly paid enrolment; unselected students unchanged | SQL tests PASS; deployed pending |
| W2 | Accurate sign-in/dashboard, timetable, tutors, conditional workbook/community and preparation guidance; no false recording availability | Template tests PASS; visual pending |
| W3 | Isolated queue, role/cron protections, retry backoff/exhaustion and stable provider key; no old notification blast | Tests PASS; deployed pending |
| W4 | Actual admin save/leave/reload produces selected welcome; reserved QA addresses never reach provider; fixture cleanup | Pending |
| W5 | One owner-confirmed previous paid enrolment receives welcome; no duplicate on repeat | Pending authorised targeted delivery |
| W6 | Exact release identity, desktop/mobile, independent cold review and complete handoff | Pending |

Tenant: PWD rndegttgwtpkbjtvjgnc. Sender/recipient secrets and student identity stay in untracked private evidence. Schema migration must leave existing orders/courses/legacy email jobs unchanged and enqueue zero historical welcomes. Only the explicitly confirmed existing enrolment may be queued manually; future selected paid actions queue automatically. Current paid-selection safeguards remain intact.
