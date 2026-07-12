import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('CorAM full experience V2', () => {
  it('keeps every user module off the phone simulator', () => {
    const userPages = [
      'src/pages/app/tools/HerramientasPage.tsx',
      'src/pages/app/tools/AfinadorPage.tsx',
      'src/pages/app/tools/PianoPage.tsx',
      'src/pages/app/tools/CalentamientoPage.tsx',
      'src/pages/app/AcademiaPage.tsx',
      'src/pages/app/RecursosPage.tsx',
      'src/pages/app/ColeccionesPage.tsx',
      'src/pages/app/FavoritosPage.tsx',
      'src/pages/app/ProfilePage.tsx',
    ];

    for (const page of userPages) {
      expect(source(page)).not.toContain('PhoneSimulator');
      expect(source(page)).not.toContain('VocalToolsShell');
    }
  });

  it('gives piano and warmup distinct functional screens', () => {
    expect(source('src/pages/app/tools/PianoPage.tsx')).toContain('mode="piano"');
    expect(source('src/pages/app/tools/CalentamientoPage.tsx')).toContain('VocalWarmupV2');
  });

  it('uses the shared V2 experience language across remaining user modules', () => {
    for (const page of [
      'src/pages/app/AcademiaPage.tsx',
      'src/pages/app/RecursosPage.tsx',
      'src/pages/app/ColeccionesPage.tsx',
      'src/pages/app/FavoritosPage.tsx',
      'src/pages/app/ProfilePage.tsx',
    ]) {
      expect(source(page)).toContain('ExperienceCanvas');
    }
  });
});
