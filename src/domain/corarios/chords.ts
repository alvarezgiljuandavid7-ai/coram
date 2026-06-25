const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

const CHORD_PATTERN = /^([A-G](?:#|b)?)(.*)$/;
const STANDALONE_CHORD_PATTERN = /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|[0-9]|\/|#|b|\+|-)*$/;

function transposeRoot(root: string, offset: number): string {
  const normalized = FLAT_TO_SHARP[root] ?? root;
  const index = SHARP_NOTES.indexOf(normalized as (typeof SHARP_NOTES)[number]);

  if (index < 0) {
    return root;
  }

  const nextIndex = (index + offset + SHARP_NOTES.length * 12) % SHARP_NOTES.length;
  return SHARP_NOTES[nextIndex];
}

export function transposeChordToken(token: string, offset: number): string {
  if (!STANDALONE_CHORD_PATTERN.test(token)) {
    return token;
  }

  const match = token.match(CHORD_PATTERN);

  if (!match) {
    return token;
  }

  return `${transposeRoot(match[1], offset)}${match[2]}`;
}

export function transposeChords(lyrics: string, offset: number): string {
  if (offset === 0) {
    return lyrics;
  }

  return lyrics.replace(/\S+/g, (token) => transposeChordToken(token, offset));
}
