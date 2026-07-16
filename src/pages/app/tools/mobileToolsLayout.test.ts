import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('mobile tools layout', () => {
  it('keeps the warmup scale contained and compact on phone widths', () => {
    const warmup = source('src/pages/app/tools/VocalWarmupV2.tsx');

    expect(warmup).toContain('grid-cols-9');
    expect(warmup).not.toContain('h-44 w-44');
    expect(warmup).toContain('createReusableAudioContext');
    expect(warmup).toContain('prepareFromUserGesture');
  });

  it('does not duplicate the piano entry in the user tools catalogue', () => {
    const tools = source('src/pages/app/tools/HerramientasPage.tsx');

    expect(tools).not.toContain("title: 'Piano y acordes'");
    expect(tools).not.toContain("to: '/app/herramientas/piano'");
  });
});
