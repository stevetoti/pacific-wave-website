# Returning-student registration — 21 November 2026

Stephen reports an October student tried creating another account when joining the one-on-one software class. Read-only account check confirms the original account is verified, signed in on21November, retains its paid October order and has no one-on-one order. No password or real account/enrolment change is needed.

Complete source: `.deployment/returning-students-20261121`, branch `codex/returning-students-20261121`, based on84b8fc0/fbfcc8a complete November/Bislama/SEO/Zoom lineage. Previous production dpl_BgprrpkoVvxFFdZRHT7GrBxFoURA.

Changes:
- Existing-account sign-in appears before signup fields and does not require signup human verification.
- Explicit ACCOUNT_EXISTS and ACCOUNT_CREATED_SIGN_IN errors transition to sign-in, preserving entered email/course and clearing the proposed new password. No automatic password change or sign-in attempt with the new signup password.
- Sign-in/signup/reset mode is recorded in the URL so reload/back does not return to the wrong form. Selected course, dashboard destination and onboarding return survive.
- Course summary remains visible during sign-in/reset. Signup mode remains available for new students.
- New authored labels include Bislama and French translations; unknown/user-authored text remains unchanged.

Acceptance matrix (update with release evidence):

| ID | Observable criterion | Result |
|---|---|---|
| R1 | Existing verified October identity/enrolment preserved, no new real order | PASS — read-only account check |
| R2 | Sign-in choice precedes signup fields and works without signup challenge | Pending browser checks |
| R3 | Duplicate email hands off to sign-in; retains email/course, clears password; no implicit login | Pending browser checks |
| R4 | Wrong password stays actionable; recovery retains course; reset mode survives reload | Pending browser checks |
| R5 | Sign-in reaches selected one-on-one checkout; new course registration persists | Pending browser checks |
| R6 | New signup/closed-course/security constraints remain; no existing-account mutation | PASS — server regression tests |
| R7 | Desktop/mobile fit and existing public/training/admin/SEO source preserved | Pending browser/release checks |
| R8 | Tested staged production commit is the promoted live alias | Pending deployment |

Local/deployed browser contract fixtures intercept all signup, recovery, authentication, order and profile requests. They send no emails or charges and do not mutate student accounts. These prove browser behaviour against a controlled API contract, not delivery of password-reset email or use of a real student's password. No real password reset should be sent without Stephen's explicit instruction.
