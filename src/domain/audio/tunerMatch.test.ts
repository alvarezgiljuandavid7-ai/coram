import { describe, expect, it } from 'vitest';
import { getTunerMatchScore } from './tunerMatch';

describe('getTunerMatchScore', () => {
  it('keeps the target note green through normal vocal drift', () => {
    expect(getTunerMatchScore({ detectedNote: 'F', targetNote: 'F', centsDiff: 34 })).toBe('perfect');
  });

  it('marks the target note as near when it drifts beyond the green range', () => {
    expect(getTunerMatchScore({ detectedNote: 'F', targetNote: 'F', centsDiff: 48 })).toBe('near');
  });

  it('marks a neighboring semitone as near instead of perfect', () => {
    expect(getTunerMatchScore({ detectedNote: 'F#', targetNote: 'F', centsDiff: 0 })).toBe('near');
  });
});
