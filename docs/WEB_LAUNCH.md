# CorAM Web Launch

CorAM will launch first as a web/PWA app. This keeps one universal app for Android, iOS, tablets, desktop browsers, Linux, Windows, and macOS.

## Recommended hosting

Use Vercel first. Keep Hostinger for the domain if desired.

Reasons:

- Native Vite/React deployment.
- Direct GitHub integration.
- Automatic preview deployments.
- HTTPS and CDN included.
- Simple environment variable management.
- SPA fallback can be configured with `vercel.json`.

## Current Vercel deployment

GitHub repository:

```text
https://github.com/alvarezgiljuandavid7-ai/coram
```

Project:

```text
alvarezgiljuandavid7-ais-projects/coram
```

Production URL:

```text
https://coram-two.vercel.app
```

Latest deployment checked during setup:

```text
https://coram-nhnb5zpmb-alvarezgiljuandavid7-ais-projects.vercel.app
```

GitHub auto-deploy status:

```text
Connected: alvarezgiljuandavid7-ai/coram is linked to the Vercel coram project.
```

## Vercel project settings

If the GitHub repository contains the full `open desing` workspace, set:

```text
Root Directory: coram/app
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

If CorAM is moved into its own repository with `coram/app` as the repository root, use:

```text
Root Directory: .
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Required Vercel environment variables

Set these in Vercel Project Settings > Environment Variables for Production and Preview:

```text
VITE_SUPABASE_URL=https://qbjcqnhgijsotmdzccmi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Do not add any Supabase `service_role` or secret key to Vercel for the browser app.

## Supabase Auth URL settings

After Vercel creates the production URL, update Supabase Dashboard > Authentication > URL Configuration:

```text
Site URL: https://coram-two.vercel.app
Redirect URLs:
  http://localhost:3000/**
  http://127.0.0.1:3000/**
  https://coram-two.vercel.app/**
  https://*.vercel.app/**
```

If Google login is enabled, also update the Google OAuth app:

```text
Authorized JavaScript origins:
  https://coram-two.vercel.app

Authorized redirect URIs:
  https://qbjcqnhgijsotmdzccmi.supabase.co/auth/v1/callback
```

## Production smoke test

After deployment:

1. Open the production URL on desktop and mobile.
2. Confirm `/app`, `/app/corarios`, `/app/himnario`, and `/legal/privacidad` load directly after refresh.
3. Confirm Google login works.
4. Confirm email login and password recovery work.
5. Confirm an admin user reaches `/admin/dashboard`.
6. Confirm a non-admin user cannot reach `/admin`.
7. Confirm corarios and himnario load from Supabase.
8. Confirm the browser offers install/add-to-home-screen behavior where supported.
9. Confirm Vercel preview URLs work for branches or pull requests.

## Keep Vite for now

Do not migrate to Astro for this launch. CorAM is an authenticated application with client-side state, Supabase Auth, protected routes, and admin views. Vite already builds successfully and is a better low-risk path for launch. Revisit Astro only if a future marketing/content site is split out from the app.
