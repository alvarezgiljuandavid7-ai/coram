# CorAM Mobile Launch

CorAM now uses Capacitor to package the existing React/Vite app for Android and iOS without rewriting it in Flutter or React Native.

## Local commands

Run these from:

```text
C:\Users\Usuario\Desktop\open desing\coram\app
```

```bash
npm run build
npm run mobile:sync
npm run mobile:android
npm run mobile:ios
```

## Generated platforms

- Android project: `coram/app/android`
- iOS project: `coram/app/ios`
- Shared Capacitor config: `coram/app/capacitor.config.ts`
- Web/PWA manifest: `coram/app/public/manifest.webmanifest`
- Launch icons: `coram/app/public/icons/`
- Splash placeholder: `coram/app/public/splash.svg`

## Android status

Android project generation and Capacitor sync are complete.

The first local Gradle build reached the Android SDK setup step and is blocked until the Android SDK licenses are accepted and the required SDK packages are installed:

- `build-tools;35.0.0`
- `platforms;android-36`

Use Android Studio SDK Manager or run:

```bash
sdkmanager --licenses
```

After accepting licenses, retry:

```bash
cd android
set JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStoreType=Windows-ROOT
gradlew.bat assembleDebug
```

## iOS status

iOS project generation and Capacitor sync are complete.

Building, signing, TestFlight upload, and App Store submission require macOS with Xcode and an Apple Developer account.

## Store checklist

- Confirm final app name: `CorAM`.
- Confirm final bundle IDs:
  - Android/iOS app id currently: `com.coram.app`
- Replace placeholder icons/splash with final store-ready artwork.
- Publish a production web URL for legal pages and OAuth redirects.
- Configure Supabase Auth redirect URLs for web, Android, and iOS.
- Confirm the admin user in Supabase Auth has `app_metadata.role = admin`.
- Implement Stripe payments and webhooks before charging real users.
- Finalize privacy policy, terms, cookies, refunds, and content copyright review.
- Create Google Play Console and Apple Developer listings with screenshots.
