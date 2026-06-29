import type { CoramAuthProfile } from './authRepository';

type CoramRole = CoramAuthProfile['role'] | 'guest' | string;

export function getPostLoginRedirect(role: CoramRole, from?: string): string {
  if (role === 'admin') return '/admin/dashboard';

  if (from?.startsWith('/app')) return from;

  return '/app';
}
