import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../shared/supabase/client';
import {
  getCurrentCoramSession,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut as signOutFromSupabase,
  signUpWithEmail,
  updateCurrentPassword,
  type CoramAuthProfile,
} from '../domain/auth/authRepository';
import type { User } from '@supabase/supabase-js';

export interface CoramAuthState {
  loading: boolean;
  recoveryMode: boolean;
  user: User | null;
  profile: CoramAuthProfile | null;
  role: string;
  isAdmin: boolean;
  refresh: () => Promise<void>;
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
    const session = await getCurrentCoramSession();
    setUser(session.user);
    setProfile(session.profile);
    setRole(session.role);
    setLoading(false);
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
    isAdmin: role === 'admin',
    refresh,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    updateCurrentPassword,
    signOut: handleSignOut,
  };
}
