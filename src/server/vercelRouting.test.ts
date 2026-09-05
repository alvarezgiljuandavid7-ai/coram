import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import vercelConfig from '../../vercel.json';

describe('Vercel routing', () => {
  it('keeps serverless API routes outside the SPA fallback', () => {
    const spaFallback = vercelConfig.rewrites.at(-1);

    expect(spaFallback).toEqual({
      source: '/((?!api(?:/|$)).*)',
      destination: '/index.html',
    });
  });

  it('uses an ESM-resolvable import in the affiliate function', () => {
    const source = readFileSync('api/affiliate/course/[id].ts', 'utf8');

    expect(source).toContain("from '../../../src/server/affiliate/redirectPolicy.js'");
  });
});
