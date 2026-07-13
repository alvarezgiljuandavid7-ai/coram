import { useEffect, useRef } from 'react';
import { Mic2, SlidersHorizontal, Volume2, Zap } from 'lucide-react';
import {
  BackButton,
  PremiumCard,
  SectionHeader,
} from '../../../components/app-premium/PremiumApp';
import { ExperienceCanvas } from '../../../components/experience-v2/ExperienceV2';
import { createReusableAudioContext, getBrowserAudioContextClass } from '../../../domain/audio/reusableAudioContext';
import { getHeldPitchState } from '../../../domain/audio/pitchHold';
import { getTunerMatchScore } from '../../../domain/audio/tunerMatch';
import { useHerramientasVocalesModule } from '../../../components/phone/modules/HerramientasVocales';

type ReusableAudioContext = ReturnType<typeof createReusableAudioContext>;

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

  // Limit the autocorrelation lag range to the plausible vocal range (60 Hz - 1200 Hz).
  // This reduces the inner loop from O(N^2) (up to ~4.2M ops) to O(N * maxLag) (~1.5M ops max)
  // and keeps the main thread responsive on mobile while the tuner is active.
  const minFreq = 60;
  const maxFreq = 1200;
  const minLag = Math.max(2, Math.floor(sampleRate / maxFreq));
  const maxLag = Math.min(trimmed.length - 1, Math.ceil(sampleRate / minFreq));

  const correlation = new Float32Array(maxLag + 1);
  for (let lag = 0; lag <= maxLag; lag += 1) {
    let accum = 0;
    const upper = trimmed.length - lag;
    for (let j = 0; j < upper; j += 1) {
      accum += trimmed[j] * trimmed[j + lag];
    }
    correlation[lag] = accum;
  }

  let peakIndex = minLag;
  while (peakIndex < maxLag && correlation[peakIndex] > correlation[peakIndex + 1]) {
    peakIndex += 1;
  }

  let maxVal = -1;
  let bestLag = -1;
  for (let lag = peakIndex; lag <= maxLag; lag += 1) {
    if (correlation[lag] > maxVal) {
      maxVal = correlation[lag];
      bestLag = lag;
    }
  }

  if (bestLag <= 0) return -1;

  let fundamentalLag = bestLag;
  if (fundamentalLag > 0 && fundamentalLag < maxLag) {
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

export function VocalTunerPremium({ mode = 'tuner' }: { mode?: 'tuner' | 'piano' }) {
  const tools = useHerramientasVocalesModule();
  const micStreamRef = useRef<MediaStream | null>(null);
  const tunerAudioContextRef = useRef<AudioContext | null>(null);
  const tunerAnimationFrameIdRef = useRef<number | null>(null);
  // Lazy init: avoids re-evaluating createReusableAudioContext on every render.
  const pianoAudioRef = useRef<ReusableAudioContext | null>(null);
  const selectedChordRef = useRef(tools.tunerSelectedChord);
  const voiceTypeRef = useRef(tools.tunerVoiceType);
  const lastDetectedPitchRef = useRef<{ note: string | null; frequency: number | null; detectedAt: number }>({
    note: null,
    frequency: null,
    detectedAt: 0,
  });
  // Throttle: only push tuner updates to React state when values change meaningfully.
  // This prevents 60 re-renders/sec while the mic is active.
  const lastPushedTunerRef = useRef<{ freq: number | null; note: string | null; deviation: number; score: string }>({
    freq: null,
    note: null,
    deviation: Number.NaN,
    score: '',
  });

  const getPianoAudio = () => {
    if (!pianoAudioRef.current) {
      pianoAudioRef.current = createReusableAudioContext(getBrowserAudioContextClass());
    }
    return pianoAudioRef.current;
  };

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
    lastPushedTunerRef.current = { freq: null, note: null, deviation: Number.NaN, score: '' };
  };

  useEffect(() => {
    return () => {
      cleanupTunerInstance();
      pianoAudioRef.current?.dispose().catch(() => {});
    };
  }, []);

  async function playPianoSingleNote(noteName: string) {
    const audioCtx = await getPianoAudio().get();
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
    const audioCtx = await getPianoAudio().get();
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
          const score = getTunerMatchScore({ detectedNote: detectedVal, targetNote: selectedChordRef.current, centsDiff });

          // Throttle: only push to React state when values change meaningfully.
          // This prevents 60 re-renders/sec while the mic is active.
          const prev = lastPushedTunerRef.current;
          const freqChanged = prev.freq === null || Math.abs(prev.freq - roundedFreq) >= 0.5;
          const noteChanged = prev.note !== detectedVal;
          const deviationChanged = prev.deviation !== centsDiff && Math.abs(prev.deviation - centsDiff) >= 2;
          const scoreChanged = prev.score !== score;
          if (freqChanged || noteChanged || deviationChanged || scoreChanged) {
            tools.setTunerDetectedFreq(roundedFreq);
            tools.setTunerDetectedNote(detectedVal);
            tools.setTunerDeviation(centsDiff);
            tools.setTunerMatchScore(score);
            lastPushedTunerRef.current = { freq: roundedFreq, note: detectedVal, deviation: centsDiff, score };
          }
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
          const prev = lastPushedTunerRef.current;
          if (prev.freq !== heldPitch.frequency || prev.note !== heldPitch.note) {
            tools.setTunerDetectedFreq(heldPitch.frequency);
            tools.setTunerDetectedNote(heldPitch.note);
            lastPushedTunerRef.current = { ...prev, freq: heldPitch.frequency, note: heldPitch.note };
          }
          if (!heldPitch.held && prev.score !== 'idle') {
            tools.setTunerMatchScore('idle');
            lastPushedTunerRef.current = { ...prev, score: 'idle' };
          }
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
    <ExperienceCanvas>
      <BackButton fallbackTo="/app/herramientas" label="Herramientas" />

      {/* Compact heading: replaces the old EditorialHeading (176px) with a slim 1-line header.
          This saves ~140px of vertical space on mobile, keeping piano and meter close together. */}
      <section className="flex items-center justify-between gap-3 py-1">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a56b09]">
            {mode === 'piano' ? 'Teclado y armonia' : 'Microfono y precision vocal'}
          </p>
          <h1 className="mt-1 font-serif text-3xl leading-tight tracking-tight text-[#0B2545] sm:text-4xl">
            {mode === 'piano' ? 'Piano' : 'Afinador vocal'}
          </h1>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0B2545]/5 text-[#0B2545]">
          {mode === 'piano' ? <Volume2 className="h-6 w-6" /> : <Mic2 className="h-6 w-6" />}
        </span>
      </section>

      {/* Mobile-first composition: on mobile the order is piano -> vocal meter -> setup -> simulator.
          The piano and meter come FIRST so the user sees both without scrolling.
          On xl+ we keep the original 2-column grid (piano+simulator on the left, meter sticky on the right).
          The section uses flex (not space-y) so Tailwind order-* utilities actually take effect. */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="flex flex-col gap-4">
          {/* Setup cards — order-3 on mobile (after piano+meter), order-1 on xl (top of left column) */}
          <div className="order-3 grid gap-3 min-[430px]:grid-cols-2 xl:order-1">
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

          {/* Piano keyboard — order-1 on mobile (FIRST, so user sees it immediately), order-2 on xl */}
          <PremiumCard className="order-1 p-3 sm:p-4 xl:order-2">
            <div className="flex items-center justify-between gap-3">
              <SectionHeader eyebrow="3. Teclado de piano acustico" title="Nota objetivo" />
              <span className="rounded-xl bg-[#0B2545]/5 px-3 py-1 text-[10px] font-black uppercase text-[#0B2545]">
                {noteSpanish[tools.tunerSelectedChord]} ({tools.tunerSelectedChord})
              </span>
            </div>
            <div className="relative mt-3 flex h-28 select-none overflow-hidden rounded-2xl border border-slate-950 bg-slate-950 p-1 shadow-inner sm:h-32">
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

          {/* Vocal meter — order-2 on mobile (immediately after piano), order-2 on xl (right column, sticky).
              This is the key fix: the meter is now visible right below the piano without long scroll. */}
          <PremiumCard dark className="order-2 p-4 sm:p-5 xl:sticky xl:top-24 xl:h-fit">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_34%)]" />
            <div className="relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${tools.tunerActive ? 'bg-emerald-400 shadow-[0_0_12px_#10B981]' : 'bg-slate-700'}`} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300">Calibrador vocal directo</p>
                </div>
                <span className="rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-2 py-1 text-[10px] font-black text-[#D4AF37]">
                  Objetivo: {noteSpanish[tools.tunerSelectedChord]}
                </span>
              </div>

              <div className="py-4 text-center sm:py-6">
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
                    <Mic2 className={`mx-auto h-10 w-10 ${tools.tunerActive ? 'text-sky-400' : 'text-slate-600'}`} />
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
                      {/* Replaced motion.span (spring recalculated 60x/sec) with a plain span using
                          CSS transition. Same visual smoothness, ~10x less compositing work. */}
                      <span
                        className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left] duration-150 ease-out ${tools.tunerMatchScore === 'perfect' ? 'bg-emerald-400' : tools.tunerMatchScore === 'near' ? 'bg-sky-400' : 'bg-red-500'}`}
                        style={{ left: `${Math.min(Math.max(((tools.tunerDeviation + 45) / 90) * 100, 4), 96)}%` }}
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

          {/* Voice simulator — order-4 on mobile (after the setup), order-4 on xl.
              Kept accessible but moved below the meter so it doesn't force scroll between piano and meter. */}
          <PremiumCard className="order-4 p-4 xl:order-4">
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

          <PremiumCard className="order-5 p-4 xl:order-5">
            <div className="flex gap-3">
              <Zap className="h-5 w-5 shrink-0 text-[#B5811F]" />
              <p className="text-sm font-semibold leading-6 text-slate-600">
                Toca una tecla, escucha la nota o el acorde, activa el microfono y canta la misma altura. Verde significa afinado, azul cerca y rojo fuera.
              </p>
            </div>
          </PremiumCard>
        </section>
      </div>
    </ExperienceCanvas>
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
