# PWD enquiry measurement

17 October 2026 — [Codex]. User authorised form delivery and enquiry tracking.

| Event | Meaning | Trigger |
| --- | --- | --- |
| `generate_lead` | Enquiry saved in PWD database | Contact or project wizard receives HTTP 201, success and a valid saved submission receipt |
| `contact_phone_click` | Intent to call PWD | Click on PWD's telephone link |
| `contact_whatsapp_click` | Intent to start a PWD WhatsApp conversation | Click on a link addressed to PWD's WhatsApp number |

`generate_lead` is registered as a code-based GA4 key event, once per event, with no invented monetary value. Contact clicks are separate events, not completed calls/conversations or qualified sales. Form identity is `contact` or `project_quote`. No enquiry name, email, phone, company, message, receipt ID or WhatsApp message text is passed in custom event parameters. Event page_location omits query parameters. Existing GA automatic events may also appear; they are not the saved-lead definition.

Events are scoped to public marketing pages. Training landing-page clicks respect its existing analytics opt-in; private LMS/admin pages are excluded from the new contact listener. No tracking on a generic WhatsApp share link or another recipient. Browser extensions/consent/network restrictions may prevent Analytics collection; saved enquiries in Admin remain the operational record.

Both forms retain inputs on errors and count only server-confirmed saved enquiries. Honeypot fake success has no saved receipt and does not count. Receipts deduplicate a repeated success response in memory/session storage but are not sent to Google. Contact form fields remain disabled before hydration to avoid native GET submission/lost input; no-JavaScript users can use direct contact links.

The server saves before email. Notifications retain the existing owner recipients (including steve@pacificwavedigital.com), plain-text content and stable provider idempotency key. Added missing service/additional notes, preferred contact and wizard summary. An email failure does not erase a saved enquiry; notification_status stays pending and the existing authenticated Admin Submissions retry remains available. A provider-accepted notification is not proof of inbox delivery; check provider status separately.

## Verification

- Sixteen targeted API/tracking tests passed, covering persistence failure, email failure, spam trap, CAPTCHA failure, owner notification fields, event privacy and receipt deduplication.
- Desktop/mobile fixture checks passed for contact retry/deduplication, wizard acceptance and phone/WhatsApp clicks. No real records or emails sent by fixtures.
- Lint/typecheck and complete production build/eight route guards passed; latest hydration guard rebuild also passed.
- Production delivery and actual GA4 receipt verification pending deployment. No claim of real inbox delivery yet.
- Auto-review rejected running a local development server with production credentials. Local QA used dummy database/no email credentials; public deployed form verification is the safer path.
