import { describe, expect, it } from 'vitest';
import { clearCoramQueryCache, createCoramQueryClient, coramQueryKeys } from './queryClient';

describe('CorAM public query cache', () => {
  it('uses module-scoped public query keys and a bounded stale-while-revalidate window', () => {
    const client = createCoramQueryClient();

    expect(coramQueryKeys.corarios).toEqual(['public', 'corarios']);
    expect(coramQueryKeys.hymns).toEqual(['public', 'hymns', 'himnario-manantial-de-inspiracion']);
    expect(client.getDefaultOptions().queries?.staleTime).toBe(5 * 60 * 1000);
    expect(client.getDefaultOptions().queries?.gcTime).toBe(30 * 60 * 1000);
  });

  it('does not define shared cache keys for private user data', () => {
    expect(Object.values(coramQueryKeys).flat()).not.toContain('favorites');
    expect(Object.values(coramQueryKeys).flat()).not.toContain('collections');
    expect(Object.values(coramQueryKeys).flat()).not.toContain('profile');
    expect(Object.values(coramQueryKeys).flat()).not.toContain('admin');
  });

  it('clears all in-memory queries on logout so a subsequent account starts clean', () => {
    const client = createCoramQueryClient();
    client.setQueryData(coramQueryKeys.corarios, [{ id: 'public-corario' }]);

    clearCoramQueryCache(client);

    expect(client.getQueryData(coramQueryKeys.corarios)).toBeUndefined();
  });
});
