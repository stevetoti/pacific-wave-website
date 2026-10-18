# PWD automatic weekly rankings — 18 October 2026

Stephen explicitly requested automatic weekly ranking updates in Toti Room. This supersedes the previous manual-only/no-recurring-paid-schedule decision.

- Primary: Mondays09:15Pacific/Efate, first planned19October2026.
- Recovery: Mondays10:15Pacific/Efate, only missing measurements; a complete day returns its existing receipt without paid calls.
- Cloud expression:15 22,23 * * 0UTC; protected production PWD GET/api/cron/weekly-rankings, existing CRON_SECRET/DataForSEO credentials.
- Existing training, notifications and weekly blog jobs preserved. Runs while the Mac/browser is closed; no Codex heartbeat or duplicate local scheduler.
- Private seo_settings rank_automation enabled configuration gates execution and records scheduled outcomes. Scoped cron_jobs slug pwd-weekly-rankings records actual last/next invocation and status. Toti SEO page shows real configuration and last outcome; never infers future success.
- Existing country/device/language/depth:Vanuatu2548/desktop/English/requested100;14tracking/active keywords,5paused excluded. Existing worker’s one completed batch/local date and two-attempt cap retained; recovery reuses per-keyword deterministic IDs and requests only missing observations. Manual owner refresh remains available and shares the same caps.
- Estimated normal full check maximumUSD0.28for14ordinarykeywords; failed-only recovery may add charges up to the same bounded request ceiling. Existing credit only, no auto-top-up/purchase. Credit/account/provider failures remain visible and are not assigned zero or fabricated ranks.
- Off-Monday and before09:15Monday requests return not_due before database/provider work. Nonproduction environment disabled. Existing private RLS and manual owner authentication unchanged; cron requires its existing secret.

Validation:11scheduler/ranking tests, backend type/changed-filelint/build8guards;27frontend tests/type/lint(existing7warnings)/build/bundle scan. Unit tests include UTC/Vanuatu Monday and year boundary, primary/recovery next slots, existing cron preservation, anonymous/wrong authentication denial and no off-schedule paid work. Protected staged cron returns not_due/nextRun18October22:15UTC without a paid call. Cloud activation and release receipts are recorded in journals/evidence after deployment. The first future scheduled execution has not yet been observed.

No new article publication, Google writes, client messages or other-site changes. Existing two provider-failed18October observations await a future measurement; activation itself does not fix those results.

Reference: https://vercel.com/docs/cron-jobs/manage-cron-jobs .

## Live activation and release

Enabled configuration and cloud scheduler read back successfully. PWD app commit 41844dd is live at deployment dpl_42axQrjJGUUcWnokZDRZAPYxZhXj. Toti Room app commit 3495ae6 is live at deployment dpl_G7EMzZwCdZWW4rW8pZiJDKet8wGL. Owner browser verified the enabled Monday 09:15 / 10:15 recovery panel and honest “First scheduled run not yet observed” status. Existing 14 targets, 34 observations and one awaiting article approval remain visible. Screenshot: evidence/pwd-weekly-rank-schedule-live-2026-10-18.png. Activation receipt: evidence/pwd-weekly-rank-activation-2026-10-18.json. Next primary is 2026-10-18T22:15:00Z (19 October 09:15 Pacific/Efate).

Rollback application deployments: PWD dpl_2MQSvuQnhpPjmsfJ2dVfH3NoeQpm; Toti Room dpl_99sLpkZ16eyDVuYZKTuGJx1yPBkT. Disable the private rank_automation enabled flag to pause paid automatic checks. Persistent-memory CLI remains unavailable because numpy is absent; shared markdown journals retain the handoff.
