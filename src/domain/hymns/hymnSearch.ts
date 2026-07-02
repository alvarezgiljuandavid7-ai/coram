import type { Hymn } from './types';

export function hymnText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function hymnSearchHaystack(hymn: Hymn): string[] {
  return [hymnText(hymn.title), hymnText(hymn.hymnalName), hymnText(hymn.lyrics), String(hymn.number ?? '')];
}

export function filterHymns(hymns: Hymn[], query: string): Hymn[] {
  const term = query.trim().toLowerCase();
  if (!term) return hymns;

  return hymns.filter((hymn) => hymnSearchHaystack(hymn).some((value) => value.toLowerCase().includes(term)));
}

export function getHymnLyrics(hymn: Hymn | null): string {
  const lyrics = hymnText(hymn?.lyrics).trim();
  return lyrics || 'Letra no disponible todavia para este himno.';
}
