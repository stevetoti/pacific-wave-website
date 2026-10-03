# Instructors and student messaging

## Instructors (per course)
- Table `pwd_lms_course_instructors(course_id,user_id)`. Admins (admin_users admin/super_admin) manage every course; assigned instructors manage only theirs.
- Server rule: `teachingAccess()` in `src/lib/server/teaching.ts`, used by `/api/lms/admin` (instructors: lessons + recording uploads only), `/api/lms-thumbnails`, `/api/lms-manage` (instructors: grading only). Payments, banks, course settings, grants, coupons, affiliates stay admin-only.
- Admin → Training centre → Instructors: invite by email (new accounts get a set-password link via recovery; existing accounts keep their password), change courses, resend, remove.
- Instructors work in `/training-center/teach` (Lessons, My students, Grading, Course communication, Messages, My instructor profile). Public "Your instructors" cards come from `/api/lms-instructors?scope=public&course=<slug>`.

## Messaging
- Directory: every student with a paid/granted enrolment, unless they hide themselves (`pwd_lms_profiles.directory_visible`). Shows name, photo, headline (occupation · organisation), city and courses — never email or phone.
- Connections (`pwd_lms_connections`, one row per pair): request with optional note, accept or ignore. Ignored requests look "sent" to the requester and cannot be re-sent for 30 days. 20 requests per person per day. If the other person already asked, requesting back accepts.
- Who can message (`pwd_lms_can_message`): accepted connections, or an instructor/admin and a student of their course — and never when either has blocked the other.
- Conversations: `pwd_lms_dm_threads` (one per pair), `pwd_lms_dm_messages`, `pwd_lms_dm_files` (same validation and private bucket as course chat, under `dm/`), `pwd_lms_dm_reads` (read + reminder markers).
- Notifications (`pwd_lms_notifications`): every new private message, connection request/acceptance, course-chat @mention and instructor announcement creates an in-app notification (bell, pop-up, chime) and a branded email. Emails are batched: messages wait 2 minutes and merge per conversation, and are skipped if the person has already read the chat. Sent by the every-minute cron `/api/cron/notifications`. Opt-out: Messages → Settings (`message_emails`). Emails are logged in admin Emails as `notify_<kind>`.
- Privacy: admins cannot browse DMs. Admin → Training centre → Message reports shows only conversations a participant reported; admins can remove messages in that conversation and resolve the report.
- UI: Dashboard → Messages (Chats, Requests, Find people, Settings), badge in the sidebar and account menu; deep link `/training-center/dashboard?tab=messages&with=<user_id>`.

## Contact history (mini CRM)
- Admin → Training centre → Students (or an instructor's Teaching workspace → Students): click a student's name or **History** to open their profile drawer. It shows registrations, Email / SMS / WhatsApp buttons, private staff notes and a timeline of every manual email, SMS, WhatsApp and note plus automatic account and payment-status emails.
- **Contact history** tab lists every send across students, filterable by channel and searchable.
- Instructors can contact, note and view history only for students with confirmed access to their own courses (enforced in `/api/lms-contact`); they never see payment amounts.
- When a send fully succeeds the popup closes and a toast confirms it, with **View history**.

