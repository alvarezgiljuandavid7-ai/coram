import { describe, expect, it } from 'vitest';
import vercelConfig from '../../vercel.json';

describe('Vercel routing', () => {
  it('keeps serverless API routes outside the SPA fallback', () => {
    const spaFallback = vercelConfig.rewrites.at(-1);

    expect(spaFallback).toEqual({
      source: '/((?!api(?:/|$)).*)',
      destination: '/index.html',
    });
  });
});
