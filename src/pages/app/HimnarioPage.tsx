import { useEffect, useMemo, useState } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import type { Hymn } from '../../domain/hymns/types';
import { HimnarioScreenV2 } from './himnario/HimnarioScreenV2';
import { buildHimnarioViewModel, type HimnarioFilters } from './himnario/himnarioViewModel';

const initialFilters: HimnarioFilters = { query: '', key: 'Todos', onlyFavorites: false };

export function HimnarioPage() {
  const { hymns, hymnsLoading, hymnsError, isFavorite, toggleFavorite, recordRecentActivity } = useCoramApp();
  const [filters, setFilters] = useState<HimnarioFilters>(initialFilters);
  const [selected, setSelected] = useState<Hymn | null>(null);
  const favoriteIds = useMemo(
    () => new Set(hymns.filter((hymn) => isFavorite('hymn', hymn.id)).map((hymn) => hymn.id)),
    [hymns, isFavorite],
  );
  const viewModel = useMemo(() => buildHimnarioViewModel(hymns, favoriteIds, filters), [favoriteIds, filters, hymns]);

  const openHymn = (hymn: Hymn) => {
    setSelected(hymn);
    void recordRecentActivity({
      entityType: 'hymn',
      entityId: hymn.id,
      title: hymn.title,
      route: '/app/himnario',
      metadata: { number: hymn.number, hymnalName: hymn.hymnalName },
    });
  };

  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  return (
    <HimnarioScreenV2
      viewModel={viewModel}
      filters={filters}
      selected={selected}
      loading={hymnsLoading}
      error={hymnsError}
      isFavorite={(hymnId) => isFavorite('hymn', hymnId)}
      onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
      onKeyChange={(key) => setFilters((current) => ({ ...current, key }))}
      onToggleOnlyFavorites={() => setFilters((current) => ({ ...current, onlyFavorites: !current.onlyFavorites }))}
      onResetFilters={() => setFilters(initialFilters)}
      onOpenHymn={openHymn}
      onCloseHymn={() => setSelected(null)}
      onToggleFavorite={(hymnId) => void toggleFavorite('hymn', hymnId)}
    />
  );
}
