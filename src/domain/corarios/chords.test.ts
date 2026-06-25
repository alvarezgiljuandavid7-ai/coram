import { describe, expect, it } from 'vitest';
import { transposeChords } from './chords';

describe('transposeChords', () => {
  it('transposes simple major and minor chords inside lyrics', () => {
    const lyrics = '[Coro]\nG\nYo tengo un Dios\nD                     G\nMaravilloso';

    expect(transposeChords(lyrics, 2)).toBe(
      '[Coro]\nA\nYo tengo un Dios\nE                     A\nMaravilloso',
    );
  });

  it('keeps non-chord words unchanged', () => {
    const lyrics = 'Dios grande y maravilloso\nAmén al cantar';

    expect(transposeChords(lyrics, 1)).toBe('Dios grande y maravilloso\nAmén al cantar');
  });

  it('supports accidentals and chord suffixes', () => {
    const lyrics = 'Bbmaj7 F#m7 C#dim Asus4';

    expect(transposeChords(lyrics, 1)).toBe('Bmaj7 Gm7 Ddim A#sus4');
  });

  it('returns the original lyrics when offset is zero', () => {
    const lyrics = 'G D Em C';

    expect(transposeChords(lyrics, 0)).toBe(lyrics);
  });
});
