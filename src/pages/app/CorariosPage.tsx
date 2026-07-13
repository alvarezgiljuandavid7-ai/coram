import { useEffect, useMemo, useState } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import { CorariosScreenV2 } from './corarios/CorariosScreenV2';
import { buildCorariosViewModel } from './corarios/corariosViewModel';
import type { Corario } from '../../types';

export function CorariosPage() {
  const { state, favorites, isFavorite, toggleFavorite, recordRecentActivity, corariosLoading, corariosError } = useCoramApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [key, setKey] = useState('Todos');
  const [selected, setSelected] = useState<Corario | null>(null);

  const favoriteIds = useMemo(
    () => new Set(favorites.filter((item) => item.entityType === 'corario').map((item) => item.entityId)),
    [favorites],
  );
  const viewModel = useMemo(
    () => buildCorariosViewModel(state.corarios, favoriteIds, { query, category, key }),
    [category, favoriteIds, key, query, state.corarios],
  );

  const openCorario = (corario: Corario) => {
    setSelected(corario);
    void recordRecentActivity({
      entityType: 'corario',
      entityId: corario.id,
      title: corario.title,
      route: '/app/corarios',
      metadata: { key: corario.key, category: corario.category },
    });
  };

  useEffect(() => {
    if (!selected) return undefined;
    if (!window.matchMedia('(max-width: 1279px)').matches) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  return (
    <CorariosScreenV2
      viewModel={viewModel}
      filters={{ query, category, key }}
      selected={selected}
      loading={corariosLoading}
      error={corariosError}
      isFavorite={(corarioId) => isFavorite('corario', corarioId)}
      onQueryChange={setQuery}
      onCategoryChange={setCategory}
      onKeyChange={setKey}
      onResetFilters={() => {
        setQuery('');
        setCategory('Todos');
        setKey('Todos');
      }}
      onOpenCorario={openCorario}
      onCloseCorario={() => setSelected(null)}
      onToggleFavorite={(corarioId) => void toggleFavorite('corario', corarioId)}
    />
  );
}
