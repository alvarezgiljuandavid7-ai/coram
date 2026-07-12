import type { Corario } from '../../../types';

export interface CorariosFilters {
  query: string;
  category: string;
  key: string;
}

export function buildCorariosViewModel(
  corarios: Corario[],
  favoriteIds: ReadonlySet<string>,
  filters: CorariosFilters,
) {
  const query = normalize(filters.query);
  const categories = ['Todos', ...unique(corarios.map((corario) => corario.category))];
  const keys = ['Todos', ...unique(corarios.map((corario) => corario.key))];
  const items = corarios.filter((corario) => {
    const matchesCategory = filters.category === 'Todos' || corario.category === filters.category;
    const matchesKey = filters.key === 'Todos' || corario.key === filters.key;
    const matchesQuery = !query || [corario.title, corario.category, corario.author, corario.lyrics]
      .filter(Boolean)
      .some((value) => normalize(value).includes(query));

    return matchesCategory && matchesKey && matchesQuery;
  });

  return {
    items,
    categories,
    keys,
    metrics: {
      available: corarios.length,
      favorites: corarios.filter((corario) => favoriteIds.has(corario.id)).length,
      results: items.length,
    },
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalize(value: string | undefined) {
  return (value ?? '').trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
