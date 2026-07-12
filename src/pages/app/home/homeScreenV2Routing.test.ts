import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('HomeScreenV2 routing', () => {
  it('renders the approved HomeScreenV2 at /app/inicio instead of the legacy home sections', () => {
    expect(existsSync(join(process.cwd(), 'src/pages/app/home/HomeScreenV2.tsx'))).toBe(true);

    const inicioPage = source('src/pages/app/AppInicioPage.tsx');
    expect(inicioPage).toContain('HomeScreenV2');
    expect(inicioPage).not.toContain('HomeHeroPremium');
    expect(inicioPage).not.toContain('Adora. Aprende. Sirve.');
  });

  it('keeps /app as the alias for /app/inicio and gives Inicio the V2 canvas', () => {
    const router = source('src/routes/AppRouter.tsx');
    const navigation = source('src/layouts/app-shell/appNavigation.ts');

    expect(router).toContain('<Route index element={<AppHomePage />} />');
    expect(router).toContain('<Route path="inicio" element={<AppInicioPage />} />');
    expect(source('src/pages/app/AppHomePage.tsx')).toContain('Navigate to="/app/inicio"');
    expect(navigation).toMatch(/id: 'inicio',[\s\S]*?container: 'edge-to-edge'/);
  });
});
