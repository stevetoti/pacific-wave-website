# October registration retired

## 2026-11-01 — [Codex] Acceptance register
Owner: October has finished; remove it from course/dashboard offers, prevent registration, and ensure links lead to November–December. Existing enrolled students retain their history and resources. Other one-on-one offers remain available.

| ID | Criterion | Result |
|---|---|---|
| C1 | October course and cohort closed; November open; other courses and existing orders/lessons unchanged | PASS: persisted before/after comparison |
| C2 | Public catalogue and student/affiliate recommendations exclude October | PASS: live catalogue four offers; November first/open; recommendation filters use closed flag |
| C3 | Old October programme, account and checkout links (slug/UUID) redirect to November | PASS: unit and independent live slug/UUID redirects |
| C4 | Server signup/new order and old unpaid checkout/proof cannot register/pay for October | PASS: server signup guard and actual synthetic live order/card/proof409 before writes/providers |
| C5 | Existing enrolled October student course access and resources remain available | PASS: synthetic granted October course/profile200 with12lessons; real student data unchanged |
| C6 | Exact build, desktop/mobile public regressions, independent review and synthetic cleanup | PASS:12 live browser checks, independent cold review, exact build, zero fixture remnants |

Tenant: PWD Supabase rndegttgwtpkbjtvjgnc. Private evidence outside tracked source: `.deployment/october-close-20261101`. No email/message sending, real payment/provider actions or changes to existing student records. No authenticated dashboard QA: it dispatches a global legacy email queue. Only synthetic owned records are used to exercise denied payment paths.

## 2026-11-01 — [Codex] Live evidence
Application1b40e2c4dd79cc2dac9f6a1c7b100666bb323ada, deploymentdpl_BYoaKYQS94JQquzwTpfRu2owStbC READY; exact production alias confirmed. Merged intervening live maine38d098 (SEO image/publication changes) before building. Ten focused tests and typecheck pass; changed-file lint pass; remote production build/eight route guards pass. Final protected staging verified privately through authenticated Vercel curl: old signup307 to November, public catalogue200/four offers/no October. No public staging share link created.

Database migration closes only October course.enrollment_open and cohort.config.registrationState. Exact before/after comparison confirms existing orders, lessons, other courses/cohort fields unchanged; November remains open. Direct server signup rejects October slug and UUID before account creation. Actual live synthetic student: new October order409, card checkout409, bank-proof409, pending order unchanged; granted October course endpoint200 with12lessons and student-profile course retained. Synthetic user/order/emailqueue removed; zero remnants confirmed. Email trigger rows removed atomically in the fixture transaction before becoming visible; no dashboard endpoint used and no messages or payment providers invoked.

Independent cold live review: four public offers (November plus three personal programmes), old slug/UUID signup/checkout redirects, old programme redirect, human invalid-affiliate307 to current landing and crawler200November preview/no cookies; anonymous dashboard401. Public evidence: workspace output/expo-assets/october-registration-closed-live.jpg. Private API/database receipts in `.deployment/october-close-20261101`.

Rollback application: dpl_GdnC47jtU55Pb7C6ssBDcJGAF7N1/e38d098; explicit October database closure is separate and should remain closed. Complete working source `.deployment/quote-release-20261023` branch`codex/november-december-cohort`; deploy only a tracked clean clone. Reset/update/verification account flows and enrolled course/dashboard paths intentionally stay intact; only public enrolment destinations move to November.

Final live browser result:12 passed across desktop/mobile;6 opt-in/fixture-dependent tests skipped. Includes removal after reload, both slug/UUID redirects, November form entry, public one-on-one programmes, service/navigation regression and anonymous access boundaries. No test failures. Results `/tmp/october-closed-live-browser-results`.
