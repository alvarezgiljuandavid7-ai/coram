import type { CoramAuthProfile } from './authRepository';

export function isAllowedAdmin(profile: CoramAuthProfile | null): boolean {
  return profile?.role === 'admin';
}
