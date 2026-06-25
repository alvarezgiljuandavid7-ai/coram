interface HeldPitchInput {
  detectedNote: string | null;
  detectedFrequency: number | null;
  previousNote: string | null;
  previousFrequency: number | null;
  lastDetectedAt: number;
  now: number;
  holdMs: number;
}

interface HeldPitchState {
  note: string | null;
  frequency: number | null;
  held: boolean;
}

export function getHeldPitchState({
  detectedNote,
  detectedFrequency,
  previousNote,
  previousFrequency,
  lastDetectedAt,
  now,
  holdMs,
}: HeldPitchInput): HeldPitchState {
  if (detectedNote && detectedFrequency !== null) {
    return { note: detectedNote, frequency: detectedFrequency, held: false };
  }

  if (previousNote && previousFrequency !== null && now - lastDetectedAt <= holdMs) {
    return { note: previousNote, frequency: previousFrequency, held: true };
  }

  return { note: null, frequency: null, held: false };
}
