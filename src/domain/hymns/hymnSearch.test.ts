import { describe, expect, it } from 'vitest';
import type { Hymn } from './types';
import { filterHymns, getHymnLyrics } from './hymnSearch';

const baseHymn: Hymn = {
  id: 'hymn-1',
  number: 1,
  title: 'POR FE',
  hymnal: 'manantial',
  hymnalName: 'Himnario Manantial de Inspiracion',
  key: 'C',
  lyrics: 'Por fe cantamos al Senor',
  chords: [],
};

describe('hymn search helpers', () => {
  it('filters hymns without crashing when Supabase returns missing text fields', () => {
    const hymns = [
      { ...baseHymn, id: 'missing-lyrics', title: 'SIN LETRA', lyrics: null },
      { ...baseHymn, id: 'target', title: 'QUIERO ADORARTE', lyrics: undefined },
    ] as unknown as Hymn[];

    expect(filterHymns(hymns, 'adorarte')).toEqual([hymns[1]]);
    expect(filterHymns(hymns, 'texto ausente')).toEqual([]);
  });

  it('returns a clear fallback when the selected hymn has no lyrics yet', () => {
    const hymn = { ...baseHymn, lyrics: '' };

    expect(getHymnLyrics(hymn)).toBe('Letra no disponible todavia para este himno.');
  });
});
