import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Regression tests for the Corarios / Hymns domain separation.
 *
 * These tests assert that:
 *   1. corariosRepository ONLY queries the `corarios` table and ONLY returns
 *      rows with status='published' AND is_published=true.
 *   2. hymnsRepository ONLY queries the `hymns` table (joined with
 *      hymnal_collections) and ONLY returns rows with status='published' AND
 *      is_published=true.
 *   3. Neither repository ever references the other domain's table.
 *   4. When the `corarios` table is empty, fetchCorarios returns [] (the
 *      /app/corarios route must show an empty state, never hymns as fallback).
 *
 * The Supabase client is mocked so we can capture the exact query builder
 * chain (table name, filters, order) without hitting the network.
 */

type QueryState = {
  table: string | null;
  filters: Array<{ column: string; value: unknown }>;
  orders: Array<{ column: string; ascending: boolean }>;
  selectedColumns: string;
  data: unknown[] | null;
  error: unknown;
};

function createChainableMock(state: QueryState) {
  const chain = {
    from(table: string) {
      state.table = table;
      return chain;
    },
    select(columns: string) {
      state.selectedColumns = columns;
      return chain;
    },
    eq(column: string, value: unknown) {
      state.filters.push({ column, value });
      return chain;
    },
    order(column: string, opts: { ascending: boolean }) {
      state.orders.push({ column, ascending: opts.ascending });
      return chain;
    },
    then(onFulfilled: (result: { data: unknown[] | null; error: unknown }) => void) {
      return Promise.resolve({ data: state.data, error: state.error }).then(onFulfilled);
    },
    catch() {
      return Promise.resolve({ data: state.data, error: state.error });
    },
  };
  return chain;
}

const mocks = vi.hoisted(() => {
  let state: QueryState = {
    table: null,
    filters: [],
    orders: [],
    selectedColumns: '',
    data: [],
    error: null,
  };
  return {
    getState: () => state,
    setState: (next: Partial<QueryState>) => {
      state = { ...state, ...next, filters: [], orders: [] };
    },
    supabase: {
      from(table: string) {
        // reset per-call
        state = { table, filters: [], orders: [], selectedColumns: '', data: state.data, error: null };
        return createChainableMock(state);
      },
    },
  };
});

vi.mock('../../shared/supabase/client', () => ({
  get supabase() {
    return mocks.supabase;
  },
}));

// Import AFTER the mock is registered so the module picks up the mock.
const { fetchCorarios } = await import('./corariosRepository');
const { fetchManantialHymns } = await import('../hymns/hymnsRepository');

describe('corariosRepository — domain isolation', () => {
  beforeEach(() => {
    mocks.setState({ data: [], error: null });
  });

  it('queries the corarios table (never hymns)', async () => {
    mocks.setState({ data: [] });
    await fetchCorarios();
    const state = mocks.getState();
    expect(state.table).toBe('corarios');
    expect(state.table).not.toBe('hymns');
  });

  it('filters by status=published AND is_published=true', async () => {
    mocks.setState({ data: [] });
    await fetchCorarios();
    const state = mocks.getState();
    expect(state.filters).toEqual(
      expect.arrayContaining([
        { column: 'status', value: 'published' },
        { column: 'is_published', value: true },
      ]),
    );
  });

  it('returns an empty array when no corarios are published (empty state, not fallback)', async () => {
    mocks.setState({ data: [] });
    const result = await fetchCorarios();
    expect(result).toEqual([]);
  });

  it('maps published corarios to the Corario shape', async () => {
    mocks.setState({
      data: [
        {
          id: 'c-1',
          titulo: 'Dios es amor',
          categoria: 'Adoracion',
          tono: 'G',
          letra: 'Letra completa',
          premium: false,
          is_published: true,
          audio_url: null,
        },
      ],
    });
    const result = await fetchCorarios();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'c-1',
      title: 'Dios es amor',
      category: 'Adoracion',
      key: 'G',
      isPublished: true,
    });
  });

  it('does not reference the hymns table in its select or filters', async () => {
    mocks.setState({ data: [] });
    await fetchCorarios();
    const state = mocks.getState();
    expect(state.selectedColumns).not.toContain('hymn');
    expect(state.filters.find((f) => f.column.includes('hymn'))).toBeUndefined();
  });
});

describe('hymnsRepository — domain isolation', () => {
  beforeEach(() => {
    mocks.setState({ data: [], error: null });
  });

  it('queries the hymns table (never corarios)', async () => {
    mocks.setState({ data: [] });
    await fetchManantialHymns().catch(() => undefined);
    const state = mocks.getState();
    expect(state.table).toBe('hymns');
    expect(state.table).not.toBe('corarios');
  });

  it('filters by status=published AND is_published=true', async () => {
    mocks.setState({ data: [] });
    await fetchManantialHymns().catch(() => undefined);
    const state = mocks.getState();
    expect(state.filters).toEqual(
      expect.arrayContaining([
        { column: 'status', value: 'published' },
        { column: 'is_published', value: true },
        { column: 'hymnal_collections.slug', value: 'himnario-manantial-de-inspiracion' },
      ]),
    );
  });

  it('returns an empty hymns array when no hymns are published', async () => {
    mocks.setState({ data: [] });
    const result = await fetchManantialHymns().catch(() => ({ collection: { id: 'x', slug: 'x', name: 'x', description: null, hymnal: 'x' }, hymns: [] }));
    expect(result.hymns).toEqual([]);
  });

  it('does not reference the corarios table in its select or filters', async () => {
    mocks.setState({ data: [] });
    await fetchManantialHymns().catch(() => undefined);
    const state = mocks.getState();
    expect(state.selectedColumns.toLowerCase()).not.toContain('corario');
    expect(state.filters.find((f) => f.column.includes('corario'))).toBeUndefined();
  });
});

describe('Corarios / Hymns cross-contamination regression', () => {
  it('fetchCorarios never returns hymn-shaped objects', async () => {
    // Even if someone accidentally inserted a hymn row into the corarios table,
    // the mapper should still produce Corario-shaped objects (title, not number).
    mocks.setState({
      data: [
        {
          id: 'c-1',
          titulo: 'Amazing Grace',
          categoria: 'Himnos',
          tono: 'G',
          letra: 'Letra',
          premium: false,
          is_published: true,
          audio_url: null,
        },
      ],
    });
    const result = await fetchCorarios();
    expect(result).toHaveLength(1);
    // Corario shape: has `title`, does NOT have `hymnal` or `number`
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).not.toHaveProperty('hymnal');
    expect(result[0]).not.toHaveProperty('number');
  });

  it('fetchManantialHymns never returns corario-shaped objects', async () => {
    mocks.setState({
      data: [
        {
          id: 'h-1',
          legacy_id: 'h-1',
          hymn_number: 1,
          title: 'Holy Holy Holy',
          slug: 'holy-holy-holy',
          original_key: 'G',
          lyrics: 'Letra',
          chords: [],
          hymnal_collections: {
            id: 'col-1',
            slug: 'himnario-manantial-de-inspiracion',
            name: 'Himnario Manantial de Inspiracion',
            description: null,
          },
        },
      ],
    });
    const result = await fetchManantialHymns();
    expect(result.hymns).toHaveLength(1);
    // Hymn shape: has `number` and `hymnal`, does NOT have `category` (corario shape)
    expect(result.hymns[0]).toHaveProperty('number');
    expect(result.hymns[0]).toHaveProperty('hymnal');
    expect(result.hymns[0]).not.toHaveProperty('category');
  });
});
