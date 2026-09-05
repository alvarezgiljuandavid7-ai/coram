import { describe, expect, it } from 'vitest';
import { createChunkedStorage, type AsyncKeyValueStore } from './chunkedStorage';

function memoryStore(): AsyncKeyValueStore {
  const values = new Map<string, string>();
  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => void values.set(key, value),
    removeItem: async (key) => void values.delete(key),
  };
}

describe('chunked secure storage', () => {
  it('round-trips sessions larger than one native secure-store entry', async () => {
    const storage = createChunkedStorage(memoryStore(), 16);
    const session = JSON.stringify({ access_token: 'a'.repeat(80), refresh_token: 'r'.repeat(40) });
    await storage.setItem('session', session);
    await expect(storage.getItem('session')).resolves.toBe(session);
  });

  it('removes metadata and all chunks on logout', async () => {
    const storage = createChunkedStorage(memoryStore(), 8);
    await storage.setItem('session', 'long-session-value');
    await storage.removeItem('session');
    await expect(storage.getItem('session')).resolves.toBeNull();
  });
});
