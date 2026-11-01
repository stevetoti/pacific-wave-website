# October registration retired

## 2026-11-01 — [Codex] Acceptance register
Owner: October has finished; remove it from course/dashboard offers, prevent registration, and ensure links lead to November–December. Existing enrolled students retain their history and resources. Other one-on-one offers remain available.

| ID | Criterion | Result |
|---|---|---|
| C1 | October course and cohort closed; November open; other courses and existing orders/lessons unchanged | PASS: persisted before/after comparison |
| C2 | Public catalogue and student/affiliate recommendations exclude October | Source implemented; deployed pending |
| C3 | Old October programme, account and checkout links (slug/UUID) redirect to November | Unit PASS; deployed pending |
| C4 | Server signup/new order and old unpaid checkout/proof cannot register/pay for October | Signup guard PASS; deployed pending |
| C5 | Existing enrolled October student course access and resources remain available | Source unchanged; deployed pending |
| C6 | Exact build, desktop/mobile public regressions, independent review and synthetic cleanup | Pending |

Tenant: PWD Supabase rndegttgwtpkbjtvjgnc. Private evidence outside tracked source: `.deployment/october-close-20261101`. No email/message sending, real payment/provider actions or changes to existing student records. No authenticated dashboard QA: it dispatches a global legacy email queue. Only synthetic owned records are used to exercise denied payment paths.
