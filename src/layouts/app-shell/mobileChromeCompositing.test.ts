import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('mobile Chrome compositing', () => {
  it('keeps fixed mobile chrome opaque instead of using backdrop blur while content scrolls', () => {
    const topbar = source('src/layouts/app-shell/CoramTopbar.tsx');
    const bottomNavigation = source('src/layouts/app-shell/MobileBottomNavigation.tsx');

    expect(topbar).toContain('lg:backdrop-blur-xl');
    expect(topbar).not.toContain('bg-[#fffdf8]/92 backdrop-blur-xl');
    expect(bottomNavigation).not.toContain('backdrop-blur-xl');
    expect(bottomNavigation).toContain('bg-[#fffdf8]');
  });
});
