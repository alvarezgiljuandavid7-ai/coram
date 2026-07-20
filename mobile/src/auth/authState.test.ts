import { describe, expect, it } from 'vitest';
import { resolveAuthRoute, toAuthState } from './authState';

describe('mobile auth state', () => {
  it('maps restored sessions to a signed-in state', () => {
    expect(toAuthState({ user: { id: 'user-1' } })).toEqual({
      status: 'signedIn',
      userId: 'user-1',
    });
    expect(toAuthState(null)).toEqual({ status: 'signedOut' });
  });

  it('keeps protected and public routes separated', () => {
    expect(resolveAuthRoute('loading', true)).toBeNull();
    expect(resolveAuthRoute('signedOut', true)).toBe('/(auth)');
    expect(resolveAuthRoute('signedIn', false)).toBe('/(app)');
    expect(resolveAuthRoute('signedIn', true)).toBeNull();
  });
});
