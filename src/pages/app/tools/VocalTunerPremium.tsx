import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic2, SlidersHorizontal, Volume2, Zap } from 'lucide-react';
import {
  AppHero,
  BackButton,
  PremiumCard,
  PremiumScreen,
  SectionHeader,
} from '../../../components/app-premium/PremiumApp';
import { createReusableAudioContext, getBrowserAudioContextClass } from '../../../domain/audio/reusableAudioContext';
import { getHeldPitchState } from '../../../domain/audio/pitchHold';
import { getTunerMatchScore } from '../../../domain/audio/tunerMatch';
import { useHerramientasVocalesModule } from '../../../components/phone/modules/HerramientasVocales';

const noteSpanish: Record<string, string> = {
  C: 'DO',
  'C#': 'DO#',
  D: 'RE',
  'D#': 'RE#',
  E: 'MI',
  F: 'FA',
  'F#': 'FA#',
  G: 'SOL',
  'G#': 'SOL#',
  A: 'LA',
  'A#': 'LA#',
  B: 'SI',
};

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const chordRootIndexes: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

const baseFreqs: Record<string, number> = {
  C: 261.63,
  'C#': 277.18,
  D: 293.66,
  'D#': 311.13,
  E: 329.63,
  F: 349.23,
  'F#': 369.99,
  G: 392.0,
  'G#': 415.3,
  A: 440.0,
  'A#': 466.16,
  B: 493.88,
};

function getChordNotes(root: string, type: 'mayor' | 'menor') {
  const rootIdx = chordRootIndexes[root] ?? 0;
  const intervals = type === 'mayor' ? [0, 4, 7] : [0, 3, 7];
  return intervals.map((semitones) => noteNames[(rootIdx + semitones) % 12]);
}

function getChordRootFreq(root: string, voiceType: 'grave' | 'aguda') {
  const base = baseFreqs[root] ?? 261.63;
  return voiceType === 'grave' ? base * 0.5 : base;
}

function autoCorrelateFrequency(buffer: Float32Array, sampleRate: number) {
  const size = buffer.length;
  let sumOfSquares = 0;
  for (let i = 0; i < size; i += 1) {
    sumOfSquares += buffer[i] * buffer[i];
  }
  if (Math.sqrt(sumOfSquares / size) < 0.012) return -1;

  let r1 = 0;
  let r2 = size - 1;
  let isClipped = false;
  for (let i = 0; i < size; i += 1) {
    if (Math.abs(buffer[i]) > 0.99) {
      isClipped = true;
      break;
    }
  }

  if (!isClipped) {
    for (let i = 0; i < size / 2; i += 1) {
      if (Math.abs(buffer[i]) < 0.02) {
        r1 = i;
        break;
      }
    }
    for (let i = size - 1; i > size / 2; i -= 1) {
      if (Math.abs(buffer[i]) < 0.02) {
        r2 = i;
        break;
      }
    }
  }

  const trimmed = buffer.subarray(r1, r2);
  if (trimmed.length < 256) return -1;

  const correlation = new Float32Array(trimmed.length);
  for (let lag = 0; lag < trimmed.length; lag += 1) {
    let accum = 0;
    for (let j = 0; j < trimmed.length - lag; j += 1) {
      accum += trimmed[j] * trimmed[j + lag];
    }
    correlation[lag] = accum;
  }

  let peakIndex = 0;
  while (correlation[peakIndex] > correlation[peakIndex + 1]) {
    peakIndex += 1;
    if (peakIndex >= trimmed.length - 1) return -1;
  }

  let maxVal = -1;
  let bestLag = -1;
  for (let lag = peakIndex; lag < trimmed.length; lag += 1) {
    if (correlation[lag] > maxVal) {
      maxVal = correlation[lag];
      bestLag = lag;
    }
  }

  let fundamentalLag = bestLag;
  if (fundamentalLag > 0 && fundamentalLag < trimmed.length - 1) {
    const x0 = correlation[fundamentalLag - 1];
    const x1 = correlation[fundamentalLag];
    const x2 = correlation[fundamentalLag + 1];
    const denominator = x0 + x2 - 2 * x1;
    if (denominator !== 0) {
      fundamentalLag -= (x2 - x0) / (2 * denominator);
    }
  }

  return sampleRate / fundamentalLag;
}

