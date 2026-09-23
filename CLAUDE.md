# CLAUDE.md — Pacific Wave Digital Website

## Latest release — 2026-09-23 [Codex] course communication

Application commits `d0c8d98` + `4e2f971`; verified production `dpl_3eyTu3HTRsVAHJukjYmPR3MeLRmp` promoted to pacificwavedigital.com. Admin **Course communication** is `/admin/training-center/community`; students use **Community & groups**, or **Private mentor chat** for one-on-one courses. Mentions/unread indicators, replies, reactions, pins/search, private files (4 MB), groups and moderation are implemented. Additive migrations `20260923_community_features.sql` and `20260923_mentorship_communication.sql` are applied. Chat notifications stay in-app; no automatic chat email blasts. See `docs/COURSE-COMMUNICATION.md` and memory for permission/testing details.

**Canonical release checkout:** `.deployment/training-recovery`, based on current main. The historical original branch is not a safe standalone deployment source.

## Latest release — 2026-09-22 [Codex] simplified enrollment

Main `af8aed3`, production `dpl_6LGo8aEtxhEiEh9R9RfpY4QxxHaR`: new training signup collects contact/location/attendance, creates a pending enrollment, signs in immediately without email confirmation, then opens payment. Only NEW training accounts bypass confirmation; never update an existing user or global Supabase auth settings. Paid lesson protection remains. See `docs/TRAINING-CENTER-HANDOFF.md` and memory for tests and release evidence.

## Resume here — 2026-09-22 [Codex] training outage recovery

The Sept 21 SEO Git deployment removed the LMS because the previously deployed LMS source was uncommitted. Production was immediately restored to `dpl_Eu5HccX8AogwF9wDrQpv5u4YSiyv`. This recovery branch combines the full live application with all SEO PR #2/#3 changes, excluding unrelated marketing branch history. Recovery is committed/pushed to `main` at `560681e`; Git production `dpl_GZHG67KGEDywDwuB9htiNzPorv97` is READY and owns pacificwavedigital.com. All eight live desktop/mobile smoke checks passed. Details are in `memory/changelog.md`.

**Deploy only complete source from current `origin/main` or a branch based on it.** Historical `pwd-030-proof-production` checkout is not the deployment source of truth. Never deploy a marketing/SEO-only snapshot. `npm run build` checks the required training, registration API, admin and SEO routes before and after compilation. Keep those checks. Run the public desktop/mobile LMS and `release.spec.ts` tests before promotion. No database migration is needed for this recovery; existing students/payments remain in Supabase.

## Project Overview

| Field | Value |
|-------|-------|
| **Name** | Pacific Wave Website |
| **Purpose** | Corporate website for Pacific Wave Digital |
| **Company** | Pacific Wave Digital |
| **Status** | Production |
| **Location** | Yumiwork Nambatu, Port Vila, Vanuatu |

## Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (CMS, Help system)
- **Rich Text:** Tiptap editor
- **Animation:** Framer Motion
- **AI:** OpenAI (help/embeddings)
- **Icons:** Lucide React
- **Markdown:** react-markdown + rehype-raw
- **Hosting:** Vercel

## Supabase

- **Project Ref:** `rndegttgwtpkbjtvjgnc` (verified website database; shared with other apps)
- **Access Token:** `$SUPABASE_ACCESS_TOKEN` (management); service-role key is runtime-only

## Deployment

- **Platform:** Vercel
- **Deploy Token:** `$VERCEL_TOKEN`
- **Deploy:** Push to `main` auto-deploys

## Key Directories

```
src/
├── app/            # Next.js App Router pages
├── components/     # React components
├── lib/            # Utilities
└── styles/         # CSS

supabase/
├── functions/      # Edge Functions
└── migrations/     # Database migrations

scripts/            # Utility scripts
docs/               # Documentation

public/             # Static assets
```

## Key Features

- Corporate homepage
- Services showcase (AI solutions, web development, etc.)
- About/Team pages
- Portfolio/Case studies
- Contact forms
- Blog with CMS
- **AI-Powered Help System** (OpenAI embeddings)
- Responsive design
- Animated sections

## Help System

AI-powered help center using:
- OpenAI embeddings for semantic search
- Supabase vector storage
- Auto-generated help articles

