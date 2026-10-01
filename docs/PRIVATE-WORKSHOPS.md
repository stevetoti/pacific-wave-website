# Private BLP workshop — 2026-10-01 [Codex]

User request: Business Link Pacific workshop inside the existing LMS, absent from public course listings, shared registration URL, all regular course tools and isolated student chat. Clarification: free registration, but an administrator must verify participants before granting access. No OTP required for the chosen approval workflow.

## Operation

- Landing page: `/training-center/programs/blp-digital-skills-workshop`
- Registration: `/training-center/account?mode=signup&course=blp-digital-skills-workshop`
- Admin → Training centre → Access → Workshop registrations awaiting approval. **Approve participant** grants the free course and sends the existing access email. Revoke from the same Access tab.
- Admin course settings: **Private workshop** excludes public catalogues, recommendations and affiliate promotions. **Admin approval required** prevents automatic access, payment and coupon bypasses. Zero-fee admin-created courses require approval.
- Forwarding the link permits an application, never automatic learning/chat access. Search engines receive noindex on the BLP page. This is an unlisted application page, not a secret URL or invitation token.
- New and existing students use the same login/dashboard. Pending participants see the introduction/timetable and approval status; lesson content, downloads, AI coaches, assessments, recordings and course chat require granted/paid access.
- Nine dated modules are based on the approved v4 workshop outline: 21 October, 9 am–4 pm at Yumiwork. Published module activities are available after approval; no recording is fabricated. Trainers add recordings and assessments through the existing tools.
- Approved v4 participant workbook, course outline and facilitator/course guide PDFs live in `pwd-workshop-resources` (private), downloaded through current enrollment checks. Owner explicitly requested that each student see all three approved PDFs.
- Course images are optimized copies of the supplied illustrations. BLP logo uses the supplied asset.

## Messaging semantics

Public-only students can connect across public courses. A participant with active private enrollment can connect only with a classmate sharing a private course or an assigned instructor/admin. A public enrollment does not bridge that boundary. Separate private workshops remain separate. Course titles from another private workshop are removed from directory results, including when someone belongs to both. Blocking/connection consent still applies. Private groups and course communities retain existing course/member checks.

The boundary also gates existing connections, historical threads, attachments, requests, counts and direct-message notification display/delivery. Refunded/revoked private enrollment loses private peer access. This is a user-level restriction in direct messages; an independently granted public course retains its own authorized lessons/community.

## Release safety

Migration `20261001_private_workshops.sql` must precede application deployment. Seed script defaults to `published:false` so the older production catalogue cannot reveal the course. Only use `--publish` after privacy-aware code owns production. Re-running seed preserves instructor edits; resource PDFs can be refreshed from the approved source folder.

## Acceptance matrix

Tenant: PWD / `rndegttgwtpkbjtvjgnc`. Synthetic roles: applicant, approved BLP students, public student, unrelated private student, administrator. Chromium desktop 1440px and mobile 390px.

| Criterion | Result / evidence |
| --- | --- |
| Database peer isolation, stale connections, different private titles, dual enrollment, counts/refunds | PASS — `tests/private-workshops.test.ts` |
| New signup records free pending approval; cannot silently grant | PASS — `tests/signup.test.ts` |
| Course validation prevents paid-approval dead end | PASS — workshop schema test |
| Independent cold review | PASS — separate acceptance agent; payment copy issue found and corrected |
| Registration/approval/reload/resources in browser | Pending execution |
| Private/public messaging via real API identities | Pending execution |
| Desktop/mobile branding and public exclusion on deployed release | Pending execution |

Engineering: TypeScript/lint/build pass. Full suite: 61 pass and four previously documented contact-form fixture failures (`tests/api.test.ts`, missing bot-defense fields). Later added approval schema test is also passing. Build in sandbox lacked database network access during blog pre-render; release build must run with network.
