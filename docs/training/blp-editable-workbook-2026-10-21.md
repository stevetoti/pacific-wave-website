# BLP editable workbook — 21 October 2026

BLP participants can open the workbook directly in their approved course page, enter answers and self-checks, and return on another device. Thirteen digital sections reproduce the v5 activities, including E1–E6 during 11 am–noon. Approved v5 participant, outline and facilitator PDFs replace the old course downloads. Existing October workbook support remains intact.

Answers use the existing private service-only table and optimistic revision RPC; no migration. Both routes verify the selected course and signed-in student, and reject cross-course section IDs. Instructor review uses exact course assignments and is read-only. Other students receive only their own entries, irrespective of supplied query IDs.

All seven Anam tutor roles receive the signed-in student's current course workbook snapshot, labelled as unverified student drafts (up to 400 characters per activity). Saves appear in the next AI session; an active call does not refresh mid-session. BLP learning location defaults to Port Vila, Vanuatu, Pacific/Efate. Existing explicit profile location is respected. No citizenship, residency, visa or commercial eligibility is inferred. Tutor research instructions forbid sending private workbook text or identifiers to search.

## Acceptance evidence

Evidence is private and ignored under `.deployment/blp-workbook-evidence/`; synthetic answers and accounts are removed after every acceptance run.

| Criterion | Result before staging |
| --- | --- |
| E1–E6 and all worksheet sections validate independently | PASS — schema tests |
| Original October workbook, generic RPC and exports retained | PASS — existing workbook tests |
| Seven tutor session payloads carry saved answers/location | PASS — captured provider request bodies, provider calls intercepted |
| Private student/course boundaries and pending/anonymous denial | PASS — actual temporary authenticated users and database |
| Teacher exact-course read-only review | PASS — actual assigned/unassigned teacher API and browser |
| Desktop 1440×1000 typing/save/reload/retry | PASS — actual student browser |
| Mobile 390×844 typing/save/reload/retry and no overflow | PASS — actual student browser |
| Blank 24-page PDF, completed PDF and three v5 resources | PASS — real API exports, answer pages rendered and inspected |
| Own saved entries and Port Vila/Vanuatu in actual tutor context | PASS — authenticated context response; excludes other student/October answers |
| Types, lint, production build/eight route guards, 18 focused tests | PASS |
| Staged and live deployment journeys | Pending publication checks; record final results in shared memory |

No real Anam video call was opened by QA; session payload propagation is verified with intercepted provider requests and the live authenticated tutor context. The interface's existing provider consent/quota flow is preserved.

## Release and rollback

Publish only this complete source lineage; it includes earlier signup, SEO, payments and training fixes. Previous live deployment: `dpl_HabQfC6SDH1yzQSNqM6DahRXa4h3`. Reconcile only the BLP introduction's old morning-tea sentence and changed lesson times/content, retaining all lesson IDs, recordings, publication states and student progress. A private before snapshot is retained for that separate data rollback. Do not overwrite concurrently changed lesson content.
