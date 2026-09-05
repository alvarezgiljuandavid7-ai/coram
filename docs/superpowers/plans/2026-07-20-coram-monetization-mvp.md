# CorAM Monetization MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a sandbox-ready CorAM monetization MVP across web, Expo, and versioned Supabase infrastructure without changing production.

**Architecture:** A pure shared-domain package owns plans, permissions, and transposition. Supabase owns organization isolation, effective entitlements, and hard limits; web and native use separate platform clients against the same contracts. RevenueCat and AdMob remain feature-flagged native integrations, while the web reads normalized entitlements without checkout.

**Tech Stack:** TypeScript, React 19, Vite 8, Vitest, Supabase/Postgres/Edge Functions, Expo SDK 57, Expo Router, TanStack Query, RevenueCat, and React Native Google Mobile Ads.

---

### Task 1: Shared domain plans, roles, limits, and transposition

**Files:**
- Create: `packages/shared-domain/package.json`
- Create: `packages/shared-domain/src/plans.ts`
- Create: `packages/shared-domain/src/roles.ts`
- Create: `packages/shared-domain/src/transposition.ts`
- Create: `packages/shared-domain/src/index.ts`
- Test: `packages/shared-domain/src/plans.test.ts`
- Test: `packages/shared-domain/src/roles.test.ts`
- Test: `packages/shared-domain/src/transposition.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Write failing tests for plan capabilities, Free/Starter/Pro member and service limits, ad gating, strongest entitlement, organization permissions, and supported/unsupported chord transposition.
- [ ] Run `npm run test -- packages/shared-domain/src` and confirm failures because the package APIs do not exist.
- [ ] Implement `CORAM_PLANS`, `getPlanLimits`, `hasCapability`, `canShowAds`, `resolveStrongestPlan`, organization permission helpers, `transposeChord`, and `transposeChordText` as pure TypeScript.
- [ ] Re-run focused tests, `npm run lint`, and `npm run build`.
- [ ] Commit `feat(domain): add plans limits roles and transposition`.

### Task 2: Supabase schema, ownership, limits, functions, and RLS

**Files:**
- Create: `supabase/migrations/202607200001_monetization_mvp_schema.sql`
- Create: `supabase/migrations/202607200002_monetization_mvp_functions.sql`
- Create: `supabase/migrations/202607200003_monetization_mvp_rls.sql`
- Create: `supabase/tests/monetization_mvp_rls.sql`
- Create: `packages/shared-domain/src/database.ts`
- Test: `packages/shared-domain/src/database.test.ts`

- [ ] Write failing structural tests asserting all required tables, indexes, constraints, helper functions, RLS enablement, and policies exist in versioned SQL.
- [ ] Define `songs.owner_user_id uuid null` and `songs.organization_id uuid null` with `check ((owner_user_id is not null)::int + (organization_id is not null)::int = 1)`.
- [ ] Add the personal repertoire model: private rows are owned only by `owner_user_id`; ministry rows are owned only by `organization_id`; service songs may reference only ministry-owned songs belonging to the service organization.
- [ ] Implement server-side limit functions and triggers: Free personal song cap, unlimited Pro personal songs, Free member/service caps, and ministry member caps.
- [ ] Implement `resolve_effective_entitlement`, membership permission helpers, safe tracking RPCs, and invite acceptance.
- [ ] Add RLS policies and SQL isolation assertions proving user A cannot read user B private songs, authorized organization members can read ministry songs, and plan limits are enforced.
- [ ] Run structural tests and, if Supabase CLI/Postgres is locally available, run SQL tests without connecting to production. Otherwise record execution as pending while retaining deterministic SQL assertions.
- [ ] Run full tests, lint, and build.
- [ ] Commit `feat(database): add monetization MVP schema and RLS`.

### Task 3: Organization membership workflows

**Files:**
- Create: `src/domain/organizations/organizationsRepository.ts`
- Create: `src/domain/organizations/organizationsRepository.test.ts`
- Create: `src/pages/app/ministry/OrganizationsPage.tsx`
- Create: `src/pages/app/ministry/OrganizationsPage.module.css`
- Create: `src/pages/admin/AdminOrganizationsPage.tsx`
- Modify: `src/routes/AppRouter.tsx`
- Modify: `src/layouts/app-shell/appNavigation.ts`
- Modify: `src/domain/admin/adminCrudRepository.ts`

- [ ] Write failing repository tests for create/edit organization, invite, list/update members, and stable limit error mapping.
- [ ] Implement typed repository methods against Supabase RPC/table boundaries.
- [ ] Build member-facing organization creation/editing, invite link, role, instrument, vocal-part, and limit states using existing CorAM UI patterns.
- [ ] Add the minimal protected admin organization/member surface, retaining `profiles.role` authorization.
- [ ] Run focused tests, full tests, lint, and build.
- [ ] Commit `feat(organizations): add memberships and plan limits`.

### Task 4: Service planning and assignments

**Files:**
- Create: `src/domain/services/servicesRepository.ts`
- Create: `src/domain/services/servicesRepository.test.ts`
- Create: `src/pages/app/ministry/ServicesPage.tsx`
- Create: `src/pages/app/ministry/ServiceDetailPage.tsx`
- Create: `src/pages/app/ministry/Services.module.css`
- Create: `src/components/home/NextServiceSummary.tsx`
- Modify: `src/routes/AppRouter.tsx`
- Modify: `src/pages/app/home/HomeScreenV2.tsx`

- [ ] Write failing tests for create/edit/cancel, upcoming services, assignments, attendance confirmation/rejection, song ordering, and limit errors.
- [ ] Implement repository methods with organization-scoped inputs and no client-selected user impersonation.
- [ ] Implement service list/detail forms, assignments, attendance, songs, and permission-aware actions.
- [ ] Add Home summary for next service, team state, songs, pending actions, and permitted CTA.
- [ ] Run focused/full tests, lint, and build.
- [ ] Commit `feat(services): add planning and assignments`.

### Task 5: Personal and ministry repertoire

**Files:**
- Create: `src/domain/repertoire/repertoireRepository.ts`
- Create: `src/domain/repertoire/repertoireRepository.test.ts`
- Create: `src/pages/app/repertoire/RepertoirePage.tsx`
- Create: `src/pages/app/repertoire/SongEditorPage.tsx`
- Create: `src/pages/app/repertoire/Repertoire.module.css`
- Modify: `src/routes/AppRouter.tsx`
- Modify: `src/layouts/app-shell/appNavigation.ts`

- [ ] Write failing tests for explicit personal/organization ownership, CRUD, search, filters, service association, and server limit error mapping.
- [ ] Implement separate repository entry points `listPersonalSongs(userId)` and `listOrganizationSongs(organizationId)` so callers cannot accidentally mix scopes.
- [ ] Implement personal and ministry tabs, owner-aware editor, search, key, BPM, lyrics, chords, and transposed preview using shared-domain helpers.
- [ ] Ensure Free limit failures preserve existing songs and Pro personal repertoire remains unlimited.
- [ ] Run focused/full tests, lint, and build.
- [ ] Commit `feat(repertoire): add songs and transposition workflows`.

### Task 6: Affiliate partners, courses, and secure redirects

**Files:**
- Create: `src/domain/affiliates/affiliateRepository.ts`
- Create: `src/domain/affiliates/affiliateRepository.test.ts`
- Create: `src/pages/app/academia/PartnerCoursesPage.tsx`
- Create: `src/pages/app/academia/PartnerCourseDetailPage.tsx`
- Create: `src/pages/app/academia/PartnerCourses.module.css`
- Create: `api/affiliate/course/[id].ts`
- Create: `api/affiliate/course/redirectPolicy.ts`
- Test: `api/affiliate/course/redirectPolicy.test.ts`
- Modify: `src/routes/AppRouter.tsx`
- Modify: `src/pages/app/home/HomeScreenV2.tsx`
- Modify: `src/domain/admin/adminCrudRepository.ts`

- [ ] Write failing tests for published-course lookup, HTTPS enforcement, exact/subdomain allowlist behavior, destination rejection, click metadata, and disclosure rendering.
- [ ] Implement repository and secure server redirect using only course ID from the client.
- [ ] Implement Home highlight, list, detail, optional video, coupon, CTA, and affiliate disclosure.
- [ ] Add minimal Admin partner/course configuration, ordering, publishing, featuring, and click totals.
- [ ] Run focused/full tests, lint, and build.
- [ ] Commit `feat(affiliates): add partner courses and secure tracking`.

### Task 7: Sponsorship campaigns and plan gating

**Files:**
- Create: `src/domain/sponsors/sponsorCampaignsRepository.ts`
- Create: `src/domain/sponsors/sponsorCampaignsRepository.test.ts`
- Create: `src/features/sponsors/SponsorProvider.tsx`
- Create: `src/features/sponsors/SponsoredPlacement.tsx`
- Create: `src/features/sponsors/SponsoredPlacement.module.css`
- Test: `src/features/sponsors/sponsorPolicy.test.ts`
- Modify: `src/pages/app/home/HomeScreenV2.tsx`
- Modify: `src/pages/app/AcademiaPage.tsx`
- Modify: `src/pages/app/RecursosPage.tsx`
- Modify: `src/domain/admin/adminCrudRepository.ts`

- [ ] Write failing tests for active date/placement filtering, visible impression recording, click tracking, frequency cap, and Free/paid gating.
- [ ] Implement one provider that consumes normalized plan state and fails open for ministry content but closed for ads.
- [ ] Render labelled sponsorship cards only in Home, Academia, and Recursos.
- [ ] Extend Admin for sponsors, campaigns, activation, priority, and basic metrics.
- [ ] Run focused/full tests, lint, and build.
- [ ] Commit `feat(sponsors): add campaigns and placements`.

### Task 8: Expo Supabase Auth and protected navigation

**Files:**
- Modify: `mobile/package.json`
- Modify: `package-lock.json`
- Modify: `mobile/app.config.ts`
- Create: `mobile/src/services/supabase/secureStorage.ts`
- Create: `mobile/src/services/supabase/client.ts`
- Create: `mobile/src/features/auth/AuthProvider.tsx`
- Create: `mobile/src/features/auth/authState.ts`
- Test: `mobile/src/features/auth/authState.test.ts`
- Modify: `mobile/app/_layout.tsx`
- Modify: `mobile/app/index.tsx`
- Modify: `mobile/app/(auth)/index.tsx`
- Modify: `mobile/app/(app)/_layout.tsx`
- Create: `mobile/app/(app)/profile.tsx`

- [ ] Verify current official Expo/Supabase compatibility and install only SDK-compatible public client, secure persistence, and query dependencies.
- [ ] Write failing tests for loading/session routes, protected redirects, expired sessions, logout cleanup, and account switching.
- [ ] Implement secure native persistence, public Supabase client, Auth provider, deep-link callback handling, login/reset/logout, and QueryClient clearing.
- [ ] Confirm mobile code imports no DOM/web components and includes no service-role credential.
- [ ] Run mobile tests/typecheck, Expo Doctor, Android export, iOS export, plus web regression checks.
- [ ] Commit `feat(mobile-auth): connect Expo to Supabase auth`.

### Task 9: RevenueCat subscriptions and webhook

**Files:**
- Modify: `mobile/package.json`
- Modify: `package-lock.json`
- Modify: `mobile/app.config.ts`
- Create: `mobile/src/features/billing/revenueCatConfig.ts`
- Create: `mobile/src/features/billing/revenueCatClient.ts`
- Create: `mobile/src/features/billing/BillingProvider.tsx`
- Create: `mobile/src/features/billing/billingState.ts`
- Test: `mobile/src/features/billing/billingState.test.ts`
- Create: `mobile/app/(app)/plans.tsx`
- Create: `supabase/functions/revenuecat-webhook/index.ts`
- Create: `supabase/functions/revenuecat-webhook/eventProcessor.ts`
- Test: `supabase/functions/revenuecat-webhook/eventProcessor.test.ts`

- [ ] Verify current RevenueCat Expo compatibility and install `react-native-purchases` without production credentials.
- [ ] Write failing tests for offering mapping, approved/cancelled/pending purchase states, restore, CustomerInfo entitlements, identity logout, account switching, webhook idempotency, refunds, expiration, transfers, and product changes.
- [ ] Implement SDK wrapper, provider, localized paywall, purchase, restore, official subscription management links, and normalized entitlement refresh.
- [ ] Implement authenticated/idempotent Edge Function that stores safe event metadata and updates entitlements using function-only service role access.
- [ ] Run focused/full tests, mobile checks, Doctor, and both exports.
- [ ] Commit `feat(billing): add RevenueCat subscriptions and webhook`.

### Task 10: AdMob test infrastructure

**Files:**
- Modify: `mobile/package.json`
- Modify: `package-lock.json`
- Modify: `mobile/app.config.ts`
- Create: `mobile/src/features/ads/adConfig.ts`
- Create: `mobile/src/features/ads/adPolicy.ts`
- Create: `mobile/src/features/ads/AdProvider.tsx`
- Create: `mobile/src/features/ads/SafeBannerAd.tsx`
- Test: `mobile/src/features/ads/adPolicy.test.ts`
- Modify: `mobile/app/(app)/index.tsx`

- [ ] Verify Expo compatibility and install native Google Mobile Ads support for development builds.
- [ ] Write failing tests for feature flags, consent, test mode, placement allowlist, frequency, Free visibility, and zero ads for all paid plans.
- [ ] Implement one-time initialization, consent state, official test IDs in development/preview, absent-production-ID fail-safe, and safe banner placement.
- [ ] Run focused/full tests, mobile checks, Doctor, and both exports.
- [ ] Commit `feat(ads): add AdMob plan-based infrastructure`.

### Task 11: Cross-slice integration and security coverage

**Files:**
- Create: `src/domain/mvp/mvpIntegration.test.ts`
- Create: `mobile/src/features/mvp/mobileMvpIntegration.test.ts`
- Modify: `supabase/tests/monetization_mvp_rls.sql`

- [ ] Add integration tests covering all plan limits, organization isolation, private repertoire isolation, ministry sharing, affiliate allowlist, sponsorship gating, entitlement expiry, frontend entitlement write denial, RevenueCat logout, and non-admin Admin denial.
- [ ] Run every focused suite and fix only defects within MVP scope.
- [ ] Run `npm run test`, `npm run lint`, and `npm run build`.
- [ ] Run mobile typecheck, Expo Doctor, Android export, and iOS export.
- [ ] Commit `test(mvp): add integration and security coverage`.

### Task 12: Setup documentation, final validation, push, and PR

**Files:**
- Modify: `SETUP_REQUIRED.md`
- Modify: `README.md`

- [ ] Document every pending Apple, Google, RevenueCat, AdMob, Expo/EAS, Supabase, legal, privacy, support, product, entitlement, webhook, and testing requirement without values.
- [ ] Record that staging migrations, sandbox purchases, test ads, device QA, EAS development builds, and legal review are still required.
- [ ] Run clean `npm ci`, full tests, lint, web build, mobile typecheck, Expo Doctor, Android export, and iOS export.
- [ ] Run TestSprite only against the resulting reachable Vercel Preview; never point it at production or a preview that predates the changes.
- [ ] Scan the complete branch history and staged files for secrets, generated binaries, `.testsprite/`, `docs/sql/`, captures, logs, backups, and temporaries.
- [ ] Commit `docs(mvp): add setup and release requirements`.
- [ ] Push `feature/coram-monetization-mvp`, create one draft PR targeting `fix/mobile-tools-data-performance`, and do not merge.
