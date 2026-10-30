# Affiliate page UI refresh

## 2026-10-30 — [Codex] Scope

Stephen requested better UI, useful imagery and global/Pacific wording instead of singling out PNG. Public `/affiliates` now uses a navy/orange/white editorial layout: clear 15% hero, section navigation, existing illustrative photos for three steps, two course-image earning examples, four payout facts, verification guidance, native keyboard-accessible terms accordions, FAQs and final signup CTA. Shared eligibility text says “open to affiliates worldwide, across the Pacific and beyond,” also updating the plain terms displayed in TOS and the dashboard. All payout policies remain unchanged.

Existing approved WebP affiliate assets and course images reused; no new media generation or fabricated customer/earnings testimonials. Full-price examples are explicitly qualified. Brand button/body colours checked for text contrast; reduced-motion anchor handling, focus outlines and 44px touch targets included. Removed redundant nested main landmark and hid floating contact controls on `/affiliates` only after they obscured payout facts in mobile screenshots; contact remains available through the header and FAQ email link. Existing controls on other routes retained.

## Verification

TypeScript, changed lint, whitespace checks and two existing referral/commission tests pass. Initial staged desktop/390px/320px checks pass for six loaded images, join destination, worldwide wording, navigation/payout facts, eight keyboard-accessible terms sections, matching TOS and no horizontal overflow or page errors. Visual review inspected desktop hero, mobile hero, payout section and term controls. Final exact staged and live 1440/390/320px verification also passes after the mobile-overlap fix, including single main landmark and contact widgets absent on affiliates but present on TOS.

No forms, affiliate approvals, account edits, documents, emails, payment providers or commissions were changed/submitted. Local development preview was stopped after slow initial compilation; staged production output is the visual verification target.

Source branch: codex/november-december-cohort in .deployment/quote-release-20261023. Clean tracked-source deployment only; rollback before UI refresh is dpl_GJ2CugKSdyd4f2fBFcL1wNfXWxha. The original full TOS/dashboard terms retain their plain expanded layout; the accordion variant is specific to the public affiliate page.

## Published release
Application e261212774449046971e9a1e7b74c7ea6c7b513a; deployment dpl_BqwyuKeStZBbh3FnALJ795z5vH8N; clean build https://pacific-wave-website-k6gcix21o-pacificwaveprojects.vercel.app. Production pacificwavedigital.com alias readback matches exact deployment. Source pushed; handoff-only commit follows. All eight release route guards passed. Three live browser viewports passed with no page errors/overflow, all six photos loaded, correct signup destination, worldwide copy, section anchors, keyboard term open/close, matching plain TOS and no affiliate widget overlay. No forms or provider controls submitted. Local dev preview stopped; no test users or cleanup needed. Receipts in ignored .deployment/affiliate-terms-20261030/ui-*.json. Screenshot copies in PWD Home/output/affiliate-ui/.
