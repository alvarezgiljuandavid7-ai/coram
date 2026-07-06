# CorAM Functional Web App Design

## Summary

CorAM will move from an AI Studio prototype into a functional React/Vite web application. This first phase keeps the existing web stack because the current product is highly interactive: mobile simulator, admin dashboard, monetization controls, checkout simulation, favorites, course enrollment, chord transposition, vocal tools, and Flutter export.

The goal is not to ship the final production backend yet. The goal is to create a clean, testable, persistent web app foundation that can later connect to Supabase, real authentication, real payments, policy pages, security rules, and a native Flutter app.

## Decision

Keep `coram/app` on React, Vite, TypeScript, and Tailwind.

Do not migrate this phase to Astro. Astro can be useful later for a public marketing site, resource library, SEO pages, or documentation, but CorAM's core experience is an authenticated application with continuous client-side state.

Do not rewrite directly in Flutter yet. The app already contains a rich working web prototype and Flutter templates. First, stabilize product flows and domain logic in the web app, then use that clarity to drive a Flutter-native implementation.

## Users

Primary users:

- Ministry singers and musicians using CorAM to browse corarios, transpose chords, save favorites, enroll in courses, and access vocal tools.
- Angie MZ or CorAM administrators managing corarios, courses, sponsorships, monetization rules, users, ads, and revenue indicators.

Secondary users:

- Future developers integrating Supabase, payments, authentication, security policies, and mobile app delivery.

## Scope

This phase delivers a local web app that behaves like a real product:

- It preserves user and admin changes across refreshes using a clean local persistence layer.
- It has domain logic extracted from oversized components.
- It has tests around the highest-risk behavior.
- It keeps the current simulator, dashboard, and Flutter exporter available.
- It corrects obvious encoding issues from the imported prototype.
- It documents what is mocked now and where real backend integrations will attach later.

Out of scope for this phase:

- Supabase schema and production API.
- Real payment processors.
- Real login providers.
- App store packaging.
- Full Flutter-native rewrite.
- Legal policy drafting. This phase only reserves integration points for terms, privacy, refunds, and content licensing.

## Architecture

The app should be reorganized around domains and feature surfaces:

```text
src/
  app/
    App.tsx
    CoramAppProvider.tsx
  domain/
    corarios/
    courses/
    monetization/
    profile/
    resources/
    sponsors/
  features/
    admin/
    mobile-app/
    flutter-export/
  shared/
    components/
    lib/
    storage/
    styles/
  data/
```

The root app owns product-level navigation only. Feature components receive focused state and actions from a provider or feature-level hooks. Domain modules own pure behavior such as chord transposition, premium access, course enrollment, favorites, and metric calculations.

Large imported components are split incrementally. The first split should remove logic before visual markup: pure utilities and state actions come out first, then repeated UI pieces.

## Data Flow

Initial data comes from existing seed files.

Runtime changes flow through a central app state layer:

- corarios;
- courses;
- resources;
- sponsors;
- user profile;
- monetization settings;
- admin metrics;
- UI preferences such as dark mode.

The persistence adapter stores this state in `localStorage` under versioned CorAM keys. It validates data shape defensively and falls back to seed data if stored data is missing or invalid.

This local adapter should be written behind a narrow interface so a Supabase-backed repository can replace it later without rewriting the UI.

## Core Behaviors

CorAM must support:

- Browse, search, filter, favorite, and view corarios.
- Transpose chord symbols without corrupting lyrics.
- Change lyric font size.
- Enroll in courses and show enrolled courses in the profile.
- Toggle premium status and reflect access changes immediately.
- Block premium sections through the monetization rules.
- Simulate checkout success and unlock relevant access.
- Add and delete corarios from the admin dashboard.
- Add, edit, and delete courses.
- Add, edit, and delete sponsors and ads.
- Update admin metrics when premium user counts change.
- Keep state after a browser refresh.
- Export or copy Flutter templates.

## UI Direction

Register: product UI.

Scene sentence: a ministry leader or musician uses CorAM on a phone before rehearsal and after church service, often in warm indoor lighting, needing fast access and calm confidence rather than decorative spectacle.

Color strategy: restrained product palette with CorAM navy and gold as purposeful brand accents. Gold should mark premium, active, and celebratory states. Navy should anchor navigation, headings, and primary actions. Neutral surfaces should stay warm and readable.

The product should feel trustworthy and devotional without becoming ornate. Familiar mobile app and admin patterns are preferred over invented controls.

## States

Each key surface needs:

- Default state with seeded content.
- Empty state for no favorites, no enrolled courses, no search results, and no admin records.
- Locked premium state with a clear action.
- Checkout processing and success states.
- Storage recovery state when local data is invalid.
- Error state for failed clipboard copy or blocked browser APIs.
- Disabled/loading states for actions that simulate processing.

## Testing Strategy

Use test-first implementation for extracted logic. Add focused tests for:

- chord transposition;
- premium access rules;
- course enrollment toggle;
- favorite toggle;
- app state persistence and fallback;
- admin metric updates.

Do not try to snapshot the full imported simulator first. It is too large and would produce brittle tests. Start by testing pure behavior, then add component tests after the code is split into smaller units.

## Future Backend Path

After this phase, the local repositories can be replaced or backed by Supabase:

- Auth: Supabase Auth with role metadata for user/admin.
- Database: corarios, courses, resources, profiles, memberships, purchases, sponsors, ads.
- Storage: PDFs, course thumbnails, audio, downloadable resources.
- Security: row-level security policies, admin-only mutations, audit trails.
- Payments: Stripe, PayPal, or Mercado Pago depending on launch market.
- Policies: terms, privacy, refunds, content licensing, ministry usage guidelines.

This phase should leave explicit integration boundaries, but not implement those systems yet.

## Acceptance Criteria

- `coram/app` runs as a named CorAM app, not `react-example`.
- TypeScript checks pass.
- The highest-risk domain logic has tests.
- Imported mojibake text in visible UI and domain labels is corrected.
- User changes persist after refresh.
- The simulator and admin dashboard continue to sync.
- Oversized logic is extracted into domain modules and shared hooks.
- The README explains how to run, test, and understand the current limitations.
