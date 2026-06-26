import type { User } from '@supabase/supabase-js';
import type { CoramAuthProfile } from './authRepository';

const fallbackAdminEmails = ['alvarezgiljuandavid7@gmail.com'];

function configuredAdminEmails(): string[] {
  const configured = (import.meta.env.VITE_CORAM_ADMIN_EMAILS as string | undefined)?.trim();
  if (!configured) return fallbackAdminEmails;

  return configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(profile: CoramAuthProfile | null, user: User | null): boolean {
  const email = (profile?.email || user?.email || '').trim().toLowerCase();
  return profile?.role === 'admin' && configuredAdminEmails().includes(email);
}
