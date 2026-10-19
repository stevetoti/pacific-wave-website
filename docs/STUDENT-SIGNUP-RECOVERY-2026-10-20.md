# Student signup verification recovery — 2026-10-20 [Codex]

Owner report: register button never enables for affected students. Button requires a fresh Turnstile token. Existing loader had no script failure/timeout recovery or visible status; expiry callback cleared token without remounting. The exact network/browser condition affecting individual students was not captured. Live anonymous mobile browser eventually verified; recent server_errors contained no recent signup failures.

Fix: shared widget shows loading/error/success and an explicit retry that keeps form fields. Failed/stalled scripts can be reloaded. Token expiry remounts a fresh widget; old callbacks/listeners/timers are cleaned up. Server verification and disabled-until-verified behavior are preserved. Contact, quote and newsletter share this component.

Cloudflare behavior reference: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/ (expired callback does not itself reset widget).

| Criterion | Local result | Evidence |
| --- | --- | --- |
| Failed script → retry → register enabled, form retained | PASS | signup-verification, desktop/mobile |
| Stalled initialization → visible error → retry | PASS | virtual clock, desktop/mobile |
| Expiry → fresh token → register enabled | PASS | provider callback fixture, desktop/mobile |
| Sign-in → signup remount | PASS | desktop/mobile |
| Signup payload → immediate session → checkout | PASS | existing signup suite; account/auth mocked |
| Missing/invalid CAPTCHA refused by server | PASS | form-bot-defence tests |
| Complete LMS/service release routes | PASS | release browser tests and build guard |
| Actual deployed recovery | BLOCKED | staging pending |

Local production build used Cloudflare public test sitekey only; no test key saved in source/environment files or intended for deployment. Local server uses TRAINING_EMAIL_MODE=disabled and VERCEL_ENV=preview. No student accounts, enrollments, payments, database schema or provider settings changed. Existing Chrome executed tests after bundled test browser initially unavailable. Six targeted server tests, ten browser checks, TypeScript, lint, full production build pass. Public release build must be compiled remotely with existing production keys, never upload this local .next test build.
