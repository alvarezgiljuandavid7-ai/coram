import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPersistentStateStore } from './persistentState';

interface DemoState {
  name: string;
  count: number;
}

const seed: DemoState = { name: 'CorAM', count: 1 };

describe('persistentState', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    });

    localStorage.clear();
  });

  it('returns seed data when storage is empty', () => {
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    expect(store.load()).toEqual(seed);
  });

  it('roundtrips state through localStorage', () => {
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    store.save({ name: 'CorAM Premium', count: 2 });

    expect(store.load()).toEqual({ name: 'CorAM Premium', count: 2 });
  });

  it('falls back to seed data when versions do not match', () => {
    localStorage.setItem('demo', JSON.stringify({ version: 0, data: { name: 'Old', count: 99 } }));
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    expect(store.load()).toEqual(seed);
  });

  it('falls back to seed data when JSON is invalid', () => {
    localStorage.setItem('demo', '{broken');
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    expect(store.load()).toEqual(seed);
  });
});
