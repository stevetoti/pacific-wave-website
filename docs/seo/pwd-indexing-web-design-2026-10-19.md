# PWD indexing investigation and web-design release — 19 October 2026

## Confirmed findings

Authenticated Search Console (pacificwavedigital@gmail.com) reports no Security issues and no Manual actions. Five exact Google Index records remain unresolved: web-development, SEO and ecommerce retain21September2026 duplicate-without-canonical records pointing to https://www.747ph.live/; old crawled HTML is unavailable. AI automation and cloud hosting are now discovered through the sitemap but not crawled/indexed; AI discovery is improved from18October unknown. No evidence establishes the historical cause of the external canonical. Do not label this a proven hack or a resolved Google outcome.

Web-design IS indexed with user canonical https://pacificwavedigital.com/services/web-design and Google canonical “Inspected URL”, last stored crawl21September23:25:16 (UI timezone unspecified). Live Google Inspection Tool smartphone fetch for cloud-hosting19October00:15:12 succeeded, crawl/index allowed and intended selfcanonical; Google-selected canonical only determined after indexing. This is live availability, not Index success.

Current apex responses for all six service URLs:200, one correct selfcanonical, no noindex/X-Robots/header conflict, no sampled gambling content. Ordinary/spoofedGooglebot responses agree; spoofed UA does not prove realGooglebot fetch. HTTP→HTTPS and trailing slash redirects behave correctly; robots and sitemap include all relevant serviceURLs.

## Concrete defect fixed

www DNS already pointed to Vercel, but www was absent from the PWD project and served an apex-only certificate (ERR_TLS_CERT_ALTNAME_INVALID). Added existing www.pacificwavedigital.com to exact project prj_DuwpSNfiGkHmLB2n5dJLaWmoZKde, permanent308 to pacificwavedigital.com; verified=true. Validated HTTPS with certificate checks enforced:308 preserves /services/web-development and querystring. No DNS, email, nameserver, ownership or credentials changed. This repairs a current alternate-host access/consolidation defect; it does not prove the cause of Google's historical external canonical.

## Website changes

Server-rendered web-design page with real E’Nauwi hero and Aelan Basket/E’Nauwi/Lapita homepage previews, buyer-specific scope, project journeys, Port Vila base/remotePacific limits, process, visible FAQs matching existing FAQ schema, contact/phone and links to development/ecommerce/payments/SEO/hosting. Two existing relevant guides link from the page; blog Related Services cards now link directly to real service destinations, including webdesign from web-development articles. No CMS posts or unpublished articles changed. Existing14keyword tracking and weekly jobs preserved.

Static sitemap lastmod values no longer pretend unchanged pages were edited on every build; webdesign19October, existing marketing17October release. Published article dates still come from actual records. Maintain these dates when page content changes.

## Validation and status

112existingtests pass; typecheck and changedfilelint pass; productionbuild/eight releaseguards pass. Eight read-only local HTTP checks verify sixcanonicals and two blog service-link routes; projectlinks and JSON-LD staticHTML checked. Desktop and390px mobile checks confirm oneH1, allfour previewimages loaded, no body overflow. No real form submission, customer email, articlepublication, paidrankrequest or Googleprofile write. Staged/live release and targeted recrawl follow-up to be recorded after deployment. Index outcomes0/5 pending; no topthree claim.

Evidence in GBP docs/seo/evidence/pwd-index-records-2026-10-19.json, pwd-index-http-audit-2026-10-19.json, pwd-hosting-live-test-2026-10-19.txt and pwd-web-design-index-2026-10-19.txt.

## Live release and Google follow-up

App94ddbde on codex/pwd-indexing-web-design pushed and deployed as dpl_5f2qL1GXxGFdcazuxBVZCxUQfoCz (https://pacific-wave-website-7pybjfyby-pacificwaveprojects.vercel.app), then promoted to pacificwavedigital.com after staged webdesign/blog/sitemap/auth checks. Ten final live checks confirm six correctcanonicals, two blogservice-links, www308/path/query and exactproductiondeployment/four preservedcloudcrons. Actual ownerbrowser confirms newhero/content/images/onecanonical and working contactform navigation, no submission. Mobile390body375 with allfour previewsloaded; desktopbody1265/1280. Screenshot evidence/pwd-web-design-live-2026-10-19.png.

Google accepted ONE recrawl request for the materially updated web-design page: “Indexing requested”, prioritycrawlqueue,19October. Evidence pwd-web-design-recrawl-2026-10-19.txt/png. No challenge solved. Previously requested unchanged duplicate URLs were not repeatedly resubmitted; Google explicitly says repeats do not change priority. Actual Google web-development live smartphone test19October00:19:34:200/success, crawlallowed/indexallowed, intendedselfcanonical. Stored GoogleIndex still pending. SubmittedsitemapreportsSuccess, lastread17October,35discovered; perURLtemporaryprocessingmessage does not mean sitemapfetchfailure.

Toti Room existing SEO foundation/OpsBoard updated with completedpage/links/domain repair and indexingtask retainedpending with freshfiveURLstatus. No new paidrank requests, articlepublication, clientmessages or businessprofilechanges. Existing daily GoogleIndex monitor remains. Firstscheduled19October09:00article/09:15rankruns remain future/unobserved atthisrelease. Preserve completebranchlineage beforefuturemain deploy. Rollbackapplication dpl_42axQrjJGUUcWnokZDRZAPYxZhXj; www308 repair is independentprojectconfiguration and should be retained. Historical externalcanonicalcause remainsunproven.
