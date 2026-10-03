# Course translations

2026-10-03 — [Codex]

Stephen explicitly approved sending authored course/interface text and private gold Bislama references to Anthropic through the existing Language Hub service. The prior automatic approval blocker is resolved. No learner answers, profiles or conversations are in the translation payload.

883 source strings cover course interface copy, October introduction/lesson text, the full interactive workbook and faculty display copy. Bislama uses Language Hub grammar.md, glossary.md and examples.md (152 curated human-translated pairs). French uses no Bislama reference. Generated with the configured model; provenance is in src/lib/lms/locales/provenance.json. New course translations are AI-generated from those references, not individually human-approved. Codex clarified several Bislama registration, commission, ad-spend and privacy passages during review.

English is the first-visit default. The language picker remembers a browser-local preference. Unknown/new course text falls back to English. Original student answers, community posts, assessment question/answer text, uploaded recordings and PDF lesson text are not automatically translated. The English workbook PDF preserves Bislama/French answers. Changing the interface does not remount workbook fields or cancel pending autosave.

All AI faculty sessions receive the selected language and a translated greeting. This does not change the configured avatar/voice or certify native Bislama voice quality. Instructor review shows original answers.

To update: add authored source strings to source.json, then use the existing Language Hub env without logging secrets, set BISLAMA_GOLD_PACK_DIR to language-packs/bislama and run translate-course.mjs. Existing translations are retained. Review meaning, numbers, dates, placeholders and links; run tests/course-language.test.ts, tests/workbook.test.ts and the expanded scripts/verify-workbook.mjs. No per-student/runtime translation calls are made.

Verification: full coverage and placeholder/URL checks pass; type/lint/build pass; seven locale/workbook tests and eight coach/report tests pass. Eight public desktop/mobile release checks pass (two existing opt-in skips). Real temporary-account browser checks pass for English default, Bislama/French content, switching before autosave, original answer persistence/reload, instructor/AI isolation, save-failure recovery, PDF export and revocation. Screenshots reviewed; all fixtures removed.
