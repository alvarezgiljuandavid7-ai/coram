export type TunerMatchScore = 'idle' | 'none' | 'near' | 'perfect';

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const perfectCentsTolerance = 35;

interface TunerMatchInput {
  detectedNote: string;
  targetNote: string;
  centsDiff: number;
}

export function getTunerMatchScore({
  detectedNote,
  targetNote,
  centsDiff,
}: TunerMatchInput): TunerMatchScore {
  if (detectedNote === targetNote) {
    return Math.abs(centsDiff) <= perfectCentsTolerance ? 'perfect' : 'near';
  }

  const detectedIdx = noteNames.indexOf(detectedNote);
  const targetIdx = noteNames.indexOf(targetNote);
  if (detectedIdx === -1 || targetIdx === -1) {
    return 'none';
  }

  const semitoneDist = Math.min(Math.abs(detectedIdx - targetIdx), 12 - Math.abs(detectedIdx - targetIdx));
  return semitoneDist === 1 ? 'near' : 'none';
}
