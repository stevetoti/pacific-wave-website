# Welcome email to personalised onboarding

## 2026-11-04 — [Codex] Acceptance register
Owner wants an onboarding tutor video in student welcome emails and a Speak with Onboarding Tutor button. After clicking, the tutor greets the student by name, asks motivation/expectations/goals and explains how to get the best from class. Teaching team should learn about the student.

| ID | Criterion | Result |
|---|---|---|
| O1 | Actual tutor introduction + animated email preview; CTA points to the student's course | Generic Anam video generated, template tests PASS; deployed pending |
| O2 | Signed-out click preserves exact course/tutor through sign-in; no arbitrary return URLs | Local desktop/mobile browser PASS |
| O3 | Personalised name greeting, one-question interview, accurate class-use guidance | Prompt/greeting tests PASS; real session pending |
| O4 | Explicit session sharing; private specialist notes/history/workbook never injected; old sessions stay private | Whitelist/race/privacy tests PASS; migration unchanged hashes PASS |
| O5 | Admin or assigned instructor can review only that student's shared onboarding, not private/other-course conversations | Local UI PASS; actual permission API pending |
| O6 | Conversation saves and survives reload; staff can read answers; unrelated student data unchanged; fixtures cleaned | Pending actual workflow |
| O7 | Type/lint/build, final deployed desktop/mobile, independent cold review and exact release identity | Pending |

Anam existing Onboarding Tutor persona/avatar/voice reused; no shared persona changes. Initial video request was rejected because persona-sourced renders cannot set dimensions; one corrected render completed. Raw provider render retained privately. Generic introduction contains no student information. Native720×480/25fps video, provider render22.339s/container23.744s; one AAC stream and fast-start MP4 for web. Animated2s preview500px/5fps, manually overlaid Watch introduction label; approximate sentence captions. No 4K or live-video-inside-email claim.

Only new explicitly shared onboarding sessions are visible to the teaching team. Private conversation/workbook/coaching notes and extra profile fields are stripped before mint and every context refresh; delayed notes saves cannot update a new shared session. Onboarding disables external research and reports do not web-search personal goals. Reserved QA emails never reach providers. Historical frozen welcome payloads remain untouched; no existing student is resent an email automatically.
