# Course communication

## Where to find it

Admin: **Course communication** in the left sidebar, or `/admin/training-center/community`. Select a course. The **Course communication** tab is also available inside Training centre LMS.

Students: open their enrolled course and choose **Community & groups**. One-on-one students choose **Private mentor chat**. Paid or explicitly granted enrollment is required.

## Conversations and people

- **Course lounge**: students and instructors ask questions and share progress.
- **Instructor announcements**: instructors post; students can read, react and report.
- **Create group**: instructors name a group, add a description and choose private members. Public course groups are visible to everyone enrolled; private groups only to selected students and instructors.
- **Manage members**: change membership of a private group. Access is checked again on every request and attachment download.
- Mentorship conversations are created automatically when an enrollment becomes paid/granted. Each mentee has a separate private conversation with instructors. Its membership cannot be reassigned through the group editor.

## Sending and organizing

Type **@** and select a person, or click **Tag someone**. Tags highlight that student or instructor and add an in-app @ badge for unread mentions. Tags do not send email or SMS.

Messages support replies and thread views, five reactions, author editing, instructor/author removal, instructor pins, message search and older-message history. Edits are labeled; removed messages and their attachments are no longer readable. Instructors can review student reports, lock a conversation or archive it.

Attach JPG, PNG, WebP, PDF or plain text files, up to three files per message and 4 MB per file. Images are converted to WebP. Files are accessible only to currently authorized participants. Include a message with the attachment.

Conversations update automatically while the browser tab is visible. Unread messages and mentions appear beside each conversation. Reading at the bottom marks displayed messages as read; opening search or older history does not silently clear unread messages.

## Operations

Database migrations: `20260923_community_features.sql`, `20260923_mentorship_communication.sql`. New tables and functions are service-only with RLS; API authorization is mandatory.

Regression checks: `npm test`, `npm run lint`, `npm run build`, public desktop/mobile LMS and release tests. `scripts/verify-community-features.mjs` exercises authenticated API/browser flows against localhost:3102 with disposable database fixtures. Start that server with `TRAINING_EMAIL_MODE=disabled VERCEL_ENV=preview ERROR_NOTIFICATION_EMAILS=`. Fixture paid-order email jobs are deleted in the same SQL transaction; fixture cleanup deletes only generated IDs and their private uploads.
