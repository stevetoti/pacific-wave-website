# Weekly PWD articles — 18 October 2026 [Codex]

Authorised: one useful Vanuatu/Pacific article weekly, held for Stephen’s approval. No automatic publishing and no outgoing emails/messages.

## Operation

- Cloud invocation `/api/cron/weekly-blog` uses the existing production CRON_SECRET; existing admin generation endpoint remains admin-only. No new credentials or permissions.
- Daily 22:00 UTC invocation =09:00 Pacific/Efate. Monday creates the weekly draft; remaining daily invocations are recovery/no-op checks. Local calendar week begins Monday. First bootstrap draft prepared18October; next scheduled new-week slot19October09:00.
- Private `seo_settings` unique `(site_id,setting_key)` weekly record and conditional compare-and-swap lease prevent overlapping runs. Fifteen-minute lease exceeds300-second function limit. Up to3 job attempts/week, each with at most2 model drafts. Source/model/schema/quality/persistence failures fail closed. Missing AI never silently creates a template.
- Exactly one post per weekly record and stable slug. Before generation, recover any saved post from a prior timeout using the stable PWD-scoped slug. Operational brief identifiers stay in the private job record, not public tags. Completed runs never regenerate. Stable weekly slug plus private weekly record; no backlog publication.
- Twelve initial briefs cover distinct Vanuatu/Pacific reader questions mapped to real services. After these, a bounded planner may propose a distinct question within the same approved services; service URL, source URLs and artwork come from server-controlled mapping. Duplicate intent/title/primary keyword checks hold conflicting proposals for review. These checks assist, not replace, human editorial judgement.
- Sources: current first-party service and real project pages fetched for each run. Natural topic targeting, useful structure, allowed links, safe HTML and duplicate checks. Editorial length bounds are house quality gates, not Google ranking rules. No keyword-density target, invented results, fake reviews or promised rankings. Current provider eligibility still requires human verification.
- Local optimized editorial artwork replaces the broken external image-provider dependency for this job. Asset availability checked before saving. Reused conceptual artwork is labelled illustrative; no new paid image calls.
- Persist focus keyword, descriptive title, excerpt (used by public metadata), tags, mapped service/source/brief/version evidence in private run record and the unpublished post. Generated content includes source links and AI-assistance disclosure.
- No Toti Room approval card is created for the repaired PWD path. Approval is in PWD’s existing Blog admin/editor: review facts, edit, then explicitly approve publication. Cron has no publish action. Existing shared publisher remains unchanged for other sites.

## Dashboard and editor

SEO Hub has a separately authenticated weekly publishing-health card: schedule, next slot, last successful draft, current failure/attempt, overdue/stalled state and review links. Keyword provider connection is labelled separately. Blog drafts open the editor rather than a public404. Publication button asks for factual-review confirmation. Save Draft forces unpublished; editor saves focus keyword and image alt, with explicit PWD site scope.

Fourteen service-intent keywords mapped in production with source/geography/date notes. Unverified old volume/difficulty values cleared for these targets; no paid keyword lookup. Four legacy broad/airline phrases labelled low-priority historical research rather than automatically selected. Published and old draft content retained.

## Legacy path and rollout boundaries

BuildProfitAI `company_seo_publish.py pwd` now exits before generation or writes; `seo_opportunity_refresh.py` excludes PWD before paid keyword calls. Other sites are unchanged. The existing company-seo-pwd registry entry is reconciled to the cloud draft job after deployment. Other client generators/shared publishing issues from the audit remain separate work.

## First live draft and verification

ID158210f2-416e-4efe-96bd-b167aca14d72, title “Accepting Online Payments in Vanuatu: A Merchant Readiness Checklist”, focus “online payments for Vanuatu businesses”. Saved unpublished, then fact-reviewed: removed an unsupported settlement-speed comparison, clarified eligibility, added a labelled hypothetical operational acceptance example. Approximately1060words. Still awaits Stephen’s final review and approval. First two attempts were held by editorial checks and saved no article; the third produced the draft. Repeat invocations returned the same ID without extra model calls. One private weekly state row and one weekly post verified.

Six focused tests cover Vanuatu/year boundaries, active/stale/completed/exhausted leases, duplicate/exhausted topic plan, editorial safety/link checks, local assets and unauthenticated cron/health denial. Typecheck/lint/production build and all8existing release-route guards are required. Final staged/live auth, draft privacy, dashboard/editor and schedule verification receipts will be recorded in shared journals.

## Rollback

Before this release: website app55592ee / productiondpl_7sEZ5DyS3etXuDSHACNm8RrUzg22. Promote prior production to remove new cron/UI if needed. Keep the new draft unpublished and retain audit rows. Legacy PWD jobs should remain retired unless explicitly replacing the cloud workflow; never run both. No migrations, existing training/enquiry/payment settings, Google edits, scheduled video changes or other-site publication.

Weekly review UI additionally replaces exact-match density/score recommendations with an editorial checklist, supports the Weekly review category and explicit Save Draft, and keeps operational identifiers out of public-facing keywords. The publisher validates weekly editorial fields without treating legacy title-length or density rules as Google requirements. No publication was performed to test this gate.

## Live release — 18 October 2026 [Codex]

Application60851c8 on codex/pwd-weekly-blog, pushed using the existing stevetoti GitHub identity with command-scoped authentication (global MEDD account unchanged). Final productiondpl_4KMVaMtA1FHT1EpJfMu9zTyWndVu, https://pacific-wave-website-imewd4vsl-pacificwaveprojects.vercel.app, promoted to pacificwavedigital.com. Initial unpromoted staging builddpl_DMuBm2gv2DS5c2efFVJtKGq63uiy was created after a rejected MEDD-account push; corrected identity, pushed the commit and created the final staged release in the required order before promotion. Do not promote the initial staging build as a separate release.

Final verification:6focused tests, TypeScript, changed-file lint, production build/all8release guards;9final staging HTTP checks through existing Vercel CLI protection;10live checks including two concurrent authenticated already_ready responses with the same draft ID. Anonymous REST cannot read the draft; public URL404 and homepage/blog/feed/sitemap exclude it. Existing training and notification crons retained. Vercel project config confirms exactly one new weekly endpoint with0 22 * * * and the active final deployment. PWD registry reconciled to server-cron; real per-week status is in SEO Hub. Expected privacy-test404s were the only2recent error-log entries.

Authenticated live SEO Hub shows Monday09:00Pacific/Efate, next19October09:00, last successful draft18October13:36,1article awaiting review. Editor confirms Draft and Weekly review selected, Save Draft and factual-review guidance present. No publish action performed. Seven obsolete article proposals marked skipped/superseded; five historical broad/duplicate keyword rows paused, all records and ranking history retained. Fourteen mapped service targets remain active. Other28old drafts remain untouched.

Next human step: review the first article in /admin/blog/edit/158210f2-416e-4efe-96bd-b167aca14d72; final publication remains Stephen’s decision. First future scheduled execution is19October09:00; it has not happened at verification time. No Google edits, repeat indexing, client messages/emails, training/payment changes, video scheduling or other-site generation. No local QA server started. Previous production rollbackdpl_7sEZ5DyS3etXuDSHACNm8RrUzg22. Integrate the FULL codex/pwd-weekly-blog lineage before deploying main.
