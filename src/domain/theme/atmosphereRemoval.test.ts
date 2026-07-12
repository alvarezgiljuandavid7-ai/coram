import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootPath = (path: string) => join(process.cwd(), path);
const source = (path: string) => readFileSync(rootPath(path), 'utf8');

describe('legacy CorAM atmosphere removal', () => {
  it('removes the time-based atmosphere module', () => {
    expect(existsSync(rootPath('src/domain/theme/adaptiveAtmosphere.ts'))).toBe(false);
  });

  it.each([
    ['src/app/CoramAppContext.tsx', ['adaptiveAtmosphere', 'CoramAtmosphere', 'atmospherePreference', 'setAtmospherePreference', 'coramAtmosphere']],
    ['src/layouts/app-shell/AppShellV2.tsx', ['atmosphere.', 'atmosphere,']],
    ['src/pages/app/AppInicioPage.tsx', ['atmosphere=', 'atmosphereMode=', 'setAtmospherePreference']],
    ['src/pages/app/home/HomeSections.tsx', ['CoramAtmosphere', 'onAtmospherePreference', 'Atmosfera CorAM', "'morning'", "'afternoon'", "'night'"]],
    ['src/pages/app/ProfilePage.tsx', ['setAtmospherePreference', 'atmosphere.label', 'manual-light', 'manual-dark', 'Tu atmosfera CorAM']],
  ])('removes legacy atmosphere references from %s', (path, forbiddenTokens) => {
    const contents = source(path);

    for (const token of forbiddenTokens) {
      expect(contents).not.toContain(token);
    }
  });
});