### Related Scripts
| Script | Purpose |
|--------|---------|
| `generate-embeddings.mjs` | Generate OpenAI embeddings |
| `seed-help-articles.mjs` | Seed help content |
| `run-help-migration.mjs` | Run help system migrations |

## Key Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind theme |
| `.env.example` | Safe environment template |

## Brand Colors

- **Deep Blue:** #233C6F
- **Vibrant Orange:** #EF5E33

## Special Instructions

1. **Logo Usage:** Always use logo files, not text-only
2. **Brand Colors:** Deep Blue #233C6F + Vibrant Orange #EF5E33
3. **Help System:** Update embeddings when adding new help articles
4. **SEO:** Optimize meta tags for Vanuatu/Pacific market
5. **Performance:** Use Next.js Image, lazy loading

---

*Last updated: March 2026*

## 2026-09-15 — [Codex] Resume here

Read `docs/readiness-2026-09-15.md` and `memory/` before making changes. This checkout is `pwd-030-proof-production`; Search Console/sitemap work lives on a separate branch. Legacy instructions above identify a different Supabase project than the August journal; verify the intended target before any database or deployment changes.

## 2026-09-15 — [Codex] Repair handoff

Read `docs/RELEASE-READINESS.md` for the implemented repairs, checks, and remaining live release steps. The old readiness report is historical. Never deploy this change before applying/verifying its database migration. Stephen is providing a management token.

## 2026-09-15 — [Codex] Live release handoff

Supersedes the token-pending entries above. Database migrations and three SEO Edge Functions are applied; production deployment dpl_3aY4qGttCgbUGnh5mFtCJMLUf5KQ is live. See docs/RELEASE-READINESS.md for verification and remaining optional/provider checks. Newsletter uses pwd_newsletter_subscribers because the shared legacy newsletter table has a different schema. Changes remain uncommitted and unpushed.

Final wizard correction deployment: dpl_5QiQSCyiizuResfNZZRrxZjWHkrn — [Codex] 2026-09-15: promoted after build and staged SSR checks. Fieldset prevents lost pre-hydration inputs.

## 2026-09-15 — [Codex] Vanuatu training preview handoff

Read docs/VANUATU-TRAINING-HANDOFF.md. Complete landing/registration/admin implementation is previewed at https://pacific-wave-website-fnfd25myj-pacificwaveprojects.vercel.app/vanuatu-training. Additive private training migration/config applied; 21 deployed browser checks and 27 code/database checks pass. Preview is sandbox-email only and must not be promoted as a live-email release. Production launch awaits review. Earlier production remains dpl_5QiQSCyiizuResfNZZRrxZjWHkrn. Source remains uncommitted/unpushed.

## 2026-09-15 — [Codex] Training centre LMS handoff

Read docs/TRAINING-CENTER-HANDOFF.md. Core LMS is implemented and its additive private migration is applied. Local production preview: http://localhost:3100/training-center (while the local server runs). Build/lint, 29 code/database checks and 21 browser checks pass; one duplicate mobile integration is intentionally skipped. Supabase public signup stays disabled; training-specific generated verification links were tested. ANZ/BRED details and Stripe keys remain pending. Automatic approval review blocked exporting service-role/Resend keys for the Vercel preview; request explicit approval, do not bypass it. Production is unchanged. Changes remain uncommitted/unpushed.

## 2026-09-15 — [Codex] Payment configuration update

Vatu-only bank accounts are now saved from Stephen's PDF. Digi Assist's live Stripe API key is in this repo's ignored env; a separate PWD signing secret/new webhook were created, with that webhook disabled until launch. US merchant Global Digital Prime, Inc. supports VUV; unpaid 35,000 VUV checkout creation/expiry succeeded with no charge. `TRAINING_PAYMENTS_MODE=live` plus production environment is now required for live card checkout. See the latest section of docs/TRAINING-CENTER-HANDOFF.md. Earlier Vercel credential-transfer approval is still pending; production remains unchanged.

## 2026-09-15 — [Codex] Resume here — training centre is LIVE

