import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(process.cwd(), 'src/pages/app/himnario/HimnarioScreenV2.tsx'), 'utf8');

describe('HimnarioScreenV2 mobile search layout', () => {
  it('keeps the result list close to a live search instead of rendering metrics in the way', () => {
    expect(source).toContain("{!filters.query && <section className=\"grid grid-cols-3 overflow-hidden");
    expect(source).toContain("{filters.query ? 'Resultados' : 'Himnos disponibles'}");
  });
});
