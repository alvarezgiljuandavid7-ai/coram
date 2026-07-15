import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCorarios } from '../domain/corarios/corariosRepository';
import { fetchManantialHymns } from '../domain/hymns/hymnsRepository';
import type { Hymn } from '../domain/hymns/types';
import { fetchMentorships } from '../domain/mentorships/mentorshipsRepository';
import { addFavorite, fetchFavorites, removeFavorite } from '../domain/engagement/favoritesRepository';
import { fetchRecentActivity, recordRecentActivity as saveRecentActivity, type RecordRecentActivityInput } from '../domain/engagement/recentActivityRepository';
import { fetchInternalNotifications } from '../domain/engagement/notificationsRepository';
import {
  addCollectionItem,
  createCollection,
  deleteCollection,
  fetchCollections,
  removeCollectionItem,
  reorderCollectionItems,
  updateCollection,
} from '../domain/engagement/collectionsRepository';
import {
  fetchReadingPreferences,
  saveReadingPreferences,
} from '../domain/engagement/readingPreferencesRepository';
import type {
  FavoriteEntityType,
  FavoriteItem,
  InternalNotification,
  MentorshipSession,
  MonetizationToolSetting,
  ReadingPreferences,
  RecentActivityItem,
  UserCollection,
  UserCollectionItem,
} from '../types';
import { defaultMonetizationSettings } from './initialCoramState';
import { clearCoramQueryCache, coramQueryKeys } from './queryClient';
import { useCoramAppState } from './useCoramAppState';
import { useSupabaseAuth, type CoramAuthState } from './useSupabaseAuth';

type CoramState = ReturnType<typeof useCoramAppState>;

interface CoramAppContextValue {
  state: CoramState;
  auth: CoramAuthState;
  hymns: Hymn[];
  hymnsLoading: boolean;
  hymnsError: string | null;
  corariosLoading: boolean;
  corariosError: string | null;
  monetizationSettings: MonetizationToolSetting[];
  setMonetizationSettings: Dispatch<SetStateAction<MonetizationToolSetting[]>>;
  mentorships: MentorshipSession[];
  favorites: FavoriteItem[];
  recentActivity: RecentActivityItem[];
  internalNotifications: InternalNotification[];
  collections: UserCollection[];
  readingPreferences: ReadingPreferences | null;
  isFavorite: (entityType: FavoriteEntityType, entityId: string) => boolean;
  toggleFavorite: (entityType: FavoriteEntityType, entityId: string) => Promise<void>;
  recordRecentActivity: (input: Omit<RecordRecentActivityInput, 'userId'>) => Promise<void>;
  createUserCollection: (name: string, description?: string) => Promise<void>;
  updateUserCollection: (collectionId: string, name: string, description?: string) => Promise<void>;
  deleteUserCollection: (collectionId: string) => Promise<void>;
  addItemToCollection: (collectionId: string, entityType: 'corario' | 'hymn', entityId: string) => Promise<void>;
  removeItemFromCollection: (itemId: string) => Promise<void>;
  reorderUserCollectionItems: (collectionId: string, items: UserCollectionItem[]) => Promise<void>;
  saveUserReadingPreferences: (preferences: Omit<ReadingPreferences, 'userId' | 'updatedAt'>) => Promise<void>;
}

const CoramAppContext = createContext<CoramAppContextValue | null>(null);

interface CoramAppProviderProps {
  children: ReactNode;
}