export function VocalTunerPremium() {
  const tools = useHerramientasVocalesModule();
  const micStreamRef = useRef<MediaStream | null>(null);
  const tunerAudioContextRef = useRef<AudioContext | null>(null);
  const tunerAnimationFrameIdRef = useRef<number | null>(null);
  const pianoAudioRef = useRef(createReusableAudioContext(getBrowserAudioContextClass()));
  const selectedChordRef = useRef(tools.tunerSelectedChord);
  const voiceTypeRef = useRef(tools.tunerVoiceType);
  const lastDetectedPitchRef = useRef<{ note: string | null; frequency: number | null; detectedAt: number }>({
    note: null,
    frequency: null,
    detectedAt: 0,
  });

  selectedChordRef.current = tools.tunerSelectedChord;
  voiceTypeRef.current = tools.tunerVoiceType;

  const cleanupTunerInstance = () => {
    if (tunerAnimationFrameIdRef.current) {
      cancelAnimationFrame(tunerAnimationFrameIdRef.current);
      tunerAnimationFrameIdRef.current = null;
    }
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    if (tunerAudioContextRef.current) {
      tunerAudioContextRef.current.close().catch(() => {});
      tunerAudioContextRef.current = null;
    }
    tools.setTunerActive(false);
    tools.setTunerDetectedFreq(null);
    tools.setTunerDetectedNote(null);
    tools.setTunerMatchScore('idle');
    lastDetectedPitchRef.current = { note: null, frequency: null, detectedAt: 0 };
  };

  useEffect(() => {
    return () => {
      cleanupTunerInstance();
      pianoAudioRef.current.dispose().catch(() => {});
    };
  }, []);

  async function playPianoSingleNote(noteName: string) {
    const audioCtx = await pianoAudioRef.current.get();
    const now = audioCtx.currentTime;
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.65, now);
    masterGain.connect(audioCtx.destination);
    const baseFreq = getChordRootFreq(noteName, tools.tunerVoiceType);
    const harmonics = [
      { freqMult: 1, gainMult: 0.7, decayMult: 1 },
      { freqMult: 2, gainMult: 0.35, decayMult: 0.8 },
      { freqMult: 3, gainMult: 0.18, decayMult: 0.6 },
      { freqMult: 4, gainMult: 0.08, decayMult: 0.4 },
      { freqMult: 5, gainMult: 0.04, decayMult: 0.3 },
    ];

    harmonics.forEach((harmonic) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * harmonic.freqMult, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(harmonic.gainMult * 0.45, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(harmonic.gainMult * 0.15, now + 0.22);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.2 * harmonic.decayMult);
      osc.connect(gainNode);
      gainNode.connect(masterGain);
      osc.start(now);
      osc.stop(now + 2.3 * harmonic.decayMult);
    });

    const hammerOsc = audioCtx.createOscillator();
    const hammerGain = audioCtx.createGain();
    hammerOsc.type = 'triangle';
    hammerOsc.frequency.setValueAtTime(baseFreq * 5.5, now);
    hammerGain.gain.setValueAtTime(0, now);
    hammerGain.gain.linearRampToValueAtTime(0.12, now + 0.001);
    hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    hammerOsc.connect(hammerGain);
    hammerGain.connect(masterGain);
    hammerOsc.start(now);
    hammerOsc.stop(now + 0.05);
  }

  async function playChordRef(root: string, type: 'mayor' | 'menor', voiceType: 'grave' | 'aguda') {
    const audioCtx = await pianoAudioRef.current.get();
    const now = audioCtx.currentTime;
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.55, now);
    masterGain.connect(audioCtx.destination);

    getChordNotes(root, type).forEach((noteName, chordIdx) => {
      const baseFreq = getChordRootFreq(noteName, voiceType);
      const noteStartTime = now + chordIdx * 0.04;
      const harmonics = [
        { freqMult: 1, gainMult: 0.6, decayMult: 1 },
        { freqMult: 2, gainMult: 0.28, decayMult: 0.8 },
        { freqMult: 3, gainMult: 0.14, decayMult: 0.6 },
        { freqMult: 4, gainMult: 0.07, decayMult: 0.4 },
        { freqMult: 5, gainMult: 0.03, decayMult: 0.3 },
      ];

      harmonics.forEach((harmonic) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * harmonic.freqMult, noteStartTime);
        gainNode.gain.setValueAtTime(0, noteStartTime);
        gainNode.gain.linearRampToValueAtTime(harmonic.gainMult * 0.35, noteStartTime + 0.006);
        gainNode.gain.exponentialRampToValueAtTime(harmonic.gainMult * 0.12, noteStartTime + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 1.8 * harmonic.decayMult);
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start(noteStartTime);
        osc.stop(noteStartTime + 1.9 * harmonic.decayMult);
      });
    });
  }

  async function startLiveTuner() {
    if (tools.tunerActive) {
      cleanupTunerInstance();
      return;
    }

    try {
      const AudioContextClass = getBrowserAudioContextClass();
      const audioCtx = new AudioContextClass();
      tunerAudioContextRef.current = audioCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      tools.setTunerActive(true);
      tools.setTunerMicError(false);
      tools.setTunerMatchScore('idle');

      const dataArray = new Float32Array(analyser.fftSize);
      const updatePitch = () => {
        if (!tunerAudioContextRef.current || audioCtx.state === 'closed') return;
        analyser.getFloatTimeDomainData(dataArray);
        const freq = autoCorrelateFrequency(dataArray, audioCtx.sampleRate);

        if (freq !== -1 && freq > 60 && freq < 1200) {
          const noteNum = 12 * (Math.log(freq / 220) / Math.log(2));
          const midi = Math.round(noteNum) + 57;
          const detectedVal = noteNames[(midi % 12 + 12) % 12];
          const roundedFreq = Math.round(freq * 10) / 10;
          lastDetectedPitchRef.current = { note: detectedVal, frequency: roundedFreq, detectedAt: performance.now() };
          tools.setTunerDetectedFreq(roundedFreq);
          tools.setTunerDetectedNote(detectedVal);

          const targetFreq = getChordRootFreq(selectedChordRef.current, voiceTypeRef.current);
          let bestTargetFreq = targetFreq;
          let minDiff = Math.abs(freq - targetFreq);
          [0.25, 0.5, 1, 2, 4].forEach((mult) => {
            const tempFreq = targetFreq * mult;
            const tempDiff = Math.abs(freq - tempFreq);
            if (tempDiff < minDiff) {
              minDiff = tempDiff;
              bestTargetFreq = tempFreq;
            }
          });

          const centsDiff = Math.round(1200 * Math.log2(freq / bestTargetFreq));
          tools.setTunerDeviation(centsDiff);
          tools.setTunerMatchScore(getTunerMatchScore({ detectedNote: detectedVal, targetNote: selectedChordRef.current, centsDiff }));
        } else {
          const heldPitch = getHeldPitchState({
            detectedNote: null,
            detectedFrequency: null,
            previousNote: lastDetectedPitchRef.current.note,
            previousFrequency: lastDetectedPitchRef.current.frequency,
            lastDetectedAt: lastDetectedPitchRef.current.detectedAt,
            now: performance.now(),
            holdMs: 1800,
          });
          tools.setTunerDetectedFreq(heldPitch.frequency);
          tools.setTunerDetectedNote(heldPitch.note);
          if (!heldPitch.held) tools.setTunerMatchScore('idle');
        }

        tunerAnimationFrameIdRef.current = requestAnimationFrame(updatePitch);
      };
      tunerAnimationFrameIdRef.current = requestAnimationFrame(updatePitch);
    } catch {
      tools.setTunerMicError(true);
      cleanupTunerInstance();
    }
  }

  function simulateTunerVoiceNote(note: string) {
    tools.setTunerActive(true);
    const voiceFreq = getChordRootFreq(note, voiceTypeRef.current);
    tools.setTunerDetectedFreq(Math.round(voiceFreq * 10) / 10);
    tools.setTunerDetectedNote(note);
    const centsDiff = note === selectedChordRef.current ? 0 : 38;
    tools.setTunerDeviation(centsDiff);
    tools.setTunerMatchScore(getTunerMatchScore({ detectedNote: note, targetNote: selectedChordRef.current, centsDiff }));
  }

  return (
    <PremiumScreen>
      <BackButton fallbackTo="/app/herramientas" label="Herramientas" />
      <AppHero
        eyebrow="Microfono / piano vocal"
        title={
          <>
            Afinador de <span className="text-[#D4AF37]">Piano Vocal</span>
          </>
        }
        body="Recupera la herramienta original de entrenamiento: teclado, acordes, microfono, deteccion de tono y luces de afinacion."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <PremiumCard className="p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B5811F]">1. Registro vocal</p>
              <div className="mt-3 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1">
                {(['grave', 'aguda'] as const).map((voice) => (
                  <button
                    key={voice}
                    type="button"
                    onClick={() => tools.setTunerVoiceType(voice)}
                    className={`min-h-11 rounded-xl text-xs font-black transition active:scale-[0.98] ${
                      tools.tunerVoiceType === voice ? 'bg-white text-[#0B2545] shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {voice === 'grave' ? 'Grave' : 'Agudo'}
                  </button>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard className="p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B5811F]">2. Armonia acorde</p>
              <div className="mt-3 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100 p-1">
                {(['mayor', 'menor'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => tools.setTunerChordType(type)}
                    className={`min-h-11 rounded-xl text-xs font-black transition active:scale-[0.98] ${
                      tools.tunerChordType === type ? 'bg-white text-[#0B2545] shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {type === 'mayor' ? 'Mayor (3aM)' : 'Menor (3am)'}
                  </button>
                ))}
              </div>
            </PremiumCard>
          </div>

          <PremiumCard className="p-4">
            <div className="flex items-center justify-between gap-3">
              <SectionHeader eyebrow="3. Teclado de piano acustico" title="Nota objetivo" />
              <span className="rounded-xl bg-[#0B2545]/5 px-3 py-1 text-[10px] font-black uppercase text-[#0B2545]">
                {noteSpanish[tools.tunerSelectedChord]} ({tools.tunerSelectedChord})
              </span>
            </div>
            <div className="relative mt-4 flex h-32 select-none overflow-hidden rounded-2xl border border-slate-950 bg-slate-950 p-1 shadow-inner">
              {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => (
                <button
                  key={note}
                  id={`piano-key-white-${note}`}
                  type="button"
                  onClick={() => {
                    tools.setTunerSelectedChord(note);
                    void playPianoSingleNote(note);
                  }}
                  className={`flex flex-1 flex-col items-center justify-end rounded-b-xl border-r border-slate-200 pb-3 text-xs font-black transition active:scale-[0.99] ${
                    tools.tunerSelectedChord === note ? 'border-b-[7px] border-b-[#D4AF37] bg-amber-50 text-[#0B2545]' : 'bg-white text-slate-600'
                  }`}
                >
                  <span>{noteSpanish[note]}</span>
                  <span className="font-mono text-[10px] italic opacity-60">{note}</span>
                </button>
              ))}
              {[
                { note: 'C#', left: '10.5%' },
                { note: 'D#', left: '24.5%' },
                { note: 'F#', left: '53.2%' },
                { note: 'G#', left: '67.4%' },
                { note: 'A#', left: '81.6%' },
              ].map((blackKey) => (
                <button
                  key={blackKey.note}
                  id={`piano-key-black-${blackKey.note}`}
                  type="button"
                  onClick={() => {
                    tools.setTunerSelectedChord(blackKey.note);
                    void playPianoSingleNote(blackKey.note);
                  }}
                  style={{ left: blackKey.left }}
                  className={`absolute z-10 flex h-[58%] w-[10%] flex-col items-center justify-end rounded-b-xl border border-slate-950 pb-2 text-[10px] font-black shadow-md transition active:scale-[0.98] ${
                    tools.tunerSelectedChord === blackKey.note ? 'bg-[#D4AF37] text-slate-950' : 'bg-slate-950 text-slate-200'
                  }`}
                >
                  <span>{noteSpanish[blackKey.note]}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 min-[430px]:grid-cols-2">
              <button type="button" id="btn-keyboard-play-unison" onClick={() => void playPianoSingleNote(tools.tunerSelectedChord)} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-black text-[#0B2545] active:scale-[0.99]">
                Escuchar nota ({noteSpanish[tools.tunerSelectedChord]})
              </button>
              <button type="button" id="btn-keyboard-play-chord" onClick={() => void playChordRef(tools.tunerSelectedChord, tools.tunerChordType, tools.tunerVoiceType)} className="min-h-12 rounded-2xl bg-[#0B2545] px-3 text-xs font-black text-white active:scale-[0.99]">
                Escuchar acorde {tools.tunerSelectedChord}{tools.tunerChordType === 'menor' ? 'm' : ''}
              </button>
            </div>
          </PremiumCard>

          <PremiumCard className="p-4">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-5 w-5 text-[#B5811F]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#B5811F]">Entrenador vocal instructivo</p>
                <h2 className="text-lg font-black text-[#0B2545]">Simula una nota de voz</h2>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {noteNames.map((note) => (
                <button
                  key={note}
                  id={`btn-simulate-vocal-key-${note}`}
                  type="button"
                  onClick={() => simulateTunerVoiceNote(note)}
                  className={`min-h-12 rounded-2xl border px-1 text-xs font-black transition active:scale-[0.98] ${
                    tools.tunerDetectedNote === note
                      ? tools.tunerMatchScore === 'perfect'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : tools.tunerMatchScore === 'near'
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : 'border-red-500 bg-red-500 text-white'
                      : tools.tunerSelectedChord === note
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {noteSpanish[note]}
                </button>
              ))}
            </div>
          </PremiumCard>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
          <PremiumCard dark className="p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_34%)]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${tools.tunerActive ? 'bg-emerald-400 shadow-[0_0_12px_#10B981]' : 'bg-slate-700'}`} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Calibrador vocal directo</p>
                </div>
                <span className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-2 py-1 text-[10px] font-black text-[#D4AF37]">
                  Objetivo: {noteSpanish[tools.tunerSelectedChord]}
                </span>
              </div>

              <div className="py-8 text-center">
                {tools.tunerActive && tools.tunerDetectedNote ? (
                  <>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Cantando</p>
                    <p className={`mt-2 text-5xl font-black ${tools.tunerMatchScore === 'perfect' ? 'text-emerald-400' : tools.tunerMatchScore === 'near' ? 'text-sky-400' : 'text-red-500'}`}>
                      {noteSpanish[tools.tunerDetectedNote] || tools.tunerDetectedNote}
                    </p>
                    <p className="mt-2 font-mono text-xs font-bold text-slate-400">{tools.tunerDetectedFreq} Hz</p>
                  </>
                ) : (
                  <>
                    <Mic2 className={`mx-auto h-10 w-10 ${tools.tunerActive ? 'animate-bounce text-sky-400' : 'text-slate-600'}`} />
                    <p className="mt-3 text-sm font-black text-slate-300">{tools.tunerActive ? 'Emite un sonido constante' : 'Afinador apagado'}</p>
                  </>
                )}
              </div>

              {tools.tunerActive && tools.tunerDetectedNote && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-[10px] font-mono font-bold text-slate-500">
                      <span>Bajo</span>
                      <span className={tools.tunerMatchScore === 'perfect' ? 'text-emerald-400' : tools.tunerMatchScore === 'near' ? 'text-sky-400' : 'text-red-500'}>
                        {tools.tunerDeviation === 0 ? 'En tono' : tools.tunerDeviation > 0 ? `+${tools.tunerDeviation} cents` : `${tools.tunerDeviation} cents`}
                      </span>
                      <span>Alto</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-slate-900">
                      <span className="absolute left-1/2 top-0 h-3 w-px bg-slate-600" />
                      <motion.span
                        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full ${tools.tunerMatchScore === 'perfect' ? 'bg-emerald-400' : tools.tunerMatchScore === 'near' ? 'bg-sky-400' : 'bg-red-500'}`}
                        animate={{ left: `${Math.min(Math.max(((tools.tunerDeviation + 45) / 90) * 100, 4), 96)}%` }}
                        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Signal label="Lejos" active={tools.tunerMatchScore === 'none'} tone="red" />
                    <Signal label="Cerca" active={tools.tunerMatchScore === 'near'} tone="sky" />
                    <Signal label="Perfecto" active={tools.tunerMatchScore === 'perfect'} tone="green" />
                  </div>
                </div>
              )}

              {!tools.tunerActive && (
                <p className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-3 text-xs font-bold leading-6 text-sky-100">
                  Antes de activar el afinador, tu navegador pedira permiso para usar el microfono.
                </p>
              )}
              {tools.tunerMicError && (
                <p className="mt-3 rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-xs font-bold leading-6 text-red-100">
                  Microfono no disponible. Puedes practicar con el teclado y el simulador vocal.
                </p>
              )}
              <button
                type="button"
                id="btn-toggle-tuner-active-action"
                onClick={() => void startLiveTuner()}
                className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-xs font-black uppercase tracking-wider transition active:scale-[0.99] ${
                  tools.tunerActive ? 'bg-red-600 text-white' : 'bg-[#D4AF37] text-slate-950'
                }`}
              >
                <Mic2 className="h-4 w-4" />
                {tools.tunerActive ? 'Detener afinador' : 'Activar afinador'}
              </button>
            </div>
          </PremiumCard>

          <PremiumCard className="p-4">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 shrink-0 text-[#B5811F]" />
              <p className="text-sm font-semibold leading-6 text-slate-600">
                Toca una tecla, escucha la nota o el acorde, activa el microfono y canta la misma altura. Verde significa afinado, azul cerca y rojo fuera.
              </p>
            </div>
          </PremiumCard>
        </aside>
      </div>
    </PremiumScreen>
  );
}

function Signal({ label, active, tone }: { label: string; active: boolean; tone: 'red' | 'sky' | 'green' }) {
  const colors = {
    red: active ? 'border-red-500/50 bg-red-500/20 text-red-200' : 'border-white/10 bg-white/5 text-slate-500',
    sky: active ? 'border-sky-400/50 bg-sky-400/20 text-sky-200' : 'border-white/10 bg-white/5 text-slate-500',
    green: active ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-500',
  };
  return <div className={`rounded-2xl border p-3 text-center text-[10px] font-black uppercase ${colors[tone]}`}>{label}</div>;
}
