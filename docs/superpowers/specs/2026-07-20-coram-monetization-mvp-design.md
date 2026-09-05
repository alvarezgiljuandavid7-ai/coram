# CorAM Monetization MVP Design

**Date:** 2026-07-20
**Status:** Approved for implementation
**Branch:** `feature/coram-monetization-mvp`
**Base:** `fix/mobile-tools-data-performance` at `a62e17d99abb2ca590ccc4331f0bbf0839794073`

## 1. Objective

Deliver one reviewable MVP pull request that adds ministry planning, shared repertoire,
affiliate courses, sponsorship placements, native subscriptions, and plan-based mobile
advertising without disrupting the current Vite web application. Supabase is the source
of truth for organization data, effective entitlements, limits, and server-side access.

The delivery is sandbox-first. It prepares Apple StoreKit, Google Play Billing,
RevenueCat, AdMob, Expo development builds, and Supabase Edge Functions, but it does not
run production migrations, purchases, advertisements, EAS production builds, or deploys.

## 2. Delivery Shape

Implementation proceeds as vertical slices in one branch and one pull request. Each
slice ends with focused tests and an independent commit. A failing test, typecheck, or
build blocks the next slice.

The required order is:

1. Shared domain.
2. Supabase schema, functions, RLS, and isolation tests.
3. Organizations and membership.
4. Services and assignments.
5. Shared repertoire and transposition.
6. Affiliate courses and secure redirects.
7. Sponsorship campaigns and placements.
8. Expo Supabase Auth.
9. RevenueCat subscriptions and webhook.
10. AdMob infrastructure and plan gating.
11. Cross-slice QA and security coverage.
12. External setup and release documentation.

## 3. Non-Goals

This MVP excludes AI, chat, marketplace seller onboarding, advanced rehearsal or stage
mode, audio separation, recordings, advanced analytics, enterprise billing, arbitrary
external payment links, and multiple ministries under one church account. It does not
repair the duplicated Corarios data and does not modify untracked `docs/sql/` or
`.testsprite/` content.

## 4. Shared Domain

Create `packages/shared-domain` as a platform-neutral TypeScript workspace consumed by
web and native. It must not import React, React Native, browser globals, Expo modules,
Supabase clients, or storage APIs.

It owns:

- plan IDs: `free`, `pro`, `ministry_starter`, `ministry_pro`;
- entitlement IDs: `pro`, `ministry_starter`, `ministry_pro`;
- commercial reference prices used outside purchase UI;
- capabilities and limits;
- organization roles: `owner`, `admin`, `leader`, `member`;
- member and assignment statuses;
- effective entitlement comparison;
- helpers that determine ads, feature access, member limits, service limits, and
  repertoire limits;
- chord parsing and transposition for A-G notes, sharps, flats, major, minor, seventh,
  extensions, suspensions, diminished/augmented suffixes, and slash chords.

Mobile purchase prices never come from the reference-price constants. They come from
RevenueCat packages backed by App Store Connect and Google Play.

## 5. Supabase Data Model

Versioned migrations live in `supabase/migrations`. They are additive and are not run
against production in this delivery.

Core tables:

- `organizations`, `organization_members`, and `organization_invites`;
- `services`, `service_assignments`, `songs`, and `service_songs`;
- `partners`, `partner_courses`, and `affiliate_clicks`;
- existing `sponsors` extended additively, plus `sponsor_campaigns`,
  `sponsor_impressions`, and `sponsor_clicks`;
- `subscription_entitlements` and `billing_events`.

Existing production-facing names such as `sponsors`, `courses`, `advertisements`, and
`profiles` must not be destructively recreated. Migrations use additive columns,
constraints, and indexes where compatibility with current repositories is required.

Server functions and triggers enforce limits independently of UI:

- one Free trial organization per creator;
- five members for Free, fifteen for Ministry Starter, fifty for Ministry Pro;
- two active services for Free and unlimited services for ministry plans;
- one personal repertoire for Free and unlimited repertoire for Pro/ministry where
  applicable;
- only backend-controlled entitlement writes;
- no deletion of ministry data when an entitlement expires.

`resolve_effective_entitlement(user_id, organization_id)` returns the strongest active
entitlement. Personal Pro applies to its user. Ministry entitlements apply to authorized
members of the referenced organization. Expired and refunded records do not unlock new
actions; an explicit grace-period status may preserve access without deleting data.

## 6. RLS and Authorization

RLS is enabled on every new table. Policies use `auth.uid()`, membership helper
functions, and trusted profile roles. Frontend visibility is never the authorization
boundary.

- Members can read organizations they belong to.
- Owners/admins manage organization details, invites, and members.
- Leaders manage services, assignments, and shared repertoire.
- Members read assigned services and update only their own assignment confirmation.
- Published affiliate courses and currently active sponsor campaigns are publicly
  readable through constrained views or functions.
- Click and impression inserts accept entity IDs and validated placement metadata, not
  client-provided destination URLs.
- Clients can read only their effective entitlement and cannot write entitlements.
- `billing_events` is inaccessible to client roles.
- Existing CorAM admin access continues to depend on trusted `profiles.role`.
- SQL tests create two organizations and prove cross-organization denial for reads and
  writes.

## 7. Organizations, Services, and Repertoire

Web repositories and screens follow existing CorAM domain patterns and premium visual
tokens. The native client consumes the same backend contract through native-specific
Supabase adapters, never DOM components.