export function CoramAppProvider({ children }: CoramAppProviderProps) {
  const state = useCoramAppState();
  const auth = useSupabaseAuth();
  const queryClient = useQueryClient();
  const corariosQuery = useQuery({
    queryKey: coramQueryKeys.corarios,
    queryFn: fetchCorarios,
  });
  const hymnsQuery = useQuery({
    queryKey: coramQueryKeys.hymns,
    queryFn: fetchManantialHymns,
  });
  const hymns = hymnsQuery.data?.hymns ?? [];
  const [mentorships, setMentorships] = useState<MentorshipSession[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [internalNotifications, setInternalNotifications] = useState<InternalNotification[]>([]);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [readingPreferences, setReadingPreferences] = useState<ReadingPreferences | null>(null);
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
    if (corariosQuery.data) {
      state.setCorarios(corariosQuery.data);
    }
  }, [corariosQuery.data]);

  useEffect(() => {
    let isMounted = true;

    if (!auth.profile?.id) {
      setFavorites([]);
      setRecentActivity([]);
      setInternalNotifications([]);
      setCollections([]);
      setReadingPreferences(null);
      return () => {
        isMounted = false;
      };
    }

    Promise.all([
      fetchFavorites(auth.profile.id),
      fetchRecentActivity(auth.profile.id),
      fetchInternalNotifications(),
      fetchCollections(auth.profile.id),
      fetchReadingPreferences(auth.profile.id),
    ])
      .then(([nextFavorites, nextRecentActivity, nextNotifications, nextCollections, nextPreferences]) => {
        if (!isMounted) return;
        setFavorites(nextFavorites);
        setRecentActivity(nextRecentActivity);
        setInternalNotifications(nextNotifications);
        setCollections(nextCollections);
        setReadingPreferences(nextPreferences);
      })
      .catch((error) => {
        console.error('Unable to load engagement data from Supabase', error);
      });

    return () => {
      isMounted = false;
    };
  }, [auth.profile?.id]);

  const isFavorite = useCallback(
    (entityType: FavoriteEntityType, entityId: string) =>
      favorites.some((favorite) => favorite.entityType === entityType && favorite.entityId === entityId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (entityType: FavoriteEntityType, entityId: string) => {
      if (!auth.profile?.id) return;

      const alreadyFavorite = favorites.some(
        (favorite) => favorite.entityType === entityType && favorite.entityId === entityId,
      );

      if (alreadyFavorite) {
        setFavorites((current) =>
          current.filter((favorite) => favorite.entityType !== entityType || favorite.entityId !== entityId),
        );
        await removeFavorite(auth.profile.id, entityType, entityId);
        return;
      }

      const created = await addFavorite(auth.profile.id, entityType, entityId);
      setFavorites((current) => [created, ...current]);
    },
    [auth.profile?.id, favorites],
  );

  const recordRecentActivity = useCallback(
    async (input: Omit<RecordRecentActivityInput, 'userId'>) => {
      if (!auth.profile?.id) return;

      const saved = await saveRecentActivity({ ...input, userId: auth.profile.id });
      setRecentActivity((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 12));
    },
    [auth.profile?.id],
  );

  const reloadCollections = useCallback(async () => {
    if (!auth.profile?.id) return;
    setCollections(await fetchCollections(auth.profile.id));
  }, [auth.profile?.id]);

  const createUserCollection = useCallback(
    async (name: string, description = '') => {
      if (!auth.profile?.id) return;
      const created = await createCollection(auth.profile.id, name, description);
      setCollections((current) => [created, ...current]);
    },
    [auth.profile?.id],
  );

  const updateUserCollection = useCallback(async (collectionId: string, name: string, description = '') => {
    await updateCollection(collectionId, name, description);
    await reloadCollections();
  }, [reloadCollections]);

  const deleteUserCollection = useCallback(async (collectionId: string) => {
    await deleteCollection(collectionId);
    setCollections((current) => current.filter((collection) => collection.id !== collectionId));
  }, []);

  const addItemToCollection = useCallback(
    async (collectionId: string, entityType: 'corario' | 'hymn', entityId: string) => {
      const collection = collections.find((item) => item.id === collectionId);
      if (!collection) return;
      await addCollectionItem(collection, entityType, entityId);
      await reloadCollections();
    },
    [collections, reloadCollections],
  );

  const removeItemFromCollection = useCallback(async (itemId: string) => {
    await removeCollectionItem(itemId);
    await reloadCollections();
  }, [reloadCollections]);

  const reorderUserCollectionItems = useCallback(
    async (collectionId: string, items: UserCollectionItem[]) => {
      await reorderCollectionItems(items);
      setCollections((current) =>
        current.map((collection) =>
          collection.id === collectionId
            ? { ...collection, items: items.map((item, index) => ({ ...item, sortOrder: index })) }
            : collection,
        ),
      );
    },
    [],
  );

  const saveUserReadingPreferences = useCallback(
    async (preferences: Omit<ReadingPreferences, 'userId' | 'updatedAt'>) => {
      if (!auth.profile?.id) return;
      const saved = await saveReadingPreferences({
        userId: auth.profile.id,
        updatedAt: new Date().toISOString(),
        ...preferences,
      });
      setReadingPreferences(saved);
    },
    [auth.profile?.id],
  );

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

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
    } finally {
      clearCoramQueryCache(queryClient);
    }
  }, [auth, queryClient]);

  const authWithClearedCache = useMemo<CoramAuthState>(
    () => ({ ...auth, signOut }),
    [auth, signOut],
  );

  const value = useMemo<CoramAppContextValue>(
    () => ({
      state,
      auth: authWithClearedCache,
      hymns,
      hymnsLoading: hymnsQuery.isPending,
      hymnsError: hymnsQuery.isError ? 'No se pudo cargar el himnario. Inténtalo de nuevo.' : null,
      corariosLoading: corariosQuery.isPending,
      corariosError: corariosQuery.isError ? 'No se pudieron cargar los corarios. Inténtalo de nuevo.' : null,
      monetizationSettings,
      setMonetizationSettings,
      mentorships,
      favorites,
      recentActivity,
      internalNotifications,
      collections,
      readingPreferences,
      isFavorite,
      toggleFavorite,
      recordRecentActivity,
      createUserCollection,
      updateUserCollection,
      deleteUserCollection,
      addItemToCollection,
      removeItemFromCollection,
      reorderUserCollectionItems,
      saveUserReadingPreferences,
    }),
    [
      state,
      auth,
      hymns,
      hymnsQuery.isPending,
      hymnsQuery.isError,
      corariosQuery.isPending,
      corariosQuery.isError,
      monetizationSettings,
      mentorships,
      favorites,
      recentActivity,
      internalNotifications,
      collections,
      readingPreferences,
      isFavorite,
      toggleFavorite,
      recordRecentActivity,
      createUserCollection,
      updateUserCollection,
      deleteUserCollection,
      addItemToCollection,
      removeItemFromCollection,
      reorderUserCollectionItems,
      saveUserReadingPreferences,
    ],
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
