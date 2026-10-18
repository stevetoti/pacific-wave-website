# PWD measured DataForSEO rankings — 18 October 2026

Stephen requested real keyword positions in Toti Room. Existing funded server credentials were reused; no credentials were copied into the frontend, no new credit was purchased and no recurring paid schedule was activated.

## Measurement contract

Google organic results, Vanuatu country location2548, English, desktop/Windows; requested depth100. Actual returned organic coverage is recorded for every keyword; missing within that coverage is not asserted as outside top100. Positions use organic rank_group, never the index of a mixed SERP array or an ad/absolute rank. Domain matching parses the URL hostname and allows the exact PWD host/subdomains, rejecting lookalikes and URL mentions.

DataForSEO official Google location catalogue verified country support. Current public live pricing USD0.002 per10results gives an estimated maximumUSD0.02 per normal depth100keyword; search operators and optional paid features excluded. One completed batch per Vanuatu date, maximum two attempts, recovery only for missing deterministic measurement IDs. Existing account credit only. Provider partial status40106 retains valid available organic data with partial flag; other errors never become null/not-found ranking observations.

## Private storage and access

- seo_rankings_history: date/keyword/position/observed URL, deterministic per-day IDs; competitors JSON includes provenance/market/coverage/task/cost. PWD legacy SEO Hub now guards older array versus new metadata shapes.
- seo_settings rank_check:YYYY-MM-DD:VU:desktop:en: CAS lease, bounded attempts and failure state.
- seo_settings rank_snapshot:VU:desktop:en: current per-keyword snapshot for one cheap scoped dashboard query.
- POST https://pacificwavedigital.com/api/seo/rankings: existing PWD admin authentication plus server-managed Toti owner access; exact Toti origin CORS; rate limiting. No unauthenticated or foreign-origin refresh.
- Toti Room /seo:14tracked targets (active/tracking statuses), positions, observed pages, measurement times, returned coverage and mismatch indicators. Paused rows not queried. Reading the dashboard makes no paid provider request. Manual refresh uses the signed-in session; successful same-day checks are reused. Two failed attempts hold further paid checks until the next local date.

## First baseline

Twelve of14targets measured after bounded recovery:8found,4notfound within returned coverage. Two provider failures remain: web development Vanuatu and software development Vanuatu. DataForSEO’s free SERP error log identifies40101Internal SE Server Error for the second-pass tasks at11:08:43UTC. They are marked check failed, never assigned a position. No additional paid retry today.

| Keyword | Organic position | Ranking page |
|---|---:|---|
| Pacific Islands web design |4|/blog/web-development-in-vanuatu|
| web design Vanuatu |7|/blog/web-development-in-vanuatu|
| website design Port Vila |9|/blog/transform-your-business-with-expert-website-development-in-port-vila-1783893656866|
| digital marketing Vanuatu |16|/blog/embracing-digital-transformation-in-vanuatu-a-path-to-business-growth-1783375238709|
| app development Vanuatu |22|/blog/web-development-in-vanuatu|
| ecommerce website Vanuatu |34|/blog|
| SEO services Vanuatu |37|/services/digital-marketing|
| website hosting Vanuatu |48|/services/web-design|

Four other keywords have no PWD match in the organic results returned: AI automation Vanuatu(19), AI chatbot Vanuatu(39), business automation Pacific Islands(29), online payment integration Vanuatu(23). Parentheses show the actual organic result count, not a rank or guaranteed depth. All positions are time/location/device-specific snapshots, not guaranteed for every searcher. They do not settle Google URL Inspection indexing/canonical cases.

Many mapped service queries currently surface a different PWD page. This is evidence for later service-page/internal-link/indexing work, not permission to change content or publish articles in this task.

## Evidence and validation

Full baseline receipt docs/seo/evidence/pwd-dataforseo-baseline-2026-10-18.json. Seven focused backend tests cover organic rank, hostname matching, wrong-market/errors, partial success, missing coverage, daily IDs/statuses, anonymous/foreign-origin denial and CORS. Toti25tests/type/lint/build/bundle scan pass; backend type/changed-filelint/build8guards pass. Deployment and authenticated owner refresh receipts to be recorded in journals. Index monitor, article approvals, review messages and other sites unchanged.

Official references: https://docs.dataforseo.com/v3/serp/google/organic/live/advanced/ ; https://dataforseo.com/pricing/google-serp/google-organic-serp-api ; https://docs.dataforseo.com/v3/serp/errors/ .

## Live release and owner verification

PWD app7f12e6c / dpl_2MQSvuQnhpPjmsfJ2dVfH3NoeQpm; Toti app0dd7873 / dpl_99sLpkZ16eyDVuYZKTuGJx1yPBkT. Exact staged PWD access checks401anonymous/403foreign-origin/204Toti preflight and Toti route/column/bundle checks pass. Live owner browser confirms14tracked targets,34historyrows,12measured positions/coverage,2checkfailed rows and one unchanged pending article. Owner Refresh reaches the authenticated API and correctly reports daily retry limit without incrementing attempt2 or issuing another paid request. Desktop/table filter and settled390px mobile layout pass (body375px; table680px scrolls inside309px container); viewport restored and filter cleared.

Four live API/storage access checks and three public route checks pass. No credentials/schema/RLS/cron changes, content publication, Google writes or outgoing messages. Screenshots and release receipt in GBP docs/seo/evidence/pwd-dataforseo-*. Initial unpromoted PWD stage9hZNobxmGMUotvMH7bM64sz5jfyL superseded by the final tested stage. Rollback PWD dpl_BnAarKhqRHXQHTZAUaMF56YY6WVr; Toti dpl_GNMGw7R9Axojyw3Bq6BcUTCkTrxm.
