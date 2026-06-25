import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { fetchManantialHymns } from '../domain/hymns/hymnsRepository';
import type { Hymn } from '../domain/hymns/types';
import { fetchMentorships } from '../domain/mentorships/mentorshipsRepository';
import type { MentorshipSession, MonetizationToolSetting } from '../types';
import { defaultMonetizationSettings } from './initialCoramState';
import { useCoramAppState } from './useCoramAppState';
import { useSupabaseAuth, type CoramAuthState } from './useSupabaseAuth';

type CoramState = ReturnType<typeof useCoramAppState>;

interface CoramAppContextValue {
  state: CoramState;
  auth: CoramAuthState;
  hymns: Hymn[];
  hymnsLoading: boolean;
  hymnsError: string | null;
  monetizationSettings: MonetizationToolSetting[];
  setMonetizationSettings: Dispatch<SetStateAction<MonetizationToolSetting[]>>;
  mentorships: MentorshipSession[];
}

const CoramAppContext = createContext<CoramAppContextValue | null>(null);

interface CoramAppProviderProps {
  children: ReactNode;
}

export function CoramAppProvider({ children }: CoramAppProviderProps) {
  const state = useCoramAppState();
  const auth = useSupabaseAuth();
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [hymnsLoading, setHymnsLoading] = useState(true);
  const [hymnsError, setHymnsError] = useState<string | null>(null);
  const [mentorships, setMentorships] = useState<MentorshipSession[]>([]);
  const [monetizationSettings, setMonetizationSettings] = useState<MonetizationToolSetting[]>(
    defaultMonetizationSettings,
  );

  useEffect(() => {
    if (!auth.profile) return;

    state.setProfile((current) => ({
      ...current,
      name: auth.profile?.fullName || auth.profile?.email || current.name,
      email: auth.profile?.email || current.email,
      avatarUrl: auth.profile?.avatarUrl || current.avatarUrl,
      authProvider: auth.profile?.authProvider === 'google' ? 'Google' : 'Email',
      isPremium: auth.profile?.role === 'premium' || auth.profile?.isPremium || current.isPremium,
    }));
  }, [auth.profile]);

  useEffect(() => {
    let isMounted = true;
    setHymnsLoading(true);

    fetchManantialHymns()
      .then((result) => {
        if (!isMounted) return;
        setHymns(result.hymns);
        setHymnsError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setHymnsError('No se pudo cargar el himnario desde Supabase.');
      })
      .finally(() => {
        if (isMounted) setHymnsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchMentorships()
      .then((result) => {
        if (isMounted) setMentorships(result);
      })
      .catch((error) => {
        console.error('Unable to load Supabase mentorships', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<CoramAppContextValue>(
    () => ({
      state,
      auth,
      hymns,
      hymnsLoading,
      hymnsError,
      monetizationSettings,
      setMonetizationSettings,
      mentorships,
    }),
    [state, auth, hymns, hymnsLoading, hymnsError, monetizationSettings, mentorships],
  );

  return <CoramAppContext.Provider value={value}>{children}</CoramAppContext.Provider>;
}

export function useCoramApp() {
  const context = useContext(CoramAppContext);
  if (!context) {
    throw new Error('useCoramApp must be used inside CoramAppProvider.');
  }
  return context;
}
