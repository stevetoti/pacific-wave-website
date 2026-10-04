# Course challenges

2026-10-05 — [Codex]

Student course dashboard → **Challenges**, directly below AI Faculty. Deep link: `/training-center/course/<course-id>?view=challenges`. Approved paid/granted enrolment required. Students see published challenges and only their own proof/status. They submit a Vanuatu achievement time, explanation and optional HTTPS evidence link. No files or third-party pages are fetched automatically. Proof should be redacted; it is visible only to the student and authorised staff.

Admin → Training centre → Courses & content → **Challenges**. Select the course. Templates cover first affiliate income in weeks 1/2, business-page launch and first paying customer. Admins create/edit drafts and approve prize budgets before publication. Published rules cannot be edited through the application. Instructors see assigned courses and may verify/reject evidence; only admins award prizes and mark delivery. New courses can use the same feature without code changes.

## Approved October prizes

Stephen explicitly approved VT 3,000 total plus two extra Digi Assist Pro months.

- Week 1: 5–11 October 2026, VT 2,000 + one Pro month; one winner.
- Week 2: 12–18 October 2026, VT 1,000 + one Pro month; one winner. Only students who have never earned affiliate income before qualify, including no Week 1 earning.
- Each window opens at 00:00 Vanuatu time and closes at 00:00 on the following Monday (UTC+11). Submit proof before closing.
- Any genuine qualifying affiliate platform; customer must have paid. Self-referrals, clicks/signups, cancelled/refunded transactions do not qualify. Staff must verify first-ever earnings and timestamps from evidence.
- Business-page and first-customer challenges are drafts with suggested/unapproved rewards, hidden from students.

## Review and fulfilment

Review all pending evidence after the week closes. Queue sorts by achievement time, then immutable submission time, then ID for an exact tie. Reject ineligible entries with a clear student-visible reason. Verify genuine qualifying entries. The award action only accepts the earliest verified entry, waits until closing and until pending entries are reviewed, and enforces prize capacity transactionally. Review/award operations lock the challenge row; submission guards use the same lock and database clock. Awarded/delivered entries cannot be downgraded. One entry per user per challenge; no public proof leaderboard.

Cash and Digi Assist rewards are **manual fulfilment**, not automatic transfers/subscription credits. Contact the winner through the existing approved communication workflow, arrange payment/Pro extension, then mark the entry delivered with a student-visible note. No emails or automatic payouts are sent by this feature.

## Implementation and verification

Migration `20261005_challenges.sql`: two RLS-enabled service-only tables, restricted review RPC and submission trigger. API `/api/lms-challenges` enforces verified session, course enrolment/teaching scope, admin-only prize changes, dates and validated HTTPS proof. Server does not assume a self-reported earning is verified.

Run `node --conditions=react-server --import tsx --test tests/challenges.test.ts` and `CHALLENGE_TEST_URL=http://127.0.0.1:3147 node scripts/verify-challenges.mjs`. The integration script creates isolated courses/users, suppresses fixture enrollment emails within their insertion transaction, checks privacy, deadlines, role scope, duplicate entries, chronology, concurrent awards/capacity and delivery, and cleans its fixtures. It makes no actual reward payments.


## 2026-10-05 — [Codex] Challenges published and verified
Commit a9c93eb pushed to main. Production dpl_82DYdFrvKV1bwkHgyBLs85RQJySP READY on pacificwavedigital.com. Eight live public desktop/mobile checks pass (two opt-in skips); real temporary approved student sees exactly two approved weekly prizes with correct amounts/dates and no drafts. Desktop/mobile visual checks pass; all QA fixtures cleaned, local server stopped. Admin course selection/draft save/reload confirmed. Manual reward fulfilment documented; no actual cash or Pro credits issued. Final evidence retained locally to avoid a docs-only deployment.

## Participation Champions and Storian AI — 2026-10-05 [Codex]

Challenges support `first` (existing chronological achievements) and `participation` (one champion, staff-scored). Students submit a short weekly reflection before the deadline. Live attendance, thoughtful recording reflections and written discussion count equally; message volume does not earn extra points. Participation reflections do not ask students to invent an achievement timestamp.

Four criteria, 0–5 each (20 total): attendance/recording engagement; weekly practical activity; helpful questions/contributions; respectful support for classmates. The published rubric includes evidence-based anchors from no evidence (0) to strong verified engagement/application (5). Staff enter and save all four scores with feedback; each student sees only their own scores. Scores cannot be edited after an award.

At closing, review all eligible pending reflections. Highest total wins, then highest practical-activity score, then helpful-contributions score. An exact remaining tie requires a written staff explanation of at least 40 characters. Zero points cannot win. One participation prize per student/course; previous champions are excluded from future award ranking. Course-row locking prevents two concurrent weekly awards to the same student. Cash/first-affiliate awards remain independent, so a Participation Champion may still qualify for another kind of challenge.

Migration `20261005_participation_challenges.sql` adds mode/scores and `pwd_challenge_review_v2`; the prior review RPC delegates to it so old deployed clients cannot bypass participation rules. Tests: `scripts/verify-participation.mjs` exercises actual student reflection UI, staff rubric scoring, bounds, positive-score rule, ranking, explained ties, no-repeat awards and original chronological prizes.

Four weekly Storian AI prize drafts cover 5–11, 12–18, 19–25 October and 26 October–1 November, UTC+11. A fifth draft, **Put AI to Work**, rewards the earliest verified practical AI business task during 5 October–1 November: original problem, prompt, checked/improved output and real use. Each draft suggests one free Storian AI month. These five months await the user's budget confirmation; no Storian subscriptions have been granted automatically.


## 2026-10-05 — [Codex] Participation judging verified
Real isolated desktop/mobile reflections, staff UI scoring, invalid/missing score rejection, positive-score rule, highest eligible score, exact-tie explanation, one participation win/course and independent chronological challenge regression pass. Type/lint/build/unit and eight desktop/mobile release checks pass (two opt-in skips). Fixtures cleaned; screenshots reviewed. Five Storian drafts remain unpublished awaiting explicit five-month budget approval. Deploying scoring support only.
