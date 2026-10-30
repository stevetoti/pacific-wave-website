# Expanded personal course topics

## 2026-10-30 — [Codex] Requirements and implementation

Stephen requested fuller topic descriptions, using everything taught in the October business cohort: affiliate marketing, digital marketing, Facebook, AI website building, mastering Digi Assist AI, ecommerce, Google listings and digital agency setup. The software phase must explicitly include one software project chosen and built by the student during class, plus AI agents for everyday work, video and meetings.

Read the actual October lesson metadata and `src/lib/lms/october-workbook.json`. The live lessons have generic class labels; the published workbook supplies the substantive 12-topic reference. The personal curriculum now has eight business topic cards and six technology topic cards, detailed skills, 18 lessons per phase, project steps and a connected AI workflow diagram. The bundle includes both sets. Examples clarify practical software scope, supported meeting assistants, connected video tools and third-party service costs.

All fees, teaching periods and follow-up mentorship remain as approved: VUV 150,000 / 250,000 / 350,000, six / six / twelve weeks, 18 / 18 / 36 private 90-minute lessons, three per week, with one / three / three months mentorship; the combined package's three months start after both phases.

Six approved Higgsfield illustrations were reused from the expo service set, with no new image-generation job. Website copies are `public/images/training/personal/{websites,apps,ai,marketing,payments,training}.png`. The agent diagram is native HTML/CSS and icons, with descriptive text. Illustrative images are decorative alongside meaningful topic headings.

The additive migration `20261030_personal_curriculum_detail.sql` updates course introductions and future per-order lesson seeding. It does not rewrite existing student lessons. Before/after integrity hashes match for all existing orders, all existing lessons and all unrelated courses; prices and private/public enrolment flags also match. Private rollback course copy and previous trigger definition are retained outside tracked or deployed files.

| Criterion | Evidence | Result |
|---|---|---|
| All requested business topics explained | October workbook reference; eight detailed cards and 18 lesson outlines | PASS |
| Chosen software project built during class | Project statement, staged build/test/deploy steps, six technology cards | PASS |
| Agents for admin, marketing, video and meetings | Dedicated topic cards, supported meeting assistants and workflow diagram | PASS |
| Illustrations, readable desktop/mobile layout | Six optimized image sources; semantic headings/lists; viewport checks | PASS |
| Existing fees and mentorship correct | Same shared data; SQL validation; enrolment links | PASS |
| Existing records preserved; future private outlines correct | Live integrity hashes match; two SQL/guard tests pass including both migrations | PASS |
| Engineering and complete-source deployment | TypeScript, changed-file lint, production build/eight route guards | PASS |

Anonymous staged browser tests use Chrome desktop and iPhone 13 (390px). Authenticated student and payment flows are outside this content expansion's scope and are covered by the previous programme release report. No accounts, enrolments, messages, card charges, proof submissions, real AI sessions or external meeting/video integrations were created for this update. Six fixture-dependent or opt-in mutation tests are skipped intentionally.

Initial browser run hit 30-second time limits in three broad unchanged regression cases while local execution was slow; no content assertion failed. Final checks use a 120-second test limit. Visual inspection caught and corrected low contrast inherited from the shared paragraph/eyebrow rules in the navy workflow panel.

## 2026-10-30 — [Codex] Published acceptance

Live application `d7120eff3e5263ebf1e5c99df98cba0a39168c9a`, deployment `dpl_2jdUQcz6udQHbh1grqL4SGk2sHi3`, https://pacificwavedigital.com. Deployment Git metadata and exact domain alias match. Previous application rollback: `dpl_4TQEuep8x1B8tVLo8PiZxmWeJYnL`; course text/trigger migration is separate from application rollback.

Final staged and live read-only suites each passed 10 desktop/mobile checks; six fixture-dependent or opt-in mutation tests intentionally skipped. All three public programmes show complete topics, correct facts/prices and enrolment summaries. All 8/6/14 topic illustrations load; all 18/18/36 lesson descriptions expand; no page errors or horizontal overflow. Captured and visually inspected desktop/mobile topic cards and the workflow panel; final computed text colours confirm readable navy-panel copy. Two SQL tests exercise both migrations, idempotency, private per-order 18/18/36 outlines and shared-private-lesson denial. TypeScript, changed-file lint, production build and all eight required route guards pass.

No synthetic users or orders were needed or created for this copy/design update. No messages, charges, payment proofs or external AI/video/meeting actions were submitted. Actual supported integrations are teaching topics; no integration service was provisioned by this website update. Live integrity receipts confirm existing orders, lessons and unrelated courses were preserved. All requirements in this update's matrix are PASS.
