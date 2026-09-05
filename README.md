# CorAM

CorAM is a React/Vite/TypeScript web and PWA app for ministry singers, musicians, members, and administrators. It centralizes corarios, hymns, academy content, resources, user access, and admin content management.

## Run

```bash
npm install
npm run dev
```

The local app runs on:

```text
http://localhost:3000
```

## Validate

```bash
npm run lint
npm run test
npm run build
```

## Native Application Foundation

CorAM also contains a native Expo application in `mobile/`. It is a separate
React Native client; the existing Vite application remains the web product and
is not embedded in the native shell. Both clients can consume platform-neutral
workspace packages from `packages/`.

Native development requires Node.js 24 and npm 11. Install dependencies from the
repository root with `npm install`, then use the Expo aliases:

```bash
npm run expo:start
npm run expo:typecheck
npm run expo:config
npm run expo:export:android
```

Android emulation requires Android Studio or supported device tooling. Windows
and Linux can test on a physical iPhone with compatible Expo tooling; running
the iOS Simulator or creating iOS builds locally requires macOS and Xcode. The
existing `mobile:*` scripts are the Capacitor workflow for the Vite web app, not
aliases for the Expo workspace.

Only public `EXPO_PUBLIC_*` client configuration belongs in the mobile
environment; never provide a Supabase service-role key. The mobile MVP includes
Supabase Auth guards, encrypted session persistence, RevenueCat purchase/restore
infrastructure, and consent-gated AdMob test infrastructure. All payment and ad
features remain disabled until their public flags and sandbox credentials are
configured. See [`SETUP_REQUIRED.md`](SETUP_REQUIRED.md) before any native build.

## Deploy

CorAM is configured for Vercel:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Required production environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_CORAM_PUBLIC_URL
VITE_CORAM_AUTH_REDIRECT_ORIGIN
```

Set `VITE_CORAM_AUTH_REDIRECT_ORIGIN` in Preview and Production to the stable
HTTPS web domain so OAuth and email callbacks never return to an ephemeral
Preview deployment. Do not commit environment files or credentials.

## Current Capabilities

- Web/PWA app shell.
- Admin dashboard.
- Real Supabase Auth with Google, email/password, signup, password reset, and profile sync.
- Protected Admin access through `app_metadata.role = admin`.
- Supabase Storage buckets for course images, course videos, resources, avatars, and sponsors.
- `media_assets` metadata for uploaded files.
- Corarios from Supabase with search, favorites, and chord transposition.
- Himnario Manantial de Inspiracion from Supabase.
- Courses and enrollments.
- Premium access simulation.
- Resources, mentorships, sponsors, ads, and vocal tools.
- Local persistence through `localStorage`.

## Still Pending

- Staging execution of the Monetization MVP migrations and RLS assertions.
- RevenueCat sandbox/store product configuration and device validation.
- AdMob UMP and test-ad validation in Expo development builds.
- Final legal review for privacy, terms, cookies, refunds, and content rights.

## Monetization MVP

The current branch adds typed plans and limits, private personal repertoire,
organization-scoped ministry repertoire, organizations, services and assignments,
affiliate courses, sponsored placements, native Auth, RevenueCat billing, and
AdMob test infrastructure. Persistent data is designed for Supabase and RLS;
the migrations are versioned but are not applied automatically.

The web app displays the active plan and limits but intentionally does not offer
checkout. Native purchases use StoreKit or Google Play Billing through
RevenueCat after sandbox configuration. No production purchase or ad request is
enabled by default.

## Important Folders

- `src/app`: app-level hooks and state.
- `src/components`: UI surfaces.
- `src/domain/auth`: Supabase Auth integration.
- `src/domain/corarios`: corarios logic and Supabase repository.
- `src/domain/hymns`: hymnal logic and Supabase repository.
- `src/domain/media`: Supabase Storage upload logic.
- `src/shared/supabase`: Supabase browser client.
