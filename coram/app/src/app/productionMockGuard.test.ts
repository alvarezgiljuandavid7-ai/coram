import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const srcRoot = join(process.cwd(), 'src');
const allowedDemoFiles = new Set(['app/demoSeedState.ts', 'data.ts']);

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return listSourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe('production mock guard', () => {
  it('keeps production modules from importing demo seed data', () => {
    const offenders = listSourceFiles(srcRoot)
      .map((path) => ({
        path,
        relativePath: relative(srcRoot, path).replaceAll('\\', '/'),
        source: readFileSync(path, 'utf8'),
      }))
      .filter(({ relativePath }) => !allowedDemoFiles.has(relativePath) && !relativePath.endsWith('.test.ts'))
      .filter(({ source }) => /from ['"]\.\.?\/.*data['"]/.test(source))
      .map(({ relativePath }) => relativePath);

    expect(offenders).toEqual([]);
  });
});
