import { useState } from 'react';

export const herramientasVocalesScreens = ['vocal-tuner', 'vocal-warmup'] as const;

export function useHerramientasVocalesModule() {
  const [warmupVoiceClass, setWarmupVoiceClass] = useState<'soprano' | 'alto' | 'tenor' | 'bajo'>('tenor');
  const [warmupVowel, setWarmupVowel] = useState<string>('Mmm');
  const [warmupExerciseType, setWarmupExerciseType] = useState<string>('respiracion');
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [breathingTimer, setBreathingTimer] = useState<number>(4);
  const [breathingCycleCount, setBreathingCycleCount] = useState<number>(0);
  const [scalePlaying, setScalePlaying] = useState<boolean>(false);
  const [activeScaleStep, setActiveScaleStep] = useState<number>(-1);
  const [tunerActive, setTunerActive] = useState<boolean>(false);
  const [tunerVoiceType, setTunerVoiceType] = useState<'grave' | 'aguda'>('grave');
  const [tunerSelectedChord, setTunerSelectedChord] = useState<string>('C');
  const [tunerChordType, setTunerChordType] = useState<'mayor' | 'menor'>('mayor');
  const [tunerDetectedFreq, setTunerDetectedFreq] = useState<number | null>(null);
  const [tunerDetectedNote, setTunerDetectedNote] = useState<string | null>(null);
  const [tunerDeviation, setTunerDeviation] = useState<number>(0);
  const [tunerMatchScore, setTunerMatchScore] = useState<'perfect' | 'near' | 'none' | 'idle'>('idle');
  const [tunerMicError, setTunerMicError] = useState<boolean>(false);

  return {
    warmupVoiceClass,
    setWarmupVoiceClass,
    warmupVowel,
    setWarmupVowel,
    warmupExerciseType,
    setWarmupExerciseType,
    breathingActive,
    setBreathingActive,
    breathingPhase,
    setBreathingPhase,
    breathingTimer,
    setBreathingTimer,
    breathingCycleCount,
    setBreathingCycleCount,
    scalePlaying,
    setScalePlaying,
    activeScaleStep,
    setActiveScaleStep,
    tunerActive,
    setTunerActive,
    tunerVoiceType,
    setTunerVoiceType,
    tunerSelectedChord,
    setTunerSelectedChord,
    tunerChordType,
    setTunerChordType,
    tunerDetectedFreq,
    setTunerDetectedFreq,
    tunerDetectedNote,
    setTunerDetectedNote,
    tunerDeviation,
    setTunerDeviation,
    tunerMatchScore,
    setTunerMatchScore,
    tunerMicError,
    setTunerMicError,
  };
}
