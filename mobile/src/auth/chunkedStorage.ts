export type AsyncKeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type ChunkMetadata = { version: 1; count: number };

export function createChunkedStorage(driver: AsyncKeyValueStore, chunkSize = 1800) {
  const metadataKey = (key: string) => `${key}.coram-meta`;
  const chunkKey = (key: string, index: number) => `${key}.coram-${index}`;

  async function readCount(key: string): Promise<number> {
    const raw = await driver.getItem(metadataKey(key));
    if (!raw) return 0;
    try {
      const metadata = JSON.parse(raw) as ChunkMetadata;
      return metadata.version === 1 && Number.isInteger(metadata.count) ? metadata.count : 0;
    } catch {
      return 0;
    }
  }

  return {
    async getItem(key: string) {
      const count = await readCount(key);
      if (count === 0) return driver.getItem(key);
      const chunks = await Promise.all(
        Array.from({ length: count }, (_, index) => driver.getItem(chunkKey(key, index))),
      );
      return chunks.some((chunk) => chunk === null) ? null : chunks.join('');
    },
    async setItem(key: string, value: string) {
      const previousCount = await readCount(key);
      const chunks = Array.from(
        { length: Math.max(1, Math.ceil(value.length / chunkSize)) },
        (_, index) => value.slice(index * chunkSize, (index + 1) * chunkSize),
      );
      await Promise.all(chunks.map((chunk, index) => driver.setItem(chunkKey(key, index), chunk)));
      await driver.setItem(metadataKey(key), JSON.stringify({ version: 1, count: chunks.length }));
      await driver.removeItem(key);
      await Promise.all(
        Array.from({ length: Math.max(0, previousCount - chunks.length) }, (_, offset) =>
          driver.removeItem(chunkKey(key, chunks.length + offset)),
        ),
      );
    },
    async removeItem(key: string) {
      const count = await readCount(key);
      await Promise.all([
        driver.removeItem(key),
        driver.removeItem(metadataKey(key)),
        ...Array.from({ length: count }, (_, index) => driver.removeItem(chunkKey(key, index))),
      ]);
    },
  };
}
