# Expo dependency risk acceptance

Date: 2026-07-20

## Scope and status

- Expo: `57.0.7`
- React Native: `0.86.0`
- Status: **ACEPTACIÓN TEMPORAL — NO APROBADO PARA PRODUCCIÓN NATIVA**

This acceptance applies only to the Expo native foundation in PR #1. It does not
approve an EAS production build, a store release, or the introduction of protected
production data.

## Audit performed

The clean workspace was installed with `npm ci`, then audited with:

```text
NODE_OPTIONS=--use-system-ca npm audit --omit=dev
NODE_OPTIONS=--use-system-ca npm audit --omit=dev --json
npx expo install --check
npx expo-doctor@latest .
```

The system CA option uses the Windows certificate store; TLS verification remained
enabled.

Exact severity result:

- 11 moderate vulnerabilities
- 0 high vulnerabilities
- 0 critical vulnerabilities

`npx expo install --check` reported that dependencies are up to date. Expo Doctor
passed 20/20 checks.

## Reported packages and dependency paths

The underlying advisory is `GHSA-w5hq-g745-h8pq`: `uuid` versions below `11.1.1`
do not validate buffer boundaries for v3, v5, and v6 UUID operations when callers
provide a buffer.

The audit reported these packages:

- `uuid` through `xcode`
- `xcode` through `@expo/config-plugins`
- `@expo/config-plugins`
- `@expo/config`
- `@expo/prebuild-config`
- `@expo/metro-config`
- `@expo/inline-modules`
- `@expo/local-build-cache-provider`
- `@expo/cli`
- direct dependency `expo`, through the Expo tooling packages above
- direct dependency `expo-splash-screen`, through `@expo/config-plugins`

These paths belong to Expo configuration, prebuild, Metro, CLI, and native project
tooling. The vulnerable UUID operation is not imported by CorAM application runtime
code. It remains a supply-chain and build-tooling risk and is not being dismissed.

## Why no forced remediation was applied

`npm audit fix --force` proposes installing `expo@46.0.21`, a breaking downgrade
that is incompatible with the SDK 57 foundation. No unsafe override, forced fix,
major automatic update, or Expo downgrade was applied. The official Expo dependency
check offered no compatible package changes at the time of this audit.

## Current mitigations

- Native production release remains blocked.
- EAS Build was not executed.
- Expo Doctor passes 20/20 checks.
- Dependencies are installed from the committed lockfile with `npm ci`.
- Signing credentials, service-role credentials, store files, and local environment
  files are excluded from version control.
- The full PR history was scanned and contained no secrets at review time.
- Forced dependency remediation is prohibited until Expo provides a compatible path.

## Mandatory review triggers

Review and either resolve or explicitly renew this acceptance:

1. Before the first production EAS Build.
2. When upgrading Expo SDK.
3. When a compatible resolution becomes available.
4. Immediately if any related vulnerability becomes high or critical.

Until one of those reviews closes the finding, native production remains **NO-GO**.
