import { describe, expect, it } from 'vitest';
import { mapAuthenticatedProfile, preserveAccountState, shouldRedirectFromLogin } from './authSessionState';

describe('auth session state', () => {
  it('keeps password recovery on the login screen even with an authenticated recovery session', () => {
    expect(shouldRedirectFromLogin({ loading: false, hasUser: true, recoveryMode: true })).toBe(false);
    expect(shouldRedirectFromLogin({ loading: false, hasUser: true, recoveryMode: false })).toBe(true);
  });

  it('does not inherit private profile fields when switching accounts', () => {
    expect(
      mapAuthenticatedProfile({
        email: 'new@icloud.com',
        fullName: null,
        avatarUrl: null,
        authProvider: 'email',
        role: 'member',
        isPremium: false,
      }),
    ).toEqual({
      name: 'new@icloud.com',
      email: 'new@icloud.com',
      avatarUrl: '',
      authProvider: 'Email',
      isPremium: false,
      favoriteCorarios: [],
      enrolledCourses: [],
    });
  });

  it('can preserve in-session progress during a token refresh for the same account', () => {
    const mapped = mapAuthenticatedProfile(
      {
        email: 'member@coram.test',
        fullName: 'Miembro',
        avatarUrl: null,
        authProvider: 'email',
        role: 'member',
        isPremium: false,
      },
      { favoriteCorarios: ['cor-1'], enrolledCourses: ['course-1'] },
    );

    expect(mapped.favoriteCorarios).toEqual(['cor-1']);
    expect(mapped.enrolledCourses).toEqual(['course-1']);
  });

  it('preserves progress only when the refreshed session belongs to the same account', () => {
    const currentProfile = {
      name: 'Miembro',
      email: 'member@coram.test',
      avatarUrl: '',
      authProvider: 'Email' as const,
      isPremium: false,
      favoriteCorarios: ['cor-1'],
      enrolledCourses: ['course-1'],
    };

    expect(preserveAccountState('user-1', 'user-1', currentProfile)).toEqual({
      favoriteCorarios: ['cor-1'],
      enrolledCourses: ['course-1'],
    });
    expect(preserveAccountState('user-1', 'user-2', currentProfile)).toBeUndefined();
  });
});
