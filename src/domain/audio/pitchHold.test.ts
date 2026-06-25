import { describe, expect, it } from 'vitest';
import { getHeldPitchState } from './pitchHold';

describe('getHeldPitchState', () => {
  it('keeps the last detected pitch through short microphone dropouts', () => {
    expect(
      getHeldPitchState({
        detectedNote: null,
        detectedFrequency: null,
        previousNote: 'F',
        previousFrequency: 349.2,
        lastDetectedAt: 1000,
        now: 1450,
        holdMs: 700,
      }),
    ).toEqual({ note: 'F', frequency: 349.2, held: true });
  });

  it('clears the pitch after sustained silence', () => {
    expect(
      getHeldPitchState({
        detectedNote: null,
        detectedFrequency: null,
        previousNote: 'F',
        previousFrequency: 349.2,
        lastDetectedAt: 1000,
        now: 1800,
        holdMs: 700,
      }),
    ).toEqual({ note: null, frequency: null, held: false });
  });
});
