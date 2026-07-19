# CorAM Monetization Platform Design

**Date:** 2026-07-19  
**Status:** Proposed for implementation  
**Branch:** `feature/coram-monetization-platform`  
**Base:** `fix/mobile-tools-data-performance`

## 1. Objective

Evolve CorAM from its current production web application into a maintainable platform with a dedicated Expo/React Native application for Android and iOS. The current Vite web application remains operational and continues to be the public, shareable product while native capabilities are introduced incrementally.

The platform must support future ministry operations, collaborative planning, subscriptions, sponsorships, affiliate content, internal notifications, and mobile distribution without coupling those capabilities to the first native foundation release.

## 2. Product Principles

1. Preserve the working web application and its current routes.
2. Build the native application additively rather than replacing the web client.
3. Keep Supabase as the shared backend, with versioned migrations and reviewed RLS changes.
4. Share domain contracts and design tokens, not platform-specific user interfaces.
5. Introduce monetization only after native authentication, content access, privacy, and sandbox purchases are verified.
6. Avoid manipulative engagement patterns. Retention should come from useful ministry workflows and reliable content.
7. Every phase must be independently testable and reversible before production rollout.

## 3. Current State

The repository currently contains:

- React 19 and Vite 8 web application;
- Supabase client, authentication, content repositories, and role-aware routes;
- TanStack Query for server-state caching;
- Capacitor configuration and mobile-oriented web tooling;
- AppShell V2 and the approved CorAM visual language;
- no Expo application, EAS configuration, or React Native workspace;
- local untracked `.testsprite/` and `docs/sql/` content that must remain outside this initiative unless separately reviewed.

The current Capacitor support is retained. It is not the architectural foundation for the new native application.

## 4. Architecture Decision

Use an additive sibling Expo application with narrowly scoped shared packages.

```text
coram/
|-- src/                         # Existing Vite web application
|-- mobile/                      # New Expo/React Native application
|   |-- app/                     # Expo Router routes
|   |-- src/
|   |   |-- components/
|   |   |-- features/
|   |   |-- services/
|   |   `-- theme/
|   |-- app.config.ts
|   `-- eas.json
|-- packages/
|   |-- domain/                  # Pure TypeScript domain contracts
|   |-- supabase/                # Shared backend contracts and adapters
|   `-- design-tokens/           # Platform-neutral CorAM tokens
|-- docs/
`-- supabase/                    # Future reviewed migrations
```

### 4.1 Web client

The existing `src/` application remains the production web client. The first delivery must not reorganize its routes, authentication, Admin, Web Audio tools, or Supabase behavior.

### 4.2 Native client

The new `mobile/` application uses Expo, React Native, TypeScript, and Expo Router. It starts with a minimal navigation shell and local development configuration. Native screens will be implemented in later deliveries using shared domain contracts.

### 4.3 Shared packages

Shared packages must be pure TypeScript whenever possible. They must not import DOM APIs, React Native components, browser storage, Expo modules, or platform-specific navigation.

- `domain`: entities, enums, validators, and permission vocabulary.
- `supabase`: typed query contracts and platform-neutral repository interfaces. Client construction remains platform-specific.
- `design-tokens`: semantic color, spacing, typography, and radius values. Web CSS and React Native styles consume these tokens independently.

No package should be created until at least two consumers need it. The first delivery may establish package boundaries with only the contracts required by the scaffold.

## 5. First Delivery: Foundation

### Included

- create and work on `feature/coram-monetization-platform`;
- add an Expo/React Native TypeScript application under `mobile/`;
- configure Expo Router and a minimal route structure;
- configure development, preview, and production profiles in `eas.json` without credentials;
- establish CorAM design tokens for the native shell;
- provide environment-variable templates with placeholder names only;
- create the minimum shared domain boundary needed by both clients;
- add focused tests for shared pure logic;
- document local web and mobile development commands;
- verify the existing web build remains unchanged;
- verify Expo configuration and TypeScript checks.

### Excluded

- production deployment;
- App Store or Play Store submission;
- RevenueCat, AdMob, or payment activation;
- SQL execution or production database changes;
- Auth provider changes;
- RLS changes;
- production secrets or signing credentials;
- native implementation of tuner, piano, or warmup;
- teams, service planning, chat, or push notifications;
- broad restructuring of the current web application.

## 6. Native Navigation Foundation

The initial native route tree is structural rather than feature complete:

```text
mobile/app/
|-- _layout.tsx
|-- index.tsx
|-- (auth)/
|   `-- _layout.tsx
`-- (app)/
    |-- _layout.tsx
    `-- index.tsx
