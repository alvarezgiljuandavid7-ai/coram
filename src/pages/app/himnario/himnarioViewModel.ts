import type { Hymn } from '../../../domain/hymns/types';
import { filterHymns } from '../../../domain/hymns/hymnSearch';

export interface HimnarioFilters {
  query: string;
  key: string;
  onlyFavorites: boolean;
}

export const HYMN_RENDER_BATCH_SIZE = 30;

export function getNextHymnRenderCount(currentCount: number, totalCount: number) {
  return Math.min(Math.max(totalCount, 0), Math.max(currentCount, 0) + HYMN_RENDER_BATCH_SIZE);
}

export function buildHimnarioViewModel(
  hymns: Hymn[],
  favoriteIds: ReadonlySet<string>,
  filters: HimnarioFilters,
) {
  const items = filterHymns(hymns, filters.query).filter((hymn) => {
    const matchesKey = filters.key === 'Todos' || hymn.key === filters.key;
    const matchesFavorite = !filters.onlyFavorites || favoriteIds.has(hymn.id);
    return matchesKey && matchesFavorite;
  });

  return {
    items,
    keys: ['Todos', ...Array.from(new Set(hymns.map((hymn) => hymn.key).filter(Boolean)))],
    metrics: {
      available: hymns.length,
      favorites: hymns.filter((hymn) => favoriteIds.has(hymn.id)).length,
      results: items.length,
    },
  };
}
