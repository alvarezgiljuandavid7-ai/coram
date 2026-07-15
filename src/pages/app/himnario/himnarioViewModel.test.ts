import { describe, expect, it } from 'vitest';
import type { Hymn } from '../../../domain/hymns/types';
import { buildHimnarioViewModel, getNextHymnRenderCount } from './himnarioViewModel';

const hymns: Hymn[] = [
  {
    id: 'hymn-1',
    number: 1,
    title: 'Santo por siempre',
    hymnal: 'manantial',
    hymnalName: 'Himnario Manantial',
    key: 'C',
    lyrics: 'Cantamos santo al Senor',
    chords: [],
  },
  {
    id: 'hymn-2',
    number: 2,
    title: 'Gracia eterna',
    hymnal: 'manantial',
    hymnalName: 'Himnario Manantial',
    key: 'D',
    lyrics: 'Tu gracia permanece',
    chords: [],
  },
];

describe('buildHimnarioViewModel', () => {
  it('derives live filters and metrics from real hymn data', () => {
    const result = buildHimnarioViewModel(hymns, new Set(['hymn-1']), {
      query: 'santo',
      key: 'C',
      onlyFavorites: false,
    });

    expect(result.items.map((hymn) => hymn.id)).toEqual(['hymn-1']);
    expect(result.keys).toEqual(['Todos', 'C', 'D']);
    expect(result.metrics).toEqual({ available: 2, favorites: 1, results: 1 });
  });

  it('combines favorite and tone filters without changing source metrics', () => {
    const result = buildHimnarioViewModel(hymns, new Set(['hymn-1']), {
      query: '',
      key: 'D',
      onlyFavorites: true,
    });

    expect(result.items).toEqual([]);
    expect(result.metrics).toEqual({ available: 2, favorites: 1, results: 0 });
  });

  it('reveals hymns in bounded batches instead of mounting the entire catalogue', () => {
    expect(getNextHymnRenderCount(0, 272)).toBe(30);
    expect(getNextHymnRenderCount(30, 272)).toBe(60);
    expect(getNextHymnRenderCount(270, 272)).toBe(272);
    expect(getNextHymnRenderCount(272, 272)).toBe(272);
  });
});
