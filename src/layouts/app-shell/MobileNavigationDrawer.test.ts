import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('MobileNavigationDrawer', () => {
  it('uses the typed navigation source while presenting the approved drawer hierarchy', () => {
    const drawer = source('src/layouts/app-shell/MobileNavigationDrawer.tsx');

    expect(drawer).toContain('appNavigationItems');
    expect(drawer).toContain("const principalItems");
    expect(drawer).toContain("const libraryItems");
    expect(drawer).toContain("const accountItems");
    expect(drawer).toContain('Principal');
    expect(drawer).toContain('Biblioteca personal');
    expect(drawer).toContain('Cuenta');
    expect(drawer).toContain('useCoramApp');
    expect(drawer).toContain('styles.drawerSurface');
    expect(drawer).not.toContain('bg-[#061326]');
  });

  it('keeps the existing accessible close contract and safe-area support', () => {
    const drawer = source('src/layouts/app-shell/MobileNavigationDrawer.tsx');

    expect(drawer).toContain('aria-label="Cerrar menu de CorAM"');
    expect(drawer).toContain('aria-modal="true"');
    expect(drawer).toContain('env(safe-area-inset-top)');
    expect(drawer).toContain('env(safe-area-inset-bottom)');
    expect(drawer).toContain('onClick={onClose}');
  });
});
