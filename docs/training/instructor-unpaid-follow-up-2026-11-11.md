# Instructor follow-up for unpaid registrations

Live code `d617b11bd902e1be09e6f704b392874f342cf63c` on `pacificwavedigital.com`, deployed as `dpl_8pXwzCqV3kCQjjPSKZaBCmBhwyXp`. Migration `20261111_instructor_unpaid_follow_up.sql` adds a Boolean flag to `pwd_lms_course_instructors` with a disabled default.

Annie Toa has the flag on her existing assignment to `vanuatu-november-2026`. In Teaching, open Students, choose the November–December cohort, open Not paid yet, then choose Contact. The instructor can use Email or SMS for pending or rejected registrations. Records awaiting proof review remain in the payment review workflow. The flag does not confer administrator privileges.

To revoke this permission, set `can_follow_up_unpaid` to false on Annie's specific course assignment. The previous app deployment was `dpl_4gVo6YBkLkTemDzLgWix9KhjMMAh`. The additive migration is compatible with that build.

## Acceptance checks

| Check | Protected deployment result |
| --- | --- |
| Explicit grant exposes only pending and rejected registrations in the enabled course plus the usual enrolled registrations in assigned courses | PASS |
| Standard instructor stays enrolled-only, including when teaching the same course | PASS |
| History and outreach summaries respect registration scope when a student also has another course | PASS |
| Mixed unauthorized recipient batches fail before dispatch | PASS |
| Authorized email reaches subject validation and SMS reaches phone validation | PASS |
| Payment actions, proofs, unpaid private recording assignment, WhatsApp and new notes remain outside the permission | PASS |
| Default payment reminder uses a short SMS with the November cohort checkout link and fits the Unicode length limit | PASS in template regression test |
| Actual provider delivery | NOT APPLICABLE. The verification uses a deliberately empty subject and phone. No student communication is requested by this change. |

TypeScript, seven targeted tests and the Vercel production build with eight route guards passed.

The same protected-release API checks passed against the public alias. The live database receipt confirms Annie has the flag on exactly one course and no admin role.

Independent Chrome checks passed on the live alias at desktop 1440 and mobile 390. The enabled instructor opened both composers, checked the checkout link and short SMS, reloaded the page and saw only eligible registrations and history. The ordinary instructor and the enabled instructor's second course with the flag off showed no unpaid registrations. Cleanup verified zero synthetic users, courses, orders, contact logs and status emails.
