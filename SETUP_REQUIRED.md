# CorAM native setup required

This branch establishes the Expo SDK 57 foundation only. Complete the items below
in later, separately reviewed deliveries before native preview or store release.

## Required for a native preview build

- Create or select the Expo/EAS project and add `extra.eas.projectId` outside this
  branch's foundation work.
- Choose the final Android application ID and iOS bundle identifier.
- Configure EAS credentials through Expo; never commit signing keys, certificates,
  provisioning profiles, or store credentials.
- Provide public native environment values through EAS environment management:
  `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Keep every Supabase service-role credential server-side and out of mobile builds.
- Test Android on an emulator and physical device. Test iOS on a physical iPhone or
  on a macOS/Xcode simulator before release.

## Supabase, migrations, and RLS

- This branch adds no Supabase migration and changes no RLS policy.
- Native Auth, session persistence, deep links, and repository adapters require a
  dedicated implementation and review.
- Any future migration must be versioned, reversible where practical, and tested
  with separate member and admin identities before deployment.

## Plans and monetization

- Define the final free and paid plan entitlements before adding purchase gates.
- Create RevenueCat sandbox projects, products, offerings, and Apple/Google store
  mappings before subscription implementation. No RevenueCat key is required here.
- Create AdMob test applications and consent flows before advertising work. Do not
  use production ad unit IDs during development.
- Define disclosure, destination validation, and reporting requirements for
  affiliate links and sponsored content before they are enabled.
- Confirm privacy policy, terms, consent, refund, and account deletion requirements
  for every target store and country.

## GO / NO-GO checklist

- [x] Web application behavior preserved.
- [x] Expo SDK 57 workspace, router, safe areas, and shared tokens established.
- [x] Android JavaScript export succeeds.
- [x] Tests, typechecks, web build, and Expo Doctor pass.
- [ ] EAS project and application identifiers configured.
- [ ] Android and iOS device smoke tests completed.
- [ ] Native Supabase Auth and RLS tests completed.
- [ ] RevenueCat sandbox purchases validated, if subscriptions are enabled.
- [ ] AdMob test ads and consent validated, if advertising is enabled.
- [ ] Store privacy, legal, signing, and listing requirements approved.

Native production release remains **NO-GO** until every applicable unchecked item
is completed and reviewed.
