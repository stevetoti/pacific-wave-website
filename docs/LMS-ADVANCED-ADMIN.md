# Training administration: course access, coupons and assessments

## Course access

Open `/admin/training-center` → **Access**. Enter the student's verified training account email, a package name or reason, and the courses included. The student receives a course access email and can open published materials, quizzes and the group-course community.

A manual grant is recorded as **Package access**, with zero collected payment. It does not replace an existing paid enrolment. Pending Stripe sessions, bank reviews and refunded payments must be resolved before a manual grant can be applied to that registration. Revoke removes only manual access; it does not refund or cancel a real payment. Private mentorship lessons and recordings retain their individual student assignment.

This is an administrator allocation tool. It does not create a separately purchasable bundle product.

## Coupons

Open **Coupons** → **Create coupon**. Choose a course, code and discount:

- Percentage: 1–100%.
- Fixed amount: whole vatu for VUV; cents for USD/AUD.
- Full fee waiver: unlocks the course without a Stripe or bank payment.

Set a registration limit, optional start/expiry dates and optional student email restriction. Dates are entered in the administrator's local timezone and stored in UTC. Disable a code to stop future use. Existing discounted orders retain their agreed amount.

Students save their registration, then apply the code in checkout. There is one coupon per registration and one registration per student per course. Codes are allocated when applied, including orders awaiting payment; they are not temporary cart reservations. Registration and redemption limits are enforced transactionally in PostgreSQL. An open Stripe checkout is expired before repricing; a completed card payment cannot be discounted. Bank proofs are reviewed against the discounted amount.

## Course and quiz builder

Open **Lessons**, select a course and a lesson. Set a module/section title, position, class date, lesson text, video or private recording, and meeting link. **Duplicate as a draft** creates an unpublished copy with the private recording detached. Save to persist changes.

Assessment types:

1. Single choice
2. Multiple correct answers
3. True/false
4. Short answer with accepted alternatives
5. Fill in the blanks using `[[blank]]` markers
6. Matching prompts to options
7. Ordering options
8. Written answer/essay, reviewed by an instructor

Choose points per question, pass percentage, maximum attempts and time limit. Zero attempts/time means unlimited/untimed. Text answers can be case-sensitive. Matching, multiple-choice and ordering questions award the full question points only for an exact correct response. No partial automatic credit is awarded.

Duplicate and reorder questions or import/export a JSON question bank. Import adds questions to the current quiz, validates their structure and permits up to 100 questions. Exported banks contain answer keys and instructor marking notes: keep them in instructor storage.

Quiz attempts snapshot the saved questions and settings, so later edits do not alter an attempt already in progress. Server time enforces deadlines. Leaving the page does not stop the clock; unsubmitted form answers are not saved. Students can resume an active attempt, but must re-enter unsent answers after a page reload.

## Instructor grading

Open **Grading** for written answers awaiting review. Award points up to each question's maximum and add feedback. Automatic marks and written marks are combined against the attempt's original pass mark. A passing result records lesson completion atomically. Students see the result and feedback in that lesson's attempt history. Passed results also appear in the dashboard's quiz achievements.

## Technical and verification notes

Migration: `supabase/migrations/20260918_lms_advanced.sql`. New tables and RPCs are private to the service role. Runtime APIs authenticate ownership or administrator membership; correct answers and marking notes never appear in student payloads.

Local integration verification uses `TRAINING_EMAIL_MODE=disabled VERCEL_ENV=preview`. In that mode the local sender does not claim the shared live email queue. Production live-email behaviour is unchanged. `scripts/verify-lms-advanced.mjs` creates and removes isolated users, courses, grants, coupons and assessments.

Release verification is recorded in the shared changelog and training handoff. This expands the existing course builder; it is not a claim of complete feature parity with Tutor LMS or LearnDash.

## Lesson thumbnails

In **Lessons**, open or create a lesson, use **Upload lesson thumbnail**, then **Save lesson**. JPG, PNG and WebP files up to 3 MB are accepted. Landscape artwork is cropped to 16:9 and compressed to WebP. You can replace it by uploading another image, or choose **Remove thumbnail** and save. It appears in the admin lesson list, student course journey and selected lesson cover.

**Draft** replaces the former **Placeholder** admin label. Adding content or a thumbnail does not publish the lesson. Tick **Publish lesson materials** and save to change it to **Published**. Students see **Coming soon** while it remains unpublished.
