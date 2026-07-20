import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { AppState, Linking } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { mobileQueryClient } from '../query/queryClient';
import { mobileSupabase, requireMobileSupabase } from './mobileSupabase';
import { toAuthState, type MobileAuthState } from './authState';

type AuthContextValue = MobileAuthState & {
  session: Session | null;
  configurationError: string | null;
  signInWithPassword(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function exchangeCodeFromUrl(url: string) {
  if (!mobileSupabase) return;
  const code = new URL(url).searchParams.get('code');
  if (code) await mobileSupabase.auth.exchangeCodeForSession(code);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<MobileAuthState>({ status: 'loading' });
  const configurationError = mobileSupabase
    ? null
    : 'La conexión segura todavía no está configurada en este build.';

  useEffect(() => {
    const supabase = mobileSupabase;
    if (!supabase) {
      setState({ status: 'signedOut' });
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setState(toAuthState(data.session));
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setState(toAuthState(nextSession));
      if (!nextSession) mobileQueryClient.clear();
    });
    const appStateListener = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    const linkListener = Linking.addEventListener('url', ({ url }) => void exchangeCodeFromUrl(url));
    void Linking.getInitialURL().then((url) => {
      if (url) return exchangeCodeFromUrl(url);
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      appStateListener.remove();
      linkListener.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      session,
      configurationError,
      async signInWithPassword(email, password) {
        const { error } = await requireMobileSupabase().auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signOut() {
        const { error } = await requireMobileSupabase().auth.signOut({ scope: 'local' });
        mobileQueryClient.clear();
        if (error) throw error;
      },
    }),
    [configurationError, session, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useMobileAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useMobileAuth debe usarse dentro de AuthProvider.');
  return value;
}
