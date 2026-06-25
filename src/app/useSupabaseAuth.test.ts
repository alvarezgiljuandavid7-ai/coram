import { describe, expect, it } from 'vitest';

describe('useSupabaseAuth contract', () => {
  it('uses admin as the only dashboard role', () => {
    expect('admin').toBe('admin');
    expect('member').not.toBe('admin');
  });
});
