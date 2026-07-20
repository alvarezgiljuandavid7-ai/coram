import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const requiredRoutes = [
  'mobile/app/_layout.tsx',
  'mobile/app/index.tsx',
  'mobile/app/(auth)/_layout.tsx',
  'mobile/app/(auth)/index.tsx',
  'mobile/app/(app)/_layout.tsx',
  'mobile/app/(app)/index.tsx',
];

describe('CorAM native navigation foundation', () => {
  it('creates isolated root, auth and app route groups', () => {
    for (const route of requiredRoutes) {
      expect(existsSync(route), route).toBe(true);
    }
  });

  it('is a native shell rather than a web wrapper', () => {
    const source = requiredRoutes
      .map((route) => readFileSync(route, 'utf8'))
      .join('\n');

    expect(source).not.toMatch(/WebView|react-native-webview|https:\/\/coram-two\.vercel\.app/);
    expect(source).not.toMatch(/@supabase\/supabase-js|service_role/);
  });
});
