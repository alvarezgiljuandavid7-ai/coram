import { useEffect, useState } from 'react';
import { fetchManantialHymns } from '../../../domain/hymns/hymnsRepository';
import type { Hymn } from '../../../domain/hymns/types';

export const himnarioScreens = ['himnarios'] as const;

interface UseHimnarioModuleOptions {
  demoRuntimeEnabled: boolean;
  demoHymns: Hymn[];
}

export function useHimnarioModule({ demoRuntimeEnabled, demoHymns }: UseHimnarioModuleOptions) {
  const [selectedHymnalFilter, setSelectedHymnalFilter] = useState<string>('todos');
  const [hymnSearchQuery, setHymnSearchQuery] = useState<string>('');
  const [hymnsData, setHymnsData] = useState<Hymn[]>(demoRuntimeEnabled ? demoHymns : []);
  const [hymnCollections, setHymnCollections] = useState<{ id: string; label: string }[]>([
    { id: 'himnario-manantial-de-inspiracion', label: 'Manantial de Inspiracion' },
  ]);
  const [hymnsLoading, setHymnsLoading] = useState<boolean>(false);
  const [hymnsError, setHymnsError] = useState<string | null>(null);
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [hymnTranspose, setHymnTranspose] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    const loadHymns = async () => {
      setHymnsLoading(true);
      setHymnsError(null);

      try {
        const result = await fetchManantialHymns();
        if (ignore) return;

        if (result.hymns.length > 0) {
          setHymnsData(result.hymns);
          setHymnCollections([{ id: result.collection.hymnal, label: result.collection.name }]);
          setSelectedHymnalFilter(result.collection.hymnal);
        }
      } catch (error) {
        if (!ignore) {
          console.error('Unable to load Supabase hymns', error);
          setHymnsError(
            demoRuntimeEnabled
              ? 'Mostrando himnos locales de demo. No se pudo conectar con Supabase.'
              : 'No se pudo cargar el himnario desde Supabase.',
          );
        }
      } finally {
        if (!ignore) {
          setHymnsLoading(false);
        }
      }
    };

    void loadHymns();

    return () => {
      ignore = true;
    };
  }, [demoRuntimeEnabled]);

  return {
    selectedHymnalFilter,
    setSelectedHymnalFilter,
    hymnSearchQuery,
    setHymnSearchQuery,
    hymnsData,
    hymnCollections,
    hymnsLoading,
    hymnsError,
    selectedHymn,
    setSelectedHymn,
    hymnTranspose,
    setHymnTranspose,
  };
}
