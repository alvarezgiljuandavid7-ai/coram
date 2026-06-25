import { describe, expect, it, vi } from 'vitest';
import { createReusableAudioContext } from './reusableAudioContext';

describe('createReusableAudioContext', () => {
  it('reuses one browser audio context for repeated piano notes', async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const resume = vi.fn().mockResolvedValue(undefined);
    let instanceCount = 0;
    class FakeAudioContext {
      state = 'running';
      close = close;
      resume = resume;

      constructor() {
        instanceCount += 1;
      }
    }
    const audio = createReusableAudioContext(FakeAudioContext as unknown as typeof AudioContext);

    const first = await audio.get();
    const second = await audio.get();
    await audio.dispose();

    expect(first).toBe(second);
    expect(instanceCount).toBe(1);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