```

The shell must support safe areas, Android back behavior, readable loading states, and a stable warm-ivory CorAM canvas. It must not reproduce the web application inside a WebView or phone simulator.

Authentication screens and protected redirects are deferred until the next delivery, when Supabase session persistence can be tested on real devices.

## 7. Backend and Data Boundaries

Both clients will eventually connect to the same Supabase project, but each platform creates its own Supabase client:

- web: existing browser client and persistence behavior;
- native: Expo-compatible storage adapter and deep-link configuration;
- shared: query inputs, output types, status rules, and repository contracts.

No service-role key may be included in either client. Only public client configuration belongs in app runtime environments. Database migrations and storage policies must be versioned, reviewed, and tested separately before execution.

## 8. Security and Privacy

- Never commit `.env*`, tokens, signing keys, API secrets, certificates, or service-role credentials.
- Keep RevenueCat, Apple, Google, Expo, and advertising credentials outside source control.
- Require explicit user consent before analytics or advertising identifiers are collected.
- Keep private ministry, collection, and user data protected by RLS.
- Avoid authorization based solely on frontend email checks.
- Treat role data from trusted backend records as the authorization source.
- Document privacy-policy and account-deletion requirements before store beta distribution.

## 9. Future Delivery Sequence

### Delivery 2: Native identity and content

- Supabase Auth on iOS and Android;
- protected navigation and role-aware destination;
- profile, published courses, resources, corarios, and hymns;
- favorites and collections;
- device and deep-link testing.

### Delivery 3: Native ministry tools

- tuner and microphone permissions;
- piano and reference audio;
- vocal warmup playback;
- interruption, backgrounding, and audio-session behavior;
- real-device performance validation.

### Delivery 4: Ministry operations

- teams and membership;
- service planning and repertories;
- assignments and collaboration;
- activity history and internal notifications.

### Delivery 5: Monetization and partnerships

- entitlement model;
- RevenueCat sandbox subscriptions;
- sponsorship and affiliate content labeling;
- advertising consent and AdMob test configuration;
- restore purchases and account deletion;
- store policy review.

### Delivery 6: Closed beta and release readiness

- EAS preview builds;
- TestFlight and Google Play closed testing;
- privacy, support, and legal pages;
- crash and performance monitoring;
- staged rollout plan;
- explicit production approval.

## 10. Testing Strategy

The first delivery requires:

- existing web tests, lint, and production build;
- shared-package unit tests;
- Expo TypeScript validation;
- Expo configuration validation;
- navigation smoke test where supported;
- no TestSprite run for documentation-only work; use it once functional code is ready and a reachable preview exists.

Later native deliveries add:

- Android emulator and physical Android device;
- iOS simulator where macOS infrastructure is available;
- physical iPhone through EAS development or preview builds;
- microphone permission accepted and denied states;
- offline/reconnect behavior;
- sandbox purchase and restore flows;
- RLS tests using distinct member and admin identities.

No unsupported platform result may be reported as tested.

## 11. Failure Handling

- A mobile initialization failure must show a recoverable error state, not a blank screen.
- Network requests must distinguish loading, empty, retryable error, and unauthorized states.
- Authentication expiry must clear private cached data before returning to login.
- Purchase failures must preserve the existing entitlement until the backend confirms a change.
- Partial content uploads must be cleaned up by an explicit server-side workflow in a later backend phase.

## 12. Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Web regressions caused by workspace changes | Keep web structure stable and run its full validation on every foundation change. |
| Excessive sharing between web and native | Share pure contracts and tokens only; keep UI and platform clients separate. |
| Divergent Supabase behavior | Use common repository contracts and platform-specific adapters with contract tests. |
| Audio behavior differs by device | Defer native audio migration until real-device test infrastructure is ready. |
| Monetization blocks store review | Keep monetization out of foundation and validate policies before implementation. |
| Secret leakage | Templates contain variable names only; audit staged files before each commit. |
| Scope expansion prevents shipping | Close each delivery independently and require explicit approval before the next. |

## 13. Acceptance Criteria for Foundation

The foundation is complete only when:

1. the existing web application passes its established lint, test, and build checks;
2. `mobile/` starts as an Expo project without embedding the web app;
3. native navigation renders on supported local tooling;
4. Expo configuration contains no secrets;
5. shared packages remain platform-neutral and type-check;
6. no SQL, Auth, RLS, Admin, or production deployment change is included;
7. `.testsprite/`, `docs/sql/`, local screenshots, logs, and environment files remain unstaged;
8. the implementation diff is reviewed before commit or push;
9. production remains unchanged.

## 14. Explicit Decisions

- The current Vite web application remains the public web product.
- Expo is the strategic native client.
- Capacitor remains available but is not expanded in the foundation phase.
- Supabase remains the shared backend.
- Monetization is a later, sandbox-first delivery.
- The foundation release does not require Apple Developer, Google Play Console, RevenueCat, or AdMob credentials.
- No production deployment or branch merge occurs without a separate explicit request.

