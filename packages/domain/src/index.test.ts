import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  contentStatuses,
  isCoramRole,
  type ContentStatus,
  type CoramRole,
} from './index';

describe('@coram/domain', () => {
  it('exposes the canonical content lifecycle', () => {
    expect(contentStatuses).toEqual(['draft', 'published', 'archived']);
    expectTypeOf<ContentStatus>().toEqualTypeOf<'draft' | 'published' | 'archived'>();
  });

  it('recognizes only supported application roles', () => {
    expect(isCoramRole('admin')).toBe(true);
    expect(isCoramRole('premium')).toBe(true);
    expect(isCoramRole('member')).toBe(true);
    expect(isCoramRole('guest')).toBe(false);
    expectTypeOf<CoramRole>().toEqualTypeOf<'admin' | 'premium' | 'member'>();
  });
});
