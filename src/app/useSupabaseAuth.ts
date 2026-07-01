import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../shared/supabase/client';
import {
  getCurrentCoramSession,
  appleOAuthEnabled,
  sendPasswordReset,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOut as signOutFromSupabase,
  signUpWithEmail,
  updateCurrentPassword,
  type CoramAuthProfile,
} from '../domain/auth/authRepository';
import type { User } from '@supabase/supabase-js';
import { isAllowedAdmin } from '../domain/auth/adminAccess';

export interface CoramAuthState {
  loading: boolean;
  recoveryMode: boolean;
  user: User | null;
  profile: CoramAuthProfile | null;
  role: string;
  isAdmin: boolean;
  appleOAuthEnabled: boolean;
  refresh: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateCurrentPassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSupabaseAuth(): CoramAuthState {
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CoramAuthProfile | null>(null);
  const [role, setRole] = useState('guest');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const session = await getCurrentCoramSession();
      setUser(session.user);
      setProfile(session.profile);
      setRole(session.role);
    } catch (error) {
      console.error('Unable to refresh Supabase auth session', error);
      setUser(null);
      setProfile(null);
      setRole('guest');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutFromSupabase();
    } finally {
      setRecoveryMode(false);
      setUser(null);
      setProfile(null);
      setRole('guest');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (!supabase) return undefined;

    const { data } = supabase.auth.onAuthStateChange((event) => {
      setRecoveryMode(event === 'PASSWORD_RECOVERY');
      void refresh();
    });

    return () => data.subscription.unsubscribe();
  }, [refresh]);

  return {
    loading,
    recoveryMode,
    user,
    profile,
    role,
    isAdmin: isAllowedAdmin(profile),
    appleOAuthEnabled,
    refresh,
    signInWithApple,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    updateCurrentPassword,
    signOut: handleSignOut,
  };
}
