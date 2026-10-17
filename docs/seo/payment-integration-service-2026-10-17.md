# Online payment integration service — 17 October 2026

Stephen requested an online payment integration service with Stripe, MyCash, M-Vatu and PayPal images and a contact invitation. Added /services/online-payment-integration from the complete existing live source, preserving blog/cards/images, trust corrections, SEO, enquiry tracking and private training/payment work.

## Published scope

- A substantive service page with checkout, local wallet workflows, provider assessment, confirmation/reconciliation, testing and handover. Self-canonical metadata, Service/FAQPage schema and automatic service sitemap inclusion.
- Four authentic provider visuals hosted locally with provenance in payment-provider-assets-2026-10-17.json. Provider identification, no claimed partnership or endorsement; no generated or altered logos.
- Homepage service card and four-provider overview, service-hub listing/overview, navbar/footer links, related-service links and a new contact-form service option. Direct contact CTAs route to /contact#enquiry-form. Existing contact submission and success-event handling retained. The contact-form anchor has a fixed-navigation offset. Browser QA identified the existing decorative hero wave intercepting CTA clicks on desktop; the decorative layer now ignores pointer events, preserving working contact buttons.
- Marketing content only. No provider accounts, merchant applications, keys, transaction charges, customer records, checkout settings or live payment configuration changed. No messages or Google edits.

## Availability wording and primary evidence

Checked official information on 17 October 2026:

- [Stripe global availability](https://stripe.com/global): Vanuatu is absent from direct merchant onboarding countries. Service copy explicitly requires an eligible supported-country account/business. Do not imply a button or foreign customer creates merchant eligibility.
- [PayPal Vanuatu](https://www.paypal.com/vu/home): public page emphasises shopping/sending, not proof of local merchant receiving or bank withdrawal. The service requires confirmation of account-country receiving, withdrawal and settlement capabilities. Do not promise direct PayPal receiving/withdrawal to every Vanuatu bank account. [PayPal feature documentation](https://developer.paypal.com/payouts/supported-features) concerns payouts; it is not proof of checkout eligibility and is not represented as such.
- [MyCash Vanuatu](https://www.digicelpacific.com/mobile/vu/apps/mycashton) and [merchant QR example](https://www.digicelpacific.com/mobile/vu/promotions/mycash-mobile-wallet-two-for-one-qr-pay-promotion) support local wallet/merchant QR use; no current promotional offers are reused.
- [M-Vatu official service](https://vodafone.com.vu/pages/m-vatu) supports local mobile money. Official M-Vatu application icon comes from TELECOM VANUATU LIMITED’s app listing via Apple lookup, not an invented wordmark.
- Public local wallet pages do not establish unrestricted production API access. Copy distinguishes approved QR/payment instructions, reference reconciliation and manual staff confirmation from automated callbacks. Automatic connection only where facilities/access/approval exist. No fabricated transaction fees or onboarding promises.

## Verification and release

TypeScript, lint, complete production build and eight route guards pass. All 15 local responsive checks at 390px/768px/1440px pass: provider image decode, no overflow, service menu navigation, contact CTA, enquiry service choice, self-canonical and Service/FAQPage schema. Homepage article cards remain. No-JavaScript provider display and fully intercepted contact submission preserve the new service and emit one generate_lead event. Screenshots reviewed. Staging/live verification pending. Prior production dpl_7f1hHxVkPGGPqen5MLxT8TURhCSz is rollback reference. Five-service-page indexing monitor unchanged; new service inclusion in sitemap does not establish Google indexing or rankings.
