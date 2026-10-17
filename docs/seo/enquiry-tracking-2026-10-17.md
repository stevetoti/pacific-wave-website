# PWD enquiry measurement

17 October 2026 — [Codex]. User authorised form delivery and enquiry tracking.

| Event | Meaning | Trigger |
| --- | --- | --- |
| `generate_lead` | Enquiry saved in PWD database | Contact or project wizard receives HTTP 201, success and a valid saved submission receipt |
| `contact_phone_click` | Intent to call PWD | Click on PWD's telephone link |
| `contact_whatsapp_click` | Intent to start a PWD WhatsApp conversation | Click on a link addressed to PWD's WhatsApp number |

`generate_lead` is registered as a code-based GA4 key event, once per event, with no invented monetary value. Contact clicks are separate events, not completed calls/conversations or qualified sales. Form identity is `contact` or `project_quote`. No enquiry name, email, phone, company, message, receipt ID or WhatsApp message text is passed in custom event parameters. Event page_location omits query parameters. Existing GA automatic events may also appear; they are not the saved-lead definition.

Events are scoped to public marketing pages. Training landing-page clicks respect its existing analytics opt-in; private LMS/admin pages are excluded from the new contact listener. No tracking on a generic WhatsApp share link or another recipient. Browser extensions/consent/network restrictions may prevent Analytics collection; saved enquiries in Admin remain the operational record.

Both forms retain inputs on errors and count only server-confirmed saved enquiries. Honeypot fake success has no saved receipt and does not count. Receipts deduplicate a repeated success response in memory/session storage but are not sent to Google. Contact form fields remain disabled before hydration to avoid native GET submission/lost input; no-JavaScript users see an ordinary startup fallback and can use direct contact links.

The server saves before email. Notifications retain the existing owner recipients (including steve@pacificwavedigital.com), plain-text content and stable provider idempotency key. Added missing service/additional notes, preferred contact and wizard summary. An email failure does not erase a saved enquiry; notification_status stays pending and the existing authenticated Admin Submissions retry remains available. A provider-accepted notification is not proof of inbox delivery; check provider status separately.

## Verification

- Sixteen targeted API/tracking tests passed, covering persistence failure, email failure, spam trap, CAPTCHA failure, owner notification fields, event privacy and receipt deduplication.
- Desktop/mobile fixture checks passed for contact retry/deduplication, wizard acceptance and phone/WhatsApp clicks. No database records or emails were sent by fixtures. Initial fixture GA hostname patterns missed www and allowed synthetic event traffic; corrected to block vendor subdomains. Initial QA period must be excluded from business comparisons.
- Lint/typecheck and complete production build/eight route guards passed; latest hydration guard rebuild also passed.
- Two explicitly labelled QA enquiries submitted through actual public forms, saved successfully, notification_status sent. Resend reports delivered for both matching notifications to existing steve@/toti@ recipients. This confirms delivery to receiving mail servers, not human reading. GA4 Realtime receives all three events and generate_lead is a key event. Initial counts include QA; do not interpret as customer growth.
- Auto-review rejected running a local development server with production credentials. Local QA used dummy database/no email credentials; public deployed form verification is the safer path.

## QA cleanup

Two labelled QA records remain in Admin pending Stephen’s explicit approval to delete them. No other enquiry data is changed. Sent messages and audit receipts remain as evidence.

## Final release

Application 587c10e; deployment dpl_EVGYY7surCYFmWFPwXpEHbR2j98X promoted to pacificwavedigital.com after final staging checks. All final 24 desktop/mobile checks pass (3.1 minutes). Earlier 22 checks passed; ordinary pre-hydration fallback replaced an empty noscript rendering in the no-JS browser. Provider-backed delivery was verified through both public forms on 9168064; final change affects only that fallback display, not saving/email/tracking.

Live app 587c10e, deployment dpl_EVGYY7surCYFmWFPwXpEHbR2j98X (https://pacific-wave-website-qdys241pr-pacificwaveprojects.vercel.app), promoted to pacificwavedigital.com. Lint/type/build/eight guards, 16 targeted tests, staged desktop/mobile/HTTP checks and all 24 final live checks pass (3.1 min). Two real labelled public-form QA enquiries saved; matching Resend messages delivered to existing owner recipients. GA4 receives generate_lead as key event plus separate phone/WhatsApp clicks; initial totals include QA. No migrations or production credentials changed. Two QA records retained pending explicit cleanup approval.

## 2026-10-17 — [Codex] Explicitly approved QA cleanup completed

- Stephen replied “Delete two QA records.” Deleted only PWD QA Contact Verification (609d2558-cc6e-4d82-b366-909a04bfa699) and PWD QA Quote Verification (2d3d7432-401d-475b-9a68-e34760ab1158), guarded by exact ID/name/site. Post-delete lookup by IDs returned zero rows at 2026-10-17T08:43:33.478Z.
- Delivery audit evidence and sent emails remain preserved; Analytics unchanged. Earlier pending-cleanup notes are superseded. No application code or deployment changed. Local approval audit resides in Google Business Profiles/docs/seo/change-requests/2026-10-17-pwd-qa-enquiry-cleanup.json.
