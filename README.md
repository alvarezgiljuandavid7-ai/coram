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
```

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

- Payments with Stripe.
- Full persisted CRUD for courses, resources, sponsors, ads, and mentorships.
- Stripe webhooks and premium entitlement sync.
- Final legal review for privacy, terms, cookies, refunds, and content rights.

## Important Folders

- `src/app`: app-level hooks and state.
- `src/components`: UI surfaces.
- `src/domain/auth`: Supabase Auth integration.
- `src/domain/corarios`: corarios logic and Supabase repository.
- `src/domain/hymns`: hymnal logic and Supabase repository.
- `src/domain/media`: Supabase Storage upload logic.
- `src/shared/supabase`: Supabase browser client.
