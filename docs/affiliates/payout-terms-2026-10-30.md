# Affiliate payout and verification terms

## 2026-10-30 — [Codex] Authorised policy

Stephen requested public terms based on Maureen's payout questions: payouts through Global Digital Prime Inc. (USA), suitable USD/local currency with conversion before transfer, US$50 equivalent minimum, monthly payment and full commission without transfer-fee deductions. He authorised selecting and publishing practical verification requirements.

Shared text in `src/lib/lms/affiliate-terms.ts` supplies the public `/affiliates#affiliate-terms`, `/terms#affiliate-programme`, the signed-in affiliate dashboard and future welcome-email payout summary. `/privacy#affiliate-information` discloses the verification/payout purpose and USA/payment-provider processing. Application agreement links the public terms; payout notes explain country/currency/account details and prohibit identity documents/secrets.

Verification policy: legal name, verified account email, phone, country, preferred currency and receiving account in the individual or registered business name. Additional recipient address, ownership proof, ID or business registration only if necessary for a mismatch/provider requirement, after arranging secure submission. No ID-upload facility or automated identity service is claimed or added.

Payout review remains manual. This release publishes policy and guidance; it does not schedule bank transfers, automate exchange rates/threshold decisions, approve commissions or change payment records. Staff must use the provider's quoted exchange rate during monthly review, confirm payout details/rate/amount, cover transfer/conversion fees, and carry forward balances below US$50 equivalent. No fixed monthly calendar date was specified by Stephen, so none is invented.

Primary-source reference for minimal-data/security recommendation: https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business. Provider recipient-name/account matching varies by country/currency; no specific payout provider is selected by this change.

## Acceptance

- TypeScript, changed-file lint and whitespace checks: PASS.
- Existing two referral/commission tests: PASS, including 15% calculation, self-referral protection and refunds.
- Both welcome email formats rendered locally with the shared payout policy: PASS; no email sent.
- Public desktop/mobile terms, FAQ, TOS and privacy checks: PASS on staging and live, anonymous desktop 1440px and mobile 390px.
- Real payment, account changes, sensitive document collection and email delivery: not exercised; none requested.
- Production build and release identity: PASS. App c0b451341cbc210672f7c080cac34e1d7c5d6a50, deployment dpl_GJ2CugKSdyd4f2fBFcL1wNfXWxha (https://pacific-wave-website-n97abfmcd-pacificwaveprojects.vercel.app), exact pacificwavedigital.com alias confirmed. Build includes all eight required route guards.

Public checks covered minimum/carry-forward, monthly cycle, payer/currency/full commission, verification, expanded payment FAQ, linked matching TOS, USA-provider privacy disclosure, overflow and page errors. Shared dashboard guidance compiled and uses the same policy; no authenticated payout edit or application was submitted. Both email bodies rendered locally; no outbound message was triggered. Browser receipts are outside tracked source in .deployment/affiliate-terms-20261030; screenshot inspected at /tmp/affiliate-terms-mobile.png. No test records were created, so no database cleanup was required.

Complete source remains .deployment/quote-release-20261023, codex/november-december-cohort, pushed. Clean tracked-source clone used for deployments. Default CLI file upload transferred only 3.3 MB for 659 source files; prefer this over full archives. Rollback dpl_KHEr4HX768zfY9e43vNWuuqj1a4n. Handoff-only commits may follow the live application commit.
