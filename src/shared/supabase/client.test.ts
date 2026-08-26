import { describe, expect, it } from 'vitest';
import { resolveSupabaseBrowserConfig } from './client';

describe('resolveSupabaseBrowserConfig', () => {
  it('does not fall back to another Supabase project when configuration is absent', () => {
    expect(resolveSupabaseBrowserConfig({})).toBeNull();
  });

  it('accepts an explicitly configured public browser client', () => {
    expect(resolveSupabaseBrowserConfig({
      VITE_SUPABASE_URL: 'https://staging.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'public-browser-key',
    })).toEqual({
      url: 'https://staging.supabase.co',
      publishableKey: 'public-browser-key',
    });
  });
});
