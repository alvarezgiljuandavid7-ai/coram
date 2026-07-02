import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, CheckCircle2, Mic2, Piano, Play, Square, Volume2, Wind } from 'lucide-react';
import {
  AppHero,
  BackButton,
  BrandedIcon,
  PremiumCard,
  PremiumScreen,
  SectionHeader,
} from '../../../components/app-premium/PremiumApp';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type ToolMode = 'tuner' | 'piano' | 'warmup';

const notes = [
  { label: 'DO', key: 'C', frequency: 261.63 },
  { label: 'RE', key: 'D', frequency: 293.66 },
  { label: 'MI', key: 'E', frequency: 329.63 },
  { label: 'FA', key: 'F', frequency: 349.23 },
  { label: 'SOL', key: 'G', frequency: 392.0 },
  { label: 'LA', key: 'A', frequency: 440.0 },
  { label: 'SI', key: 'B', frequency: 493.88 },
];

const warmupSteps = [
  { title: 'Respira', detail: 'Inhala profundo por la nariz y libera tension en cuello y hombros.', seconds: 4 },
  { title: 'Sostiene', detail: 'Manten soporte abdominal sin apretar garganta ni mandibula.', seconds: 4 },
  { title: 'Vocaliza', detail: 'Canta suave en la nota guia y conserva un volumen comodo.', seconds: 8 },
];

const copy = {
  tuner: {
    eyebrow: 'Microfono / precision vocal',
    title: 'Afinador vocal',
    body: 'Activa el microfono cuando estes listo y usa notas de referencia sin pantallas duplicadas.',
    icon: Mic2,
  },
  piano: {
    eyebrow: 'Teclado / acordes',
    title: 'Piano / teclado',
    body: 'Toca notas limpias de referencia para ensayar corarios, himnos y calentamientos.',
    icon: Piano,
  },
  warmup: {
    eyebrow: 'Rutina / voz sana',
    title: 'Calentamiento vocal',
    body: 'Sigue una rutina sencilla para preparar respiracion, soporte y afinacion.',
    icon: Wind,
  },
} satisfies Record<ToolMode, { eyebrow: string; title: string; body: string; icon: typeof Mic2 }>;

export function VocalToolPage({ mode }: { mode: ToolMode }) {
  const [target, setTarget] = useState(notes[0]);
  const [micStatus, setMicStatus] = useState<'idle' | 'asking' | 'active' | 'blocked'>('idle');
  const [warmupRunning, setWarmupRunning] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const current = copy[mode];

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      void audioContextRef.current?.close();
    };
  }, []);

  const title = useMemo(() => {
    return (
      <>
        {current.title.split(' ')[0]} <span className="text-[#D4AF37]">{current.title.split(' ').slice(1).join(' ') || 'CorAM'}</span>
      </>
    );
  }, [current.title]);

  async function getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }

  async function playTone(frequency = target.frequency, duration = 0.75) {
    const context = await getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  }

  async function requestMic() {
    setMicStatus('asking');
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('active');
    } catch {
      setMicStatus('blocked');
    }
  }

  async function startWarmup() {
    setWarmupRunning(true);
    for (const note of [notes[0], notes[2], notes[3], notes[4], notes[3], notes[2], notes[0]]) {
      await playTone(note.frequency, 0.45);
      await new Promise((resolve) => window.setTimeout(resolve, 130));
    }
    setWarmupRunning(false);
  }

  return (
    <PremiumScreen>
      <div className="flex items-center justify-between gap-3">
        <BackButton fallbackTo="/app/herramientas" label="Herramientas" />
      </div>

      <AppHero eyebrow={current.eyebrow} title={title} body={current.body}>
        <div className="grid grid-cols-3 gap-2">
          {notes.slice(0, 3).map((note) => (
            <button
              key={note.key}
              type="button"
              onClick={() => {
                setTarget(note);
                void playTone(note.frequency);
              }}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left active:scale-[0.99]"
            >
              <p className="text-lg font-black text-white">{note.label}</p>
              <p className="text-[10px] font-black text-[#D4AF37]">{note.key}</p>
            </button>
          ))}
        </div>
      </AppHero>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <PremiumCard dark className="p-5">
          <SectionHeader eyebrow="Nota objetivo" title={target.label} />
          <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {notes.map((note) => (
              <button
                key={note.key}
                type="button"
                onClick={() => {
                  setTarget(note);
                  void playTone(note.frequency);
                }}
                className={`min-h-16 rounded-2xl border px-2 py-3 text-center transition active:scale-[0.98] ${
                  target.key === note.key
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-slate-950'
                    : 'border-white/10 bg-white/5 text-white'
                }`}
              >
                <span className="block text-sm font-black">{note.label}</span>
                <span className="block text-[10px] font-bold opacity-75">{note.key}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void playTone()}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#0B2545] transition active:scale-[0.99]"
          >
            <Volume2 className="h-4 w-4" />
            Escuchar {target.label}
          </button>
        </PremiumCard>

        {mode === 'tuner' && (
          <PremiumCard className="p-5">
            <BrandedIcon icon={Mic2} tone="navy" />
            <h2 className="mt-4 text-xl font-black text-[#0B2545]">Microfono</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Antes de activar el afinador, tu navegador pedira permiso para usar el microfono.
            </p>
            <button
              type="button"
              onClick={() => void requestMic()}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2545] px-4 py-3 text-sm font-black text-white transition active:scale-[0.99]"
            >
              {micStatus === 'active' ? <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" /> : <Mic2 className="h-4 w-4" />}
              {micStatus === 'active' ? 'Microfono activo' : micStatus === 'asking' ? 'Solicitando permiso...' : 'Activar microfono'}
            </button>
            {micStatus === 'blocked' && (
              <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                No se pudo activar el microfono. Revisa permisos del navegador y vuelve a intentar.
              </p>
            )}
          </PremiumCard>
        )}

        {mode === 'piano' && (
          <PremiumCard className="p-5">
            <BrandedIcon icon={Piano} tone="navy" />
            <h2 className="mt-4 text-xl font-black text-[#0B2545]">Teclado estable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cada nota se reproduce con Web Audio y se detiene sola para evitar acumulacion de sonidos.
            </p>
          </PremiumCard>
        )}

        {mode === 'warmup' && (
          <PremiumCard className="p-5">
            <BrandedIcon icon={Activity} tone="navy" />
            <h2 className="mt-4 text-xl font-black text-[#0B2545]">Rutina guiada</h2>
            <div className="mt-4 space-y-3">
              {warmupSteps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-[#0B2545]">{step.title}</p>
                    <span className="text-xs font-black text-[#B5811F]">{step.seconds}s</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => void startWarmup()}
              disabled={warmupRunning}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B2545] px-4 py-3 text-sm font-black text-white transition active:scale-[0.99] disabled:cursor-wait disabled:bg-slate-400"
            >
              {warmupRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {warmupRunning ? 'Escala en curso...' : 'Iniciar escala'}
            </button>
          </PremiumCard>
        )}
      </section>
    </PremiumScreen>
  );
}
