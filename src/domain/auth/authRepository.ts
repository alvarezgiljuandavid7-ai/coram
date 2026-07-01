import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../shared/supabase/client';

export interface CoramAuthProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  authProvider: string;
  isPremium: boolean;
  role: 'admin' | 'premium' | 'member';
}

export interface CoramSession {
  session: Session | null;
  user: User | null;
  profile: CoramAuthProfile | null;
  role: string;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  is_premium: boolean;
  role: 'admin' | 'premium' | 'member' | null;
}

const configuredPublicAppUrl = (import.meta.env.VITE_CORAM_PUBLIC_URL as string | undefined)?.trim();
export const appleOAuthEnabled = (import.meta.env.VITE_CORAM_ENABLE_APPLE_AUTH as string | undefined) === 'true';

export function buildAuthRedirectUrl(
  path: string,
  currentOrigin = window.location.origin,
  configuredOrigin = configuredPublicAppUrl,
): string {
  const origin = (configuredOrigin || currentOrigin).replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${origin}${normalizedPath}`;
}

function normalizeRole(role: string | null | undefined): 'admin' | 'premium' | 'member' {
  return role === 'admin' || role === 'premium' || role === 'member' ? role : 'member';
}

function mapProfile(row: ProfileRow): CoramAuthProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    authProvider: row.auth_provider,
    isPremium: row.is_premium,
    role: normalizeRole(row.role),
  };
}

export async function getCurrentCoramSession(): Promise<CoramSession> {
  if (!supabase) {
    return { session: null, user: null, profile: null, role: 'guest' };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    return { session: null, user: null, profile: null, role: 'guest' };
  }

  const user = sessionData.session.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, auth_provider, is_premium, role')
    .eq('id', user.id)
    .maybeSingle();

  const mappedProfile = profile ? mapProfile(profile as ProfileRow) : null;

  return {
    session: sessionData.session,
    user,
    profile: mappedProfile,
    role: mappedProfile?.role ?? 'member',
  };
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: buildAuthRedirectUrl('/login'),
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;

  if (data.url) {
    window.location.assign(data.url);
  }
}

export async function signInWithApple(): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no esta configurado.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: buildAuthRedirectUrl('/login'),
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data.url) {
    window.location.assign(data.url);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: buildAuthRedirectUrl('/login'),
    },
  });

  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: buildAuthRedirectUrl('/login'),
  });

  if (error) throw error;
}

export async function updateCurrentPassword(password: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase no está configurado.');
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) throw error;
}
