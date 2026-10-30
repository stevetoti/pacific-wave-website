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

| ID | Requirement | Status at implementation |
|---|---|---|
| C1 | Separate new course/cohort, same fee and instructors | PASS: live draft SQL verification |
| C2 | 15 Mon/Thu/Sat sessions, Nov 16–Dec 19, final 3 revisions | PASS: config, database and focused tests |
| C3 | October course/lessons preserved byte-for-byte | PASS: live snapshot comparison |
| C4 | Same core workbook; new dates and revision activities | PASS: focused tests; independent review corrected inherited dates and October cover |
| C5 | Public catalogue, landing page and registration show new cohort | PENDING deployed browser check |
| C6 | Paid student workbook save/leave/reopen/reload and exports | PENDING deployed synthetic journey |
| C7 | Cross-course/unpaid/anonymous privacy; tutor schedule | PENDING deployed API check; existing/focused tests pass |
| C8 | Production build and required route regressions | PENDING final build/stage |
| C9 | Source commit pushed and mapped to deployment | BLOCKED: existing GitHub integration refuses writes (403); local Git push to be attempted |

The private before/plan/SQL/verification receipts live outside this checkout in `.deployment/november-cohort-20261030` under the parent website workspace. Never commit their meeting credentials, user IDs or environment secrets. Create script refuses duplicate new slugs and inserts the course as unpublished first. Publication and release follow staged verification.
