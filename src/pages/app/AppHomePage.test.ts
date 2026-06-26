import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('AppHomePage mobile shell', () => {
  const source = readFileSync(join(process.cwd(), 'src/pages/app/AppHomePage.tsx'), 'utf8');

  it('renders the real app shell directly instead of a desktop phone preview', () => {
    expect(source).toContain('immersive');
    expect(source).not.toContain('Tu aplicacion ministerial');
    expect(source).not.toContain('hidden min-h-[calc(100vh-120px)]');
    expect(source).not.toContain('rounded-3xl border border-slate-200');
  });
});
