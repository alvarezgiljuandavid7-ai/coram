import { describe, expect, it } from 'vitest';
import { transposeChord, transposeChordText } from './transposition';

describe('chord transposition', () => {
  it('transposes majors, minors, sevenths and slash chords', () => {
    expect(transposeChord('C', 2)).toBe('D');
    expect(transposeChord('Am', 2)).toBe('Bm');
    expect(transposeChord('F#7', 1)).toBe('G7');
    expect(transposeChord('Bbmaj7/D', 2)).toBe('Cmaj7/E');
  });

  it('preserves accidental preference when requested', () => {
    expect(transposeChord('Bb', 1, 'flat')).toBe('B');
    expect(transposeChord('B', 1, 'flat')).toBe('C');
    expect(transposeChord('C', 1, 'sharp')).toBe('C#');
  });

  it('changes only recognized chord tokens in mixed text', () => {
    expect(transposeChordText('[C] Santo [Am7] por siempre', 2)).toBe('[D] Santo [Bm7] por siempre');
    expect(transposeChordText('Camino al altar', 2)).toBe('Camino al altar');
    expect(transposeChordText('C G/B Am7 F', -2)).toBe('A# F/A Gm7 D#');
  });

  it('returns unsupported text unchanged', () => {
    expect(transposeChord('Hello', 3)).toBe('Hello');
    expect(transposeChord('C/H', 3)).toBe('C/H');
  });
});
