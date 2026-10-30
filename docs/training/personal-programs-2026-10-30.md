# One-on-one programme options — acceptance register

## 2026-10-30 — [Codex] Owner requirements and clarification
Use BuildProfitAI's curriculum structure, with local owner-set prices: Business Creation & Digital Foundations VUV150,000; AI, Coding & Software Development VUV250,000; both VUV350,000. Each phase is about1½ months/six weeks,18private90-minute lessons,3perweek,27teaching hours. Foundations includes1additional month of follow-up mentorship; technology3months. Owner explicitly answered: the combined package gets3months mentorship AFTER BOTH phases, not four additive months. Bundle structured tuition is12weeks/36lessons/54hours. Follow-up mentorship is human project guidance/review/troubleshooting, about weekly or assistance as needed with times arranged together; it is separate from three formal lessons a week.

Reference read: BuildProfitAI/website/src/lib/lms/programs.ts and public www.buildprofitai.com/training-center. Owner overrides old source mentorship and USD fees. Curriculum retains business validation/model/pricing/legal/banking/brand, websites/SEO, social/email/content/analytics, affiliate marketing, ads/AIvideo and campaign capstone; technology retains prompting/chatbots/CRM/automation/APIs/appbuilders/software pricing and institutional workshops/proposals, plus explicit owner-added WordPress/coding/testing/deployment. Software and bundle retain the existing three-month Digi Assist AI Pro bonus; none is newly promised for foundations. External tools/domains/hosting/ads are separate.

Read-only live check found no orders or lessons for either legacy personal offer. Reuse their IDs/slugs, add full-ai-business-program. Migration guards against legacy enrolments appearing before first replacement. Existing cohort/BLP courses and student records are untouched. New orders seed own-assigned18/18/36lesson outlines; no shared lessons or published recordings. Other private courses retain their existing generic fallback. Money stays in VUV base units; no real payments requested.

| ID | Observable criterion | Status |
|---|---|---|
| A1 | Three discoverable private offers and clear programme choices | PASS |
| A2 | Catalogue, details, registration and checkout prices150k/250k/350k | PASS |
| A3 | Six-week18x90min27h per phase, bundle12weeks36x90min54h | PASS |
| A4 | Follow-up1month/3months/bundle3afterboth | PASS |
| A5 | Scheduled lessons distinguished from arranged human mentorship | PASS |
| A6 | BuildProfitAI curriculum plus requested coding/WordPress | PASS |
| A7 | Pending enrolment amount persisted and shown after reload | PASS |
| A8 |18/18/36 own-order lessons; pending/other-student privacy and private community | PASS |
| A9 | Desktop/mobile layout, links, metadata, no floating overlap | PASS |
| A10 | Type/lint/build, private trigger, source/deployment identity, cleanup | PASS |

Context: PWD Supabase rndegttgwtpkbjtvjgnc; branch codex/november-december-cohort in .deployment/quote-release-20261023. Test with anonymous public visitor and temporary verified/enrolled/pending students only. Browser dashboard must be intercepted with synthetic own-order data because its legacy endpoint dispatches the global email queue. Real course, checkout data, tutor and community reads remain real. No email, charge, provider call or chat-message submission. Independent tester /root/personal_program_acceptance follows requirements and reference, not implementation notes.

## 2026-10-30 — [Codex] Published acceptance evidence

Application 5ecd3f68272bea97bb9474582b60820f7eea3919, deployment dpl_4TQEuep8x1B8tVLo8PiZxmWeJYnL, https://pacificwavedigital.com. Exact deployment Git metadata and live alias match. Source and test handoff commits are later than the application build; application files unchanged. Rollback application dpl_BqwyuKeStZBbh3FnALJ795z5vH8N. Course-data update and trigger migration are separate from application rollback; preserve any real enrolments before reverting.

Eight focused tests, TypeScript, changed-file ESLint and remote production build/eight route guards pass. Final staged and live Chrome desktop and iPhone13/390px suites each 14 passed,2 pre-existing opt-in mutation tests skipped. Independent cold reviewer checked the BuildProfitAI reference, original request/clarification, public actual-browser desktop/mobile journey, private guard and deployed API assertions. Private checks used three temporary confirmed synthetic users (enrolled learner, enrolled peer, pending student), nine real isolated order rows in the correct PWD project, and actual registration/course/coach/community APIs. Prices survived checkout reload;18/18/36 lessons survived leave/reopen/hard reload. Unpublished recordings correctly retain the existing awaiting-video state. Anonymous API401; pending lesson content/meetings/recordings hidden; peer lesson IDs/content isolated; own private chat only, cross-peer403 and pending403.

Legacy dashboard browser reads were replaced with ONLY each synthetic user's own persisted orders because that endpoint dispatches the global email queue. Other course/registration/checkout data and private API reads were real. The test did not submit signup, payment proof, charge a card, start a real AI session, send chat or dispatch messages. This release does not claim an external paid transaction was exercised. All 45 pre-existing order prices, currencies and course associations remain unchanged; every unrelated course row matches the before snapshot. All three synthetic accounts, nine orders, assigned lesson outlines and associated fixtures removed; zero remaining users/orders/lessons confirmed. Private before/after/API/cleanup receipts are retained outside tracked/deployed files.
