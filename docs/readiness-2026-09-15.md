# Project readiness review

> Historical assessment before repairs. See [current release status](RELEASE-READINESS.md).

## 2026-09-15 — [Codex]

**Verdict: not ready for production sign-off.** Reviewed checkout: `pwd-030-proof-production` at `39139a4`. This is a source/local assessment, not proof that the deployed version contains every issue.

## Confirmed blockers

1. **Privileged APIs lack server authorization.** `src/app/api/admin/invite-user/route.ts:35` checks identity only if an authorization header exists; omitting it bypasses the check. Help article creation (`api/help/articles/route.ts:50`), updates/deletes (`api/help/articles/[id]/route.ts:54,99`) use the service role without authenticating the caller. Reads permit unpublished content and caller-selected site IDs. SEO article generation likewise permits anonymous draft creation and paid AI calls. No middleware exists in this checkout. Require identity, active role, allowed site and operation before service calls; add negative authorization tests.
2. **Contact form drops messages.** `src/app/(website)/contact/page.tsx:61` only prevents default submission and sets success; no persistence or delivery occurs. Wire up a validated submission handler and report success only after durable acceptance.
3. **Project inquiry can falsely succeed.** `src/app/(website)/get-started/page.tsx:207` logs database errors then continues to success. Notification fetch status is ignored. `api/notify-submission/route.ts:87` returns success even without an email key or after a provider error. Persist first, show database failures, and make email failures observable/retryable.
4. **Production build fails locally.** `npm run build` compiles and passes type checking, then exits 1 collecting `/api/help/search`: `supabaseKey is required`. `.env.local` supplies only public Supabase URL/key; service-role clients are constructed at module import. Required runtime integrations include service-role key, OpenAI, Resend and DataForSEO credentials. Production variable presence has not been verified. Use lazy server client initialization with explicit configuration failures and provision the intended environment.
5. **Dependency audit fails.** Live `npm audit --omit=dev --json` reports 7 affected package entries: 1 critical (Next.js), 5 high, 1 moderate. Installed Next.js is 14.2.35. Other entries: @tiptap/core, linkify-it, markdown-it, nanoid, postcss, ws. Counts are affected package entries, not proven exploitable paths. Upgrade with compatibility validation; do not blindly run audit fix --force. Full machine-readable results: `readiness-npm-audit-2026-09-15.json`.

## Additional issues

- Current branch lacks the Search Console verification and dynamic sitemap changes on `seo/search-console-dynamic-sitemap` (`7461588`). Confirm intended release branch before merging/deploying.
- Homepage defaults (`src/app/(website)/page.tsx:48`) point all four company videos to the same placeholder YouTube ID. Web retrieval of the public homepage also showed all four video links sharing one target.
- Google OAuth uses constant state (`api/auth/google/route.ts:34`) and compares against that constant in callback rather than a per-session nonce; Google disconnect lacks caller authorization. Credentials/tokens share `site_settings` with public branding; verify live row-level permissions before concluding whether credentials are exposed.
- `supabase/migrations/20250222_geo_features.sql:66` defines permissive FOR ALL USING(true) policies. Live grants/policies are unverified; restrict roles and tenant access before applying these migrations.
- `src/lib/permissions.ts:118` matches `/admin` before more specific nested prefixes, so nested blog routes resolve to dashboard permission. Client checks are not a substitute for server/database authorization.
- `.env.vercel` is tracked and contains a Vercel OIDC token. Value was not printed or used; current validity is unknown. Remove credential material from tracking and assess historical exposure/rotation needs.
- No test script or checked-in application tests were found. Five hook-dependency lint warnings remain.

## Verification results and limits

| Check | Result |
|---|---|
| Production build | FAIL: missing Supabase server key during page-data collection |
| Compilation/type validation inside build | PASS before page-data failure |
| npm run lint | PASS, five warnings |
| Production dependency audit | FAIL: seven affected package entries |
| Public homepage web retrieval | Content returned; not a browser interaction or availability guarantee |
| Lead submission source flow | FAIL before reliable persistence/delivery |
| API authentication source flow | FAIL for privileged routes |
| Browser/mobile, authenticated admin, actual delivery | Not verified; blocked sign-off at the failures above |
| Production env, deployed revision, database RLS | Not verified |

No application fixes, deployments, production writes, or email sends were made. Documentation was normalized to the requested CLAUDE.md plus shared memory convention. The memory CLI could not initialize because Python numpy is unavailable; the existing shared journal was read directly.

## Recommended order

1. Close privileged API and database authorization gaps.
2. Repair lead capture and delivery reporting.
3. Provision/validate configuration and obtain a successful production build.
4. Upgrade dependencies and reconcile the release branch.
5. Run isolated end-to-end tests for contact, project inquiry, admin roles, content editing, and Google connection; check desktop/mobile rendering and live deployment.