Organization flows include creation, editing, invite links, member listing, role,
instrument, vocal part, and limit feedback. Invite tokens are random, expiring, stored
hashed where practical, and accepted through a server-side function.

Service flows include create/edit/cancel, upcoming-service listing, song ordering,
musician assignment, attendance confirmation/rejection, selected key, and notes.

Repertoire supports CRUD, search, filtering, title, artist, key, BPM, lyrics, chords,
and service association. Transposition changes only recognized chord tokens and leaves
ordinary prose untouched.

Home receives a compact ministry summary: next service, team status, songs, pending
actions, and a create-service CTA when the user has permission.

## 8. Affiliate Courses

The web and mobile experiences show published partner courses with instructor, level,
instrument, optional video, informational price, coupon, and the required disclosure:

> CorAM puede recibir una comisión si compras mediante este enlace, sin costo adicional
> para ti.

Clients navigate only to `/affiliate/course/:id`. A server endpoint loads the published
course, validates the destination hostname against the partner allowlist, records the
click, and redirects. It never accepts a destination URL from the client. Invalid,
unpublished, inactive, or non-HTTPS destinations fail closed.

Admin can manage partners and courses, publish, feature, order, and view basic click
counts.

## 9. Sponsorships

Sponsor cards are visibly labelled `Patrocinado`. Allowed placements are Home,
Academia, and Recursos. Auth, vocal tools, hymn/song reading, and service mode do not
render sponsorships.

A central provider resolves the normalized entitlement once. Free may see eligible
campaigns; Pro and ministry plans do not. Impression recording requires an actually
visible placement signal. Click tracking accepts a campaign ID, validates activity and
destination server-side, and redirects. A local session frequency cap reduces repeated
exposure without becoming the source of truth for billing metrics.

## 10. Native Auth

The Expo client uses the same Supabase project and users as web. Its client uses public
Supabase configuration and a native persistence adapter. Session tokens are stored with
an Expo-compatible secure persistence strategy; no service-role key is bundled.

Expo Router guards wait for session restoration before selecting `(auth)` or `(app)`.
Deep links use the existing `coram` scheme. Logout signs out Supabase globally where
appropriate, logs out RevenueCat, clears the native QueryClient, and removes private
local state before showing Auth.

## 11. RevenueCat

`react-native-purchases` is used only by Expo development/preview builds, not Expo Go.
The iOS and Android public SDK keys come from environment variables. RevenueCat is
configured after Supabase authentication with `appUserID = user.id`; email and device
identifiers are never the final identity.

One `default` offering exposes six packages mapped to the approved product IDs. The
paywall shows localized store prices, billing period, renewal, trial details when
present, terms/privacy links, purchase, restore, and official subscription management.
Annual savings are calculated only when comparable real store prices are available.

CustomerInfo controls immediate native UX while Supabase remains the normalized
cross-platform source. Pending or cancelled purchases never unlock a plan. Restore does
not create a purchase. Account switches call `Purchases.logOut()` before a new login to
prevent entitlement leakage.

The `revenuecat-webhook` Supabase Edge Function validates an authorization secret,
stores events idempotently under `(provider, external_event_id)`, processes the approved
RevenueCat event set, updates entitlements, records failures, and avoids logging complete
payloads. Its service-role credential exists only in function secrets.

## 12. AdMob

`react-native-google-mobile-ads` provides native ads in Expo development builds. Test
App IDs and Ad Unit IDs are used in development/preview. Production IDs remain required
environment values and advertising is disabled when absent.

One `AdProvider` owns initialization, consent state, entitlement gating, feature flags,
frequency, and failure-safe behavior. Only Free users can receive ads, and only on Home,
Academia, and Recursos. There are no app-open ads, invasive interstitials, Auth ads, or
ads during tools, reading, or service workflows.

## 13. Error and Offline Behavior

Every remote surface distinguishes loading, empty, retryable error, unauthorized, and
offline states. Limit errors use stable server error codes and human-readable UI copy.
Purchase cancellation is neutral feedback, pending purchases remain pending, and
network failures preserve the last verified entitlement. Tracking failures never block
primary ministry content.

## 14. Testing and Evidence

Pure tests cover plans, limits, role permissions, effective entitlements, chord parsing,
and transposition. Repository tests cover payload mapping and server error handling.
SQL tests cover RLS isolation, client write denial, plan limits, public content, and
webhook idempotency. Native tests cover Auth guards, logout cleanup, RevenueCat identity,
purchase states, restore, and ad gating.

Final local validation includes web tests, lint, web build, native typecheck, Expo
Doctor, Android export, iOS export, secret scan, forbidden-file scan, and Git status.
TestSprite runs only after the changed web client has a reachable Preview deployment.
No Apple sandbox, Google internal-test, real-device ad, or purchase result is claimed
without external evidence.

## 15. External Setup and Release Gate

`SETUP_REQUIRED.md` lists Apple Developer, App Store Connect, Google Play Console,
RevenueCat, AdMob, Supabase, Expo/EAS, legal, privacy, support, products, entitlements,
webhook secret, public SDK keys, signing, and tester requirements without real values.

The PR can be GO for review when code, migrations, RLS tests, web/mobile builds, and
secret scans pass. Native production remains NO-GO until staging migrations, Apple
sandbox purchases, Google internal testing, RevenueCat webhook events, test ads on real
devices, EAS development builds, Android/iPhone QA, and legal/privacy review are complete.