Supersedes deployment-blocked notes above. Owner approved deployment; `dpl_GDMQGXbLDezkkBkjpdtmSiNZ1a3W` is live on pacificwavedigital.com. Training centre, October checkout, live transactional email configuration, ANZ/BRED VUV banks and the dedicated active Stripe webhook are released. Production Vercel variables are persisted; preview defaults remain safe. 20 public browser checks pass; actual card charge/inbox delivery remains an owner verification step. See latest docs/TRAINING-CENTER-HANDOFF.md. All source still uncommitted/unpushed.

## 2026-09-15 — [Codex] Latest visual release

Current production is `dpl_4hVMN7LorqANfAWf1QT2fSZHo9Jg`: owner-requested split student-photo/form login and signup design, responsive mobile cover, no floating contact controls on account pages. Payment/auth configuration stays live. Localhost:3100 matches. See shared changelog.

## 2026-09-15 — [Codex] Latest header correction

Current live release: dpl_5B7jr7fNcybC7FoLojTQKgT9Rgd7. WebsiteFrame suppresses the global navbar and top offset only on /training-center routes; LMS navigation includes Main website. Mobile navigation stacks below the brand. Local port 3100 matches. Auth/payment logic unchanged; build, lint and desktop/mobile layout checks passed.

## 2026-09-15 — [Codex] Latest release — three-course catalogue

Current live production: `dpl_3iPdw693jcbEJckYiwUdBPs4LEEa`. Image-led three-column catalogue, business course coming soon, and live One on One Mentorship Program (VUV 25,000 total / three months). Public programme pages under /training-center/programs/. Additive mentorship migration applied with private assigned lessons, automatic personal roadmap and private recording upload/playback. See latest docs/TRAINING-CENTER-HANDOFF.md for admin operation and test evidence. Stripe checkout verified unpaid; all QA data removed. Source remains uncommitted/unpushed.

## 2026-09-15 — [Codex] Latest corrected mentorship offer

Current production: dpl_9i7pouPTtVAi4mgSrSXMJVL3C2iL. Owner corrected total mentorship price to VUV 250,000 for three months (supersedes earlier VUV 25,000). Includes building one software project during the programme and three free months of Digi Assist AI Pro. Database and page/checkout copy updated. No existing mentorship orders at time of correction. See latest handoff notes for manual Pro activation.

## 2026-09-15 — [Codex] Latest release — communities and account email repair

Current production: dpl_5GM1GAdnxv4PoSKLCfP6N8oCLjom. Group-course community tab with paid student chat, instructor announcements, instructor-managed public/private groups and moderation; admin Community tab. Account signup for existing verified email now sends instructions (previous email_exists branch silently returned success). Branded welcome/verification/recovery/status emails, course recommendations, resend access email and admin delivery logs. Migration 20260915_course_community.sql applied. Tests include isolated real student/instructor UI and privacy checks, sandbox account email acceptance, and production navigation. See latest docs/TRAINING-CENTER-HANDOFF.md. Owner's account email was reissued once; password unchanged. Source still uncommitted/unpushed.

## 2026-09-15 — [Codex] Student dashboard released

