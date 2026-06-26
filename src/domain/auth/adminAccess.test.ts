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
  it('allows only the configured admin email with admin role', () => {
    expect(isAllowedAdmin(baseProfile, null)).toBe(true);
  });

  it('rejects member users even if they open the admin URL', () => {
    expect(isAllowedAdmin({ ...baseProfile, role: 'member' }, null)).toBe(false);
  });

  it('rejects admin role on a non-admin email', () => {
    expect(isAllowedAdmin({ ...baseProfile, email: 'usuario@example.com' }, null)).toBe(false);
  });
});
