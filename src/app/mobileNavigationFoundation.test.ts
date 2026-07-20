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

const foundationFiles = [
  'mobile/src/components/FoundationScreen.tsx',
  'mobile/src/components/FoundationScreen.styles.ts',
  'mobile/src/theme/coramTheme.ts',
];

const source = (path: string) => readFileSync(path, 'utf8');

describe('CorAM native navigation foundation', () => {
  it('creates isolated root, auth and app route groups', () => {
    for (const path of [...requiredRoutes, ...foundationFiles]) {
      expect(existsSync(path), path).toBe(true);
    }
  });

  it('uses Expo Router as the only mobile entry point', () => {
    const packageJson = JSON.parse(source('mobile/package.json')) as { main?: string };

    expect(packageJson.main).toBe('expo-router/entry');
    expect(existsSync('mobile/App.tsx')).toBe(false);
    expect(existsSync('mobile/index.ts')).toBe(false);
  });

  it('supports scrolling and accessible heading navigation', () => {
    const component = source('mobile/src/components/FoundationScreen.tsx');

    expect(component).toMatch(/import \{[^}]*ScrollView[^}]*\} from 'react-native'/);
    expect(component).toContain('<ScrollView');
    expect(component).toContain('contentContainerStyle={styles.screen}');
    expect(component).toMatch(/style=\{styles\.title\} accessibilityRole="header"/);
  });

  it('uses high-contrast ink for small text while retaining accent backgrounds', () => {
    const styles = source('mobile/src/components/FoundationScreen.styles.ts');

    expect(styles).toMatch(/eyebrow:\s*\{[^}]*color: coramTheme\.colors\.ink,/);
    expect(styles).toMatch(/statusText:\s*\{[^}]*color: coramTheme\.colors\.ink,/);
    expect(styles).toContain('backgroundColor: coramTheme.colors.botanicalSoft');
  });

  it('is a native shell rather than a web wrapper', () => {
    const nativeSource = [...requiredRoutes, ...foundationFiles]
      .map((path) => source(path))
      .join('\n');

    expect(nativeSource).not.toMatch(/WebView|react-native-webview|https:\/\/coram-two\.vercel\.app/);
    expect(nativeSource).not.toMatch(/@supabase\/supabase-js|service_role/);
  });
});
