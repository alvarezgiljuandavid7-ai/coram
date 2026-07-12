import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('AppShellV2 structure', () => {
  it('owns the global user chrome in one shared shell', () => {
    expect(existsSync(join(process.cwd(), 'src/layouts/app-shell/AppShellV2.tsx'))).toBe(true);

    const shell = source('src/layouts/app-shell/AppShellV2.tsx');
    expect(shell).toContain('CoramTopbar');
    expect(shell).toContain('DesktopNavigation');
    expect(shell).toContain('MobileNavigationDrawer');
    expect(shell).toContain('MobileBottomNavigation');
  });

  it('keeps approved Home and Corarios content free of duplicate global chrome', () => {
    const home = source('src/pages/app/AppInicioPage.tsx');
    const corarios = source('src/pages/app/corarios/CorariosScreenV2.tsx');

    expect(home).not.toContain('env(safe-area-inset-bottom)');
    expect(corarios).not.toContain('<header');
    expect(corarios).not.toContain('CorariosBottomNavigation');
  });

  it('delegates the router-facing AppLayout to AppShellV2', () => {
    const layout = source('src/layouts/AppLayout.tsx');

    expect(layout).toContain('AppShellV2');
    expect(layout).not.toContain('PremiumSidebar');
    expect(layout).not.toContain('PremiumBottomNav');
  });

  it('uses the approved light editorial navigation rail instead of the legacy navy and gold sidebar', () => {
    const navigation = source('src/layouts/app-shell/DesktopNavigation.tsx');

    expect(navigation).not.toContain('bg-[#061326]');
    expect(navigation).not.toContain('from-[#E4BA56]');
    expect(navigation).toContain('styles.navigationRail');
  });
});
