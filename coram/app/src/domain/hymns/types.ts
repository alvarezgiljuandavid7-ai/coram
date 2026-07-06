export interface Hymn {
  id: string;
  number: number;
  title: string;
  hymnal: string;
  hymnalName: string;
  key: string;
  lyrics: string;
  chords: string[];
}

export interface HymnalCollection {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hymnal: string;
}

export interface HymnsRepositoryResult {
  collection: HymnalCollection;
  hymns: Hymn[];
}
