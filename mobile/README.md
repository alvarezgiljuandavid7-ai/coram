# CorAM Mobile

This directory contains CorAM's native Expo application. It is a separate React
Native client and does not embed or replace the Vite web application in `src/`.
Shared, platform-neutral code lives in the workspace packages under `packages/`.

## Requirements

- Node.js 24
- npm 11
- Android Studio for a local Android emulator, or Expo-supported device tooling
- Expo-compatible device tooling to test on a physical iPhone from macOS,
  Windows, or Linux
- macOS and Xcode for the iOS Simulator and local iOS builds

Windows and Linux can test the app on a physical iPhone with compatible Expo
tooling. Running the iOS Simulator or creating iOS builds locally requires macOS
with Xcode installed. Android development can use an Android Studio emulator or
a supported physical device.

## Install

Install all workspace dependencies from the repository root:

```bash
npm install
```

## Start

Run Expo from the repository root:

```bash
npm run expo:start
```

The root also provides `npm run expo:android` and `npm run expo:ios` for opening
the corresponding local target when its platform tooling is available.

The existing `mobile:*` scripts belong to the Capacitor workflow for the Vite
web application. Use the `expo:*` scripts for this native workspace.

## Environment

Copy the variable names from `mobile/.env.example` into an ignored
`mobile/.env.local` file and provide only public native-client values:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
CORAM_APP_VARIANT
EXPO_PUBLIC_CORAM_ENABLE_REVENUECAT
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_CORAM_ENABLE_ADMOB
EXPO_PUBLIC_CORAM_ADS_ENV
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
```

Variables prefixed with `EXPO_PUBLIC_` are included in the client bundle. Never
put a Supabase service-role key, signing credential, payment secret, or other
private credential in this environment.

## Validate

Run these commands from the repository root:

```bash
npm run expo:typecheck
npm run expo:config
npm run expo:export:android
```

`expo:config` prints the resolved public Expo configuration.
`expo:export:android` creates a local Android JavaScript export in
`.tmp/expo-android`; it does not publish, sign, or deploy an application.

## Current Limits

The mobile MVP provides protected navigation, Supabase Auth with encrypted
session persistence, RevenueCat subscription infrastructure, and consent-gated
Google Mobile Ads test infrastructure. It does not execute SQL, modify production
data, perform real purchases, request real ads, sign binaries, or submit stores.
RevenueCat and AdMob require an Expo development build; their native behavior is
not fully available in Expo Go. See the repository `SETUP_REQUIRED.md`.
