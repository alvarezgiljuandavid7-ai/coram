import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');

const mojibakePatterns = [
  /\u00c3./,
  /\u00c2./,
  /\u00e2[^\w\s]?/,
  /\u00f0\u0178/,
  /\ufffd/,
];

function collectTextFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const absolutePath = path.join(dir, entry);
    const stat = statSync(absolutePath);

    if (stat.isDirectory()) {
      return collectTextFiles(absolutePath);
    }

    return /\.(ts|tsx|css|html|json|md)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry) ? [absolutePath] : [];
  });
}

describe('release readiness', () => {
  it('keeps production source free of mojibake text', () => {
    const offenders = collectTextFiles(srcRoot).flatMap((filePath) => {
      const content = readFileSync(filePath, 'utf8');
      return mojibakePatterns.some((pattern) => pattern.test(content))
        ? [path.relative(projectRoot, filePath)]
        : [];
    });

    expect(offenders).toEqual([]);
  });

  it('has the mobile and web launch files required for store packaging', () => {
    const requiredFiles = [
      'vercel.json',
      'capacitor.config.ts',
      'public/manifest.webmanifest',
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/maskable-icon-512.png',
      'public/splash.svg',
    ];

    expect(requiredFiles.filter((filePath) => !existsSync(path.join(projectRoot, filePath)))).toEqual([]);
  });
});
