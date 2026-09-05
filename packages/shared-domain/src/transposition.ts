export type AccidentalPreference = 'sharp' | 'flat';

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const NOTE_TO_INDEX: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const CHORD_PATTERN = /^([A-G](?:#|b)?)([^/\s\]]*)(?:\/([A-G](?:#|b)?))?$/;
const SUPPORTED_SUFFIX = /^(?:m|maj|min|dim|aug|sus|add|M)?(?:\d+)?(?:[#b+\-]\d+)*(?:\([^)]*\))?$/;

function normalizeSteps(steps: number): number {
  return ((steps % 12) + 12) % 12;
}

function transposeNote(note: string, steps: number, preference: AccidentalPreference): string | null {
  const index = NOTE_TO_INDEX[note];
  if (index === undefined) return null;
  const notes = preference === 'flat' ? FLAT_NOTES : SHARP_NOTES;
  return notes[(index + normalizeSteps(steps)) % 12];
}

export function transposeChord(
  chord: string,
  semitones: number,
  preference: AccidentalPreference = 'sharp',
): string {
  const match = chord.match(CHORD_PATTERN);
  if (!match || !SUPPORTED_SUFFIX.test(match[2])) return chord;

  const root = transposeNote(match[1], semitones, preference);
  const bass = match[3] ? transposeNote(match[3], semitones, preference) : null;
  if (!root || (match[3] && !bass)) return chord;

  return `${root}${match[2]}${bass ? `/${bass}` : ''}`;
}

export function transposeChordText(
  text: string,
  semitones: number,
  preference: AccidentalPreference = 'sharp',
): string {
  const transposeCandidate = (candidate: string) => transposeChord(candidate, semitones, preference);

  return text
    .replace(/\[([^\]]+)\]/g, (full, candidate: string) => {
      const transposed = transposeCandidate(candidate);
      return transposed === candidate && !CHORD_PATTERN.test(candidate) ? full : `[${transposed}]`;
    })
    .replace(/(^|[\s|])([A-G](?:#|b)?[^\s|\[\]]*)(?=$|[\s|])/g, (_full, prefix: string, candidate: string) => {
      return `${prefix}${transposeCandidate(candidate)}`;
    });
}
