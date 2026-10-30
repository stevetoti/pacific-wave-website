# November–December 2026 cohort

## 2026-10-30 — [Codex] Scope and implementation

Stephen requested a new occurrence of the October class, 16 November–19 December 2026, preserving lessons and adding final revisions for additional teaching dates.

- New course: `vanuatu-november-2026` / `7705b174-2b6e-4c96-8241-6fb28971d19d`.
- New cohort: `vanuatu-2026-11`.
- Mon/Thu/Sat, 3–5 pm Pacific/Efate; 15 sessions, 30 hours, VUV 35,000.
- First 12 sessions preserve the core curriculum; final revisions 14, 17 and 19 December cover foundations/visibility, customer-journey testing and project showcase/next steps.
- Same venue, recurring classroom, instructors, three-month software bonus and additional mentorship month. New recordings start empty/unpublished. October recordings, orders, progress and workbook answers are not copied.
- Own editable workbook, separate field keys, re-dated printable resource and correct download name. Original October and BLP workbooks remain unchanged.
- Public catalogue and /vanuatu-training promote the new cohort. Legacy October interest administration still retains its original default cohort; new registration uses the course-specific LMS signup and checkout.
- Course title omits the old “in 30 Days” promise because this run spans five weeks.

## Acceptance matrix

Environment: PWD database `rndegttgwtpkbjtvjgnc`; complete source begins at ecf98d2 (includes production e7a0740). Public catalogue/account and enrolled student paths require desktop and 390px mobile checks. Synthetic records only; no payments, provider coaching calls or messages.

| ID | Requirement | Verified result |
|---|---|---|
| C1 | Separate new course/cohort, same fee and instructors | PASS: published course, fee and instructor readback |
| C2 | 15 Mon/Thu/Sat sessions, Nov 16–Dec 19, final 3 revisions | PASS: config, database and focused tests |
| C3 | October course/lessons preserved byte-for-byte | PASS: live snapshot comparison |
| C4 | Same core workbook; new dates and revision activities | PASS: focused tests; independent review corrected inherited dates and October cover |
| C5 | Public catalogue, landing page and registration show new cohort | PASS: staged and live desktop/mobile catalogue, landing and signup links |
| C6 | Paid student workbook save/leave/reopen/reload and exports | PASS: staged and live desktop/mobile autosave, leave/reopen/reload; blank/completed PDF API checks |
| C7 | Cross-course/unpaid/anonymous privacy; tutor schedule | PASS: staged/live anonymous, unpaid, outside-course denial; saved answers and 15 dates in tutor context |
| C8 | Production build and required route regressions | PASS: local/remote build and eight route guards; live 12 browser checks passed, 2 payment/signup mutation tests intentionally skipped |
| C9 | Source commit pushed and mapped to deployment | PASS: Git CLI pushed codex/november-december-cohort; application f0d8dbc (final checkout fix) |

The private before/plan/SQL/verification receipts live outside this checkout in `.deployment/november-cohort-20261030` under the parent website workspace. Never commit their meeting credentials, user IDs or environment secrets. Create script refuses duplicate new slugs and inserts the course as unpublished first. Publication completed after staged verification. Final checkout correction and cleanup receipts are recorded below.

## 2026-10-30 — [Codex] Acceptance findings and release notes

Independent review caught inherited October checkout labels; checkout now derives dates, class count and hours from its selected cohort. A pending-student desktop/mobile regression covers both November and October summaries. No paid status, real registration submission, real provider call or payment was created by browser testing. The student dashboard API is intercepted in browser QA because its legacy implementation dispatches the global email queue; workbook/course/export/tutor APIs and private-access checks use the real backend. All three temporary synthetic users, two isolated orders, answers and related audit/email rows were removed; zero remaining fixture users/orders/answers verified.

Deploy only from a clean Git checkout containing tracked source and the existing Vercel project link. CLI archive packaging can include ignored local QA files from a working directory; clean production source was independently checked to contain none. The new course was inserted separately; original October course/lesson snapshot comparisons pass.

## Final release acceptance

- Live application: `f0d8dbcd4e8fac20cd575a40c1babe28a3649eb0`, pushed to `codex/november-december-cohort`. Documentation handoff commits may follow without changing the deployed application.
- Production deployment: `dpl_q3uN1Vxw89B6kQdTvk5zwMKf4DrQ`; clean Git build URL `https://pacific-wave-website-18wyucmyn-pacificwaveprojects.vercel.app`; live domain alias independently confirms this deployment. Remote build extracted 657 tracked-source files and passed all eight release guards.
- Final correction: staged and live desktop/mobile pending checkout checks pass for November 15 classes / 30 hours and October 12 classes / 24 hours. Independent owner-session live readback also passes.
- Final live new-cohort browser suite: six passed, including public signup destination, dated marketing, saved revision leave/reopen/reload and checkout. Prior live unchanged service/LMS route suite: eight passed, two opt-in mutation tests skipped. Seventeen focused workbook/coach/cohort tests, typecheck and lint passed; four cohort tests rerun after checkout correction.
- Final live API suite passes: three identity scopes, anonymous/unpaid/other-course denial, all 15 lessons, unpublished new recordings, revision persistence, stale-write 409, invalid cohort lesson rejection, correct tutor dates/saved answer context and both PDFs. An initial simultaneous API/browser run produced an expected conflict on the shared synthetic answer; the sequential API rerun passes.
- October course/lesson snapshot comparison passes after publication; same fee/instructors and exact new teaching dates read back from the database.
- No new real signup, payment, message, tutor-provider session or human-verification submission was tested. Human-widget acceptance is outside this change; independent owner browser auto-redirects signup to checkout and its session was preserved.
- Rollback application: prior quote release `dpl_7yQApJJNVUB354Drghr55U6E7EjE`; new course data is a separate addition and requires a deliberate separate rollback.

- Cleanup PASS: all three synthetic users, their two orders, workbook answers and associated test audit/email rows removed; verified zero remaining fixture users/orders/answers. Private cleanup receipt stored outside tracked source.

## 2026-10-30 — [Codex] Upcoming course renamed for all business types
Owner requested Build Your Business in 30 Days with AI, removing online-only positioning. Updated November database course/cohort title and description, public landing/metadata/social preview, catalogue programme audience, affiliate example and editable/58-page printable workbook. Copy explicitly welcomes shops, local services, tourism and digital ventures. Full 16 November–19 December schedule, 15 sessions, fee and curriculum retained; 30-day business-building focus plus final revision explained. This supersedes the earlier decision to omit “30 Days” from this course title. October history unchanged by snapshot verification. App 977819c on codex/november-december-cohort is live via clean deployment dpl_KHEr4HX768zfY9e43vNWuuqj1a4n; domain alias confirmed. Type/lint, four focused tests, remote build/eight guards, staged and live public desktop/mobile checks and PDF/social-preview visual inspection pass. No QA accounts, messages or payments created. Copy release rollback dpl_q3uN1Vxw89B6kQdTvk5zwMKf4DrQ; database wording is a separate narrow update.

Copy-change acceptance: database course/cohort title readback, correct wider audience, 58-page PDF title/layout, 1200×630 social-preview layout, desktop/mobile registration destination and landing overflow checks passed. No enrollment, auth, payment or workbook-save logic changed; earlier authenticated acceptance remains applicable. Server catalogue uses an existing 60-second cache; refreshed server-rendered catalogue also passed.
