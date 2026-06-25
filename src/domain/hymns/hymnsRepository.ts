import { supabase } from '../../shared/supabase/client';
import type { Hymn, HymnalCollection, HymnsRepositoryResult } from './types';

const MANANTIAL_SLUG = 'himnario-manantial-de-inspiracion';

interface HymnRow {
  id: string;
  legacy_id: string | null;
  hymn_number: number | null;
  title: string;
  slug: string;
  original_key: string | null;
  lyrics: string;
  chords: string[] | null;
  hymnal_collections:
    | {
    id: string;
    slug: string;
    name: string;
    description: string | null;
  }
    | {
        id: string;
        slug: string;
        name: string;
        description: string | null;
      }[]
    | null;
}

function mapCollection(row: HymnRow): HymnalCollection {
  const collection = Array.isArray(row.hymnal_collections)
    ? row.hymnal_collections[0]
    : row.hymnal_collections;

  return {
    id: collection?.id ?? MANANTIAL_SLUG,
    slug: collection?.slug ?? MANANTIAL_SLUG,
    name: collection?.name ?? 'Himnario Manantial de Inspiración',
    description: collection?.description ?? null,
    hymnal: collection?.slug ?? MANANTIAL_SLUG,
  };
}

function mapHymn(row: HymnRow): Hymn {
  const collection = mapCollection(row);

  return {
    id: row.legacy_id ?? row.id,
    number: row.hymn_number ?? 0,
    title: row.title,
    hymnal: collection.hymnal,
    hymnalName: collection.name,
    key: row.original_key ?? 'C',
    lyrics: row.lyrics,
    chords: row.chords ?? [],
  };
}

export async function fetchManantialHymns(): Promise<HymnsRepositoryResult> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('hymns')
    .select(
      `
      id,
      legacy_id,
      hymn_number,
      title,
      slug,
      original_key,
      lyrics,
      chords,
      hymnal_collections!inner (
        id,
        slug,
        name,
        description
      )
    `,
    )
    .eq('is_published', true)
    .eq('hymnal_collections.slug', MANANTIAL_SLUG)
    .order('hymn_number', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as HymnRow[];
  const firstCollection = rows[0] ? mapCollection(rows[0]) : {
    id: MANANTIAL_SLUG,
    slug: MANANTIAL_SLUG,
    name: 'Himnario Manantial de Inspiración',
    description: null,
    hymnal: MANANTIAL_SLUG,
  };

  return {
    collection: firstCollection,
    hymns: rows.map(mapHymn),
  };
}
