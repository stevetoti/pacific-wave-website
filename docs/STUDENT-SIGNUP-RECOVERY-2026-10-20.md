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
| Actual staged recovery | PASS | Ten desktop/mobile tests on dpl_B63S4UmXK4D9Lmp6hDCX6esVSaA1; isolated provider/account fixtures |
| Live publication | PASS | Owner explicitly approved; production alias confirmed on dpl_B63S4UmXK4D9Lmp6hDCX6esVSaA1 |
| Real provider enables button on desktop/mobile | PASS | Anonymous in-app browser at desktop and 390×844, Cloudflare Success and enabled Create my account observed |

Local production build used Cloudflare public test sitekey only; no test key saved in source/environment files or intended for deployment. Local server uses TRAINING_EMAIL_MODE=disabled and VERCEL_ENV=preview. No student accounts, enrollments, payments, database schema or provider settings changed. Existing Chrome executed tests after bundled test browser initially unavailable. Six targeted server tests, ten browser checks, TypeScript, lint, full production build pass. Public release build must be compiled remotely with existing production keys, never upload this local .next test build.


Staged build: https://pacific-wave-website-c913jywea-pacificwaveprojects.vercel.app (app commit 34cd6a2, production environment, remotely compiled with configured real keys). All ten authenticated staged checks passed. Vercel protection initially intercepted the automated tests; existing CLI authentication issued a deployment-scoped temporary cookie for the successful run. Protection settings unchanged. Real provider on the unaliased staged hostname did not complete automatically in the in-app browser; the new error/retry path appeared as expected. Real-provider success on the live hostname remains untested until promotion.

Automatic approval review REJECTED promotion: user has requested a signup repair but has not explicitly authorized the consequential production release. Do not bypass with main push/domain assignment/alternate tools. Current live remains dpl_5f2qL1GXxGFdcazuxBVZCxUQfoCz. After explicit owner approval: promote this exact staged production deployment, run the browser suite on the live domain and enable PWD_REAL_WIDGET_CHECK=1 for the real-provider read-only test. No CAPTCHA interactions or real signup submissions are needed for that test; if the provider asks for human action, record a blocked check and hand off.

Branch: codex/student-signup-recovery-20261020. Application source is pushed; subsequent acceptance/handoff updates may have their own commit. Preserve the entire branch lineage before any main deployment. Initial branch backup failed because the active GitHub account was meddaustralia; switched to already connected stevetoti, pushed successfully, restored original account. No GitHub credentials changed.


## 2026-10-20 — [Codex] Approved publication and final live acceptance

Stephen explicitly approved publishing and requested mobile/desktop checks. Promoted the exact staged production build successfully; `vercel inspect pacificwavedigital.com` confirms dpl_B63S4UmXK4D9Lmp6hDCX6esVSaA1 READY. Earlier approval blocker is resolved.

Live result: all eight signup regression checks (desktop/mobile recovery, stalled script, expiry/provider error, mode switch, payload/auth/checkout fixture, October CTA) pass. Desktop public release smoke passes. Mobile public release smoke passed with a 90-second suite budget (13.9 seconds final run), after an earlier 30-second total budget expired while visiting the nine service pages. A separate initial parallel test run collided while writing Playwright traces; final regression rerun used a separate output directory.

Real provider: anonymous in-app browser at desktop and 390×844 mobile automatically completed Cloudflare verification, displayed Human verification complete and enabled Create my account. No CAPTCHA was manually solved. Mobile screenshot visibly showed Cloudflare Success and enabled control. Browser viewport overrides restored. An existing-session Chrome check was not used as anonymous acceptance evidence.

Limitations: fresh automated Chrome contexts (headless and headed) did not automatically complete real verification and remain failed automated-provider probes, not passes. Real-browser observation supplies the manual provider acceptance; deterministic provider fixtures supply recovery regression. No actual student account was created and no email/payment/enrollment was sent or changed. Runtime-log query returned no logs; this is an observability limit, not proof of zero errors. All account/server behavior outside the button change remains covered by the existing targeted server tests and mocked handoff.

Final application 34cd6a2; branch codex/student-signup-recovery-20261020. Subsequent commits contain acceptance/handoff and test timeout adjustment only. Preserve complete lineage before future main deployment.
