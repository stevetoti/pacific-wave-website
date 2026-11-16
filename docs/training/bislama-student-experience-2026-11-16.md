# Bislama student experience — 16 November 2026

Status: prepared locally; **not published**. Base source14895f8 includes live d617b11 instructor follow-up changes. Latest observed production deployment remains dpl_8pXwzCqV3kCQjjPSKZaBCmBhwyXp. Recheck current production lineage before release.

The reading-language provider now lives in the shared Training Centre layout, covering the course, dashboard and separate coaching-session routes. Authored UI in dashboard, workbook, recordings, onboarding, classroom, community and messages uses the existing translation dictionary. Public programme titles/descriptions also use it. Bislama dates retain Vanuatu scheduling and names/number placeholders retain their original values.

All 1,723 authored source strings in `scripts/localization/student-source.json` have Bislama entries, with placeholders/URLs checked. Translations use the existing Language Hub grammar/glossary/gold examples and configured Anthropic model. Stephen explicitly approved this authored-copy/reference-only payload; no student answers, profiles, messages, transcripts or recordings were sent. Structured JSON batches replaced incomplete free-form batches; prior completed entries were retained. Core labels, date names and dynamic templates received Codex review. This is not an independent native-speaker review.

## Acceptance evidence

| Criterion | Result | Evidence |
|---|---|---|
| Public catalogue switch | PASS | Real local browser: Bislama navigation, programme titles/descriptions and labels |
| Dashboard language | PASS | Actual StudentDashboard component with local synthetic profile/enrolment/API responses; navigation, course cards and schedule dates translated |
| Workbook text | PASS | Actual DigitalWorkbook component; all 15 dated options; first lesson instructions/fields and final revision content in Bislama |
| Preserve answers | PASS | Entered synthetic English/Bislama sample, switched language before autosave, saved, reloaded and reopened; original text identical |
| Remember language | PASS | Bislama restored after full reload and between local preview sections |
| Onboarding | PASS | Translated introduction, unchecked sharing notice and disabled start button; no AI/media session started |
| Zoom card | PASS | Actual classroom card shows translated course/lesson labels and join/fallback buttons; no Zoom session started in this language check |
| Mobile card | PASS |390 × 844 browser, document width 380 ≤ 390; card labels fit; viewport reset |
| Production student language journey | BLOCKED | Automatic review rejected a new production fixture because prior approval was scoped to Zoom testing. Used local synthetic data instead; no production account/enrolment created |
| Publication | NOT PERFORMED | No push, deployment, domain change or database migration |

TypeScript, changed-file lint, 11 locale/workbook tests and the final production build with all eight route guards pass. Numeric values, variables and URLs are preserved. Temporary `training-center/locale-preview` route was removed before release builds. It is not included in this source. The isolated dev server was stopped.

Browser console hydration warning was attributable to installed Grammarly/body attributes, not the locale provider. No locale rendering exception was observed. Production assets from the earlier Zoom check identify live dpl_8pXwzCqV3kCQjjPSKZaBCmBhwyXp; the language changes are local only.

Student-entered text, community messages, named private coaching transcripts/reports, original recordings, raster artwork and existing English PDF downloads are not rewritten. Embedded third-party Zoom/YouTube controls retain their own language support. Newly authored course copy needs dictionary updates; unknown strings still safely fall back to English.

Source path at preparation: `/private/tmp/pwd-bislama-20261116`, branch `codex/bislama-student-experience-20261116`. Durable source/evidence copy and final commit are in the shared journals and workspace `output/bislama-20261116/`.
