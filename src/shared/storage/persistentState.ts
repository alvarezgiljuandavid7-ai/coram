interface StoredState<T> {
  version: number;
  data: T;
}

export interface PersistentStateStore<T> {
  load: () => T;
  save: (nextState: T) => void;
  clear: () => void;
}

export function createPersistentStateStore<T>(
  key: string,
  version: number,
  seedState: T,
): PersistentStateStore<T> {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);

        if (!raw) {
          return seedState;
        }

        const parsed = JSON.parse(raw) as Partial<StoredState<T>>;

        if (parsed.version !== version || parsed.data === undefined) {
          return seedState;
        }

        return parsed.data;
      } catch {
        return seedState;
      }
    },
    save(nextState) {
      const payload: StoredState<T> = { version, data: nextState };
      localStorage.setItem(key, JSON.stringify(payload));
    },
    clear() {
      localStorage.removeItem(key);
    },
  };
}