Production is dpl_EijQoYo5diBD1oDgC7onY9qGa23f (https://pacific-wave-website-31443gwud-pacificwaveprojects.vercel.app). New sidebar dashboard, private profile/photo editing, course progress, schedules/ICS, quiz results, purchases/CSV, community shortcuts and settings are live. Migration applied. Build, lint, 35 tests, isolated student API/browser checks and six live desktop/mobile checks passed. Temporary accounts, photos, courses and orders removed. Production email/Stripe/VUV banks verified unchanged. Source remains uncommitted/unpushed in the shared working tree.

## 2026-09-16 — [Codex] Account photo menu released

Published dpl_GQuA4Mdu9R2p9TGspADE1cuC1vJ4 (pacific-wave-website-ocofopav5-pacificwaveprojects.vercel.app). Top-right circular photo/initial replaces sign-out text; dropdown includes Settings and Log out. Removed sidebar sign-out duplication. Profile edits refresh header photo. Desktop/mobile menu navigation, outside click, Escape and real temporary-session logout verified; fixtures removed. Lint/build and production configuration checks passed. Source remains uncommitted/unpushed.

## 2026-09-16 — [Codex] CRM export released

Published dpl_A6wW8HkLbbNHNVg7QtmfgpjYXesU (pacific-wave-website-hgm7jtsds-pacificwaveprojects.vercel.app). /admin/training-center Payments now offers course/status-filtered CSV export via admin-only /api/lms/students_export. Includes order contact/course/payment fields, all matching records through pagination, CSV formula neutralisation. Private profile details excluded. Build/lint and isolated admin/student/filter/export checks passed; fixtures removed. No bulk email composer exists; Emails remains delivery tracking. No messages sent.

## 2026-09-16 — [Codex] Admin campaigns published

Production dpl_FL25ji8Nu35j4rz8u7KWcF8NzS7S (pacific-wave-website-i6euz5xrm-pacificwaveprojects.vercel.app). Campaigns tab supports audience selection, branded templates/editor, saved drafts, recipient preview, admin-only test, explicit send, persistent queue, cancellation, provider delivery refresh and unsubscribe suppression. Migration applied; 37 tests, build/lint and isolated desktop/mobile sandbox flow passed. Live payment/email flags preserved. No real campaign sent. See docs/TRAINING-CENTER-HANDOFF.md for workflow and status semantics. Source remains uncommitted/unpushed.

## 2026-09-16 — [Codex] Registration email links published

Live dpl_4ejLgpzijr8ULmHPUrtXaSdTQ2xa (pacific-wave-website-mzhtr363p-pacificwaveprojects.vercel.app). New October form emails include account/sign-in, direct October checkout, Stripe/bank-proof instructions and dashboard link in branded HTML and plain text. Removed obsolete manual-payment-instructions promise. LMS pending/rejected emails link to checkout; paid/review emails link to course. Meeting links remain instructor-published. 37 tests, lint and Vercel build passed; production live flags verified. Existing recipients were not resent messages.

## 2026-09-18 — [Codex] Owner alerts and faster training pages released

Production dpl_1Q7Xj6NGKX5RE6vnDwk7EJihKzhd (pacific-wave-website-4acjmrhzz-pacificwaveprojects.vercel.app). Account/access/reset, newsletter, profile/photo and lesson/quiz summaries route to steve@ through private retried queue. Existing registration/payment/enquiry alerts preserved, with steve@ mandatory for enquiries. Public training pages server-render cached public courses, avoid unnecessary catalogue/dashboard requests, dynamically load dashboard/community, and serve Inter/Jakarta locally. Header uses lightweight profile summary. 39 tests, lint and Vercel builds passed; six live desktop/mobile navigation checks and JS-disabled public rendering passed. Final staged CSS confirmed self-hosted font variables and no Google CSS import. Direct one-recipient Steve test confirmed delivered. Local database integration could not complete due network timeouts; no QA accounts remained. See handoff for precise verification/queue limitations. Source remains uncommitted/unpushed.

## 2026-09-18 — [Codex] Advanced LMS administration released

Production dpl_zXaUViQ2ECjk7Ch3CwamjPkV1U1C (pacific-wave-website-enpsr4kd9-pacificwaveprojects.vercel.app). New Access, Coupons and Grading tabs plus modules, lesson duplication and eight-type assessment builder. Both 20260918_lms_advanced.sql and 20260918_lms_access_campaigns.sql applied. Grants are explicit zero-payment granted/revoked records; coupons snapshot course-currency discounts; attempts snapshot questions/settings and finalize progress atomically. 41 tests, lint, TypeScript, production builds and isolated real API/browser checks passed; fixtures removed. Local 3100 has matching final build with TRAINING_EMAIL_MODE=disabled and VERCEL_ENV=preview to avoid claiming shared live email jobs. See docs/LMS-ADVANCED-ADMIN.md for workflows/boundaries and memory/changelog.md for verification. Source remains uncommitted/unpushed.

## 2026-09-18 — [Codex] Lesson thumbnail release

Current production dpl_Eu5HccX8AogwF9wDrQpv5u4YSiyv (pacific-wave-website-ni0edia2m-pacificwaveprojects.vercel.app). Lesson thumbnail uploader, private optimized 16:9 artwork, admin/student lesson previews and covers; Placeholder label is now Draft. Publish remains explicit. Thumbnail migration applied; 43 tests, build/lint and isolated desktop/mobile upload/save/replace/remove/privacy checks passed; fixtures removed. See latest memory/changelog.md and docs/LMS-ADVANCED-ADMIN.md. Local 3100 matches with QA emails disabled. Shared source remains uncommitted/unpushed.
