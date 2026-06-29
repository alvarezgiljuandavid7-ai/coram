import { describe, expect, it } from 'vitest';
import { isAllowedAdmin } from './adminAccess';
import type { CoramAuthProfile } from './authRepository';

const baseProfile: CoramAuthProfile = {
  id: 'user-1',
  email: 'alvarezgiljuandavid7@gmail.com',
  fullName: 'Juan David',
  avatarUrl: null,
  authProvider: 'email',
  isPremium: false,
  role: 'admin',
};

describe('isAllowedAdmin', () => {
  it('allows any profile with the admin role from Supabase', () => {
    expect(isAllowedAdmin(baseProfile)).toBe(true);
    expect(isAllowedAdmin({ ...baseProfile, email: 'admin-real@example.com' })).toBe(true);
  });

  it('rejects member users even if they open the admin URL', () => {
    expect(isAllowedAdmin({ ...baseProfile, role: 'member' })).toBe(false);
  });

  it('rejects premium users even if their email is in the previous fallback list', () => {
    expect(isAllowedAdmin({ ...baseProfile, role: 'premium' })).toBe(false);
  });
});
