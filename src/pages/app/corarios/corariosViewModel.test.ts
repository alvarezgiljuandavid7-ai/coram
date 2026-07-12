import { describe, expect, it } from 'vitest';
import { buildCorariosViewModel } from './corariosViewModel';

describe('buildCorariosViewModel', () => {
  it('filters published Corarios by real query, category and tone while deriving live metrics', () => {
    const result = buildCorariosViewModel(
      [
        {
          id: 'cor-1',
          title: 'Luz eterna',
          category: 'Adoracion',
          lyrics: 'Tu luz me guia',
          key: 'C',
        },
        {
          id: 'cor-2',
          title: 'Camino fiel',
          category: 'Alabanza',
          lyrics: 'Tu camino es eterno',
          key: 'D',
        },
      ],
      new Set(['cor-1']),
      { query: 'luz', category: 'Todos', key: 'C' },
    );

    expect(result.items.map((item) => item.id)).toEqual(['cor-1']);
    expect(result.categories).toEqual(['Todos', 'Adoracion', 'Alabanza']);
    expect(result.keys).toEqual(['Todos', 'C', 'D']);
    expect(result.metrics).toEqual({ available: 2, favorites: 1, results: 1 });
  });

  it('returns an empty real result set without changing the available or favorite counts', () => {
    const result = buildCorariosViewModel(
      [
        {
          id: 'cor-1',
          title: 'Luz eterna',
          category: 'Adoracion',
          lyrics: 'Tu luz me guia',
          key: 'C',
        },
      ],
      new Set(['cor-1']),
      { query: 'inexistente', category: 'Todos', key: 'Todos' },
    );

    expect(result.items).toEqual([]);
    expect(result.metrics).toEqual({ available: 1, favorites: 1, results: 0 });
  });
});
