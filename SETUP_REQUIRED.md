# CorAM Monetization MVP setup required

The code paths for the CorAM Monetization MVP are implemented, but external
services and production infrastructure are intentionally not activated by this
branch. Native production remains **NO-GO** until every applicable unchecked
item below is completed with sandbox and physical-device evidence.

## Supabase staging first

- Review and apply migrations `202607200001` through `202607200008` to a
  disposable or staging Supabase project before any production database.
- Run `supabase/tests/monetization_mvp_rls.sql` against that disposable project.
  The current workstation has no Supabase CLI or Docker, so SQL execution was
  not performed here; deterministic migration and RLS structure tests do pass.
- Verify with separate users that private personal songs remain private,
  organization members see only their organization repertoire, and clients
  cannot write `user_entitlements` or `billing_events`.
- Deploy the `revenuecat-webhook` Edge Function only after staging validation.
- Configure its server-only secrets in Supabase Function secrets:
  `REVENUECAT_WEBHOOK_AUTHORIZATION` and `SUPABASE_SERVICE_ROLE_KEY`.
- Never expose the service-role key through Vite, Expo, Vercel client variables,
  source control, logs, screenshots, or RevenueCat configuration.

## Native public environment

Provide these through ignored local files or EAS environment management. Every
`EXPO_PUBLIC_*` value is bundled into the app and must be treated as public.

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_CORAM_ENABLE_REVENUECAT=false
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_CORAM_ENABLE_ADMOB=false
EXPO_PUBLIC_CORAM_ADS_ENV=test
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
CORAM_APP_VARIANT=development
```

Build-time AdMob App IDs are `ADMOB_ANDROID_APP_ID` and `ADMOB_IOS_APP_ID`.
Development defaults to Google's official sample App IDs. Production ad unit
IDs must never be used while `EXPO_PUBLIC_CORAM_ADS_ENV=test`.

## Expo and stores

- Create/select the Expo/EAS project and add the real `extra.eas.projectId`.
- Choose the final Android application ID and iOS bundle identifier.
- Configure signing and store credentials in EAS; never commit them.
- Create development builds because RevenueCat and Google Mobile Ads use native
  modules and are not fully testable in Expo Go.
- Validate Android on an emulator and physical device. Validate iOS on a
  physical iPhone or macOS/Xcode simulator.
- Configure the `coram://auth/callback` deep link and matching Supabase Auth
  redirect allowlist. Verify Google login and email/password on both platforms.

## RevenueCat sandbox

- Create a RevenueCat project with offering `default`.
- Create entitlements `pro`, `ministry_starter`, and `ministry_pro`.
- Map these products in App Store Connect and Google Play Console:
  `coram_pro_monthly`, `coram_pro_yearly`,
  `coram_ministry_starter_monthly`, `coram_ministry_starter_yearly`,
  `coram_ministry_pro_monthly`, and `coram_ministry_pro_yearly`.
- Use the Supabase user UUID as RevenueCat `appUserID`; never use email.
- Configure the authorized webhook URL and header, then test initial purchase,
  renewal, cancellation, billing issue, expiration, refund, product change,
  restore, and duplicate webhook delivery in sandbox.
- Verify StoreKit and Google Play Billing independently. No real purchase was
  executed in this implementation task.

## AdMob and consent

- Create Android/iOS AdMob apps and banner units only after bundle identifiers
  are final.
- Configure UMP privacy messages and validate consent in required and
  not-required regions.
- Keep test IDs for development/preview. Enable the feature flag only after a
  development build shows test-labelled ads.
- Verify banners appear only for Free users in Home, Academia, and Resources;
  Pro and both Ministry plans must receive zero ad requests.
- No real advertisement was requested in this implementation task.

## Web feature flags

The web app shows the active plan and limits but intentionally has no checkout.
Sponsors are controlled by `VITE_CORAM_ENABLE_SPONSORS`; affiliate destinations
are resolved by the server endpoint from stored course IDs and HTTPS allowlists.

## Legal and operations

- Approve privacy policy, terms, subscription renewal/cancellation text,
  refunds, account deletion, affiliate disclosure, sponsored-content labels,
  cookie/consent behavior, content rights, and support contacts.
- Confirm App Store and Play Store metadata, age rating, data safety/privacy
  disclosures, review accounts, screenshots, and support URLs.
- Reassess `npm audit`: the current Expo-compatible dependency tree reports 12
  moderate vulnerabilities and zero high/critical vulnerabilities.

## GO / NO-GO

- [x] Pure domain, repository, policy, and integration tests pass.
- [x] Web typecheck/lint and production build pass.
- [x] Expo typecheck and Expo Doctor 20/20 pass.
- [x] Android and iOS JavaScript exports pass.
- [x] Public keys and feature flags are separated from server secrets.
- [ ] Migrations and SQL RLS tests executed in staging.
- [ ] EAS project, identifiers, signing, and development builds configured.
- [ ] Android and iOS physical-device Auth QA complete.
- [ ] RevenueCat sandbox lifecycle and webhook replay complete.
- [ ] AdMob UMP and test-ad QA complete.
- [ ] Twelve moderate dependency findings reviewed and accepted or remediated.
- [ ] Legal, privacy, support, and store review complete.

Production native release is **NO-GO**. Web production deployment is outside
this branch and must follow a separate preview and approval process.
