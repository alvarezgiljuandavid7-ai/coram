import { useEffect, useRef, useState } from 'react';
import { Activity, CircleStop, Pause, Play, RefreshCw, Volume2, Wind } from 'lucide-react';
import { useCoramApp } from '../../../app/CoramAppContext';
import { useHerramientasVocalesModule } from '../../../components/phone/modules/HerramientasVocales';
import { BackButton } from '../../../components/app-premium/PremiumApp';
import { EditorialCard, EditorialHeading, ExperienceCanvas, FilterChip, MetricTile, SectionHeading } from '../../../components/experience-v2/ExperienceV2';
import { createReusableAudioContext, getBrowserAudioContextClass } from '../../../domain/audio/reusableAudioContext';

const voiceClasses = ['soprano', 'alto', 'tenor', 'bajo'] as const;
const vowels = ['Mmm', 'Liii', 'Ahhh', 'Oooo'];
const noteFrequencies: Record<string, number> = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392, A: 440, B: 493.88 };

function scaleForVoice(voice: string) {
  if (voice === 'alto') return ['A', 'B', 'C', 'D', 'E', 'D', 'C', 'B', 'A'];
  if (voice === 'bajo') return ['F', 'G', 'A', 'B', 'C', 'B', 'A', 'G', 'F'];
  return ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D', 'C'];
}

export function VocalWarmupV2() {
  const tools = useHerramientasVocalesModule();
  const { recordRecentActivity } = useCoramApp();
  const audioRef = useRef(createReusableAudioContext(getBrowserAudioContextClass()));
  const timeoutRef = useRef<number | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    void recordRecentActivity({ entityType: 'tool', entityId: 'vocal-warmup', title: 'Calentamiento vocal', route: '/app/herramientas/calentamiento', metadata: {} });
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      void audioRef.current.dispose();
    };
  }, [recordRecentActivity]);

  useEffect(() => {
    if (!tools.breathingActive) {
      tools.setBreathingPhase('idle');
      tools.setBreathingTimer(4);
      return undefined;
    }
    tools.setBreathingPhase('inhale');
    tools.setBreathingTimer(4);
    const interval = window.setInterval(() => {
      tools.setBreathingTimer((previous) => {
        if (previous > 1) return previous - 1;
        let nextTime = 4;
        tools.setBreathingPhase((phase) => {
          if (phase === 'inhale') return 'hold';
          if (phase === 'hold') { nextTime = 8; return 'exhale'; }
          tools.setBreathingCycleCount((count) => count + 1);
          return 'inhale';
        });
        return nextTime;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [tools.breathingActive]);

  async function playScale() {
    if (tools.scalePlaying) return;
    const notes = scaleForVoice(tools.warmupVoiceClass);
    tools.setScalePlaying(true);
    setAudioError(false);
    let step = 0;
    const failPlayback = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      tools.setScalePlaying(false);
      tools.setActiveScaleStep(-1);
      setAudioError(true);
    };
    const playNext = async () => {
      try {
        if (step >= notes.length) {
          tools.setScalePlaying(false);
          tools.setActiveScaleStep(-1);
          timeoutRef.current = null;
          return;
        }
        tools.setActiveScaleStep(step);
        const context = await audioRef.current.get();
        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const octave = tools.warmupVoiceClass === 'bajo' ? 0.35 : tools.warmupVoiceClass === 'tenor' ? 0.5 : 1;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime((noteFrequencies[notes[step]] ?? 261.63) * octave, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.45);
        step += 1;
        timeoutRef.current = window.setTimeout(() => void playNext(), 450);
      } catch {
        failPlayback();
      }
    };
    await playNext();
  }

  const phaseCopy = { idle: ['Listo', 'Respira con calma y prepara el soporte.'], inhale: ['Inhala', 'Expande el abdomen sin elevar los hombros.'], hold: ['Sostén', 'Mantén el soporte estable y relajado.'], exhale: ['Exhala', 'Suelta el aire lentamente con un sonido continuo.'] }[tools.breathingPhase];
  const notes = scaleForVoice(tools.warmupVoiceClass);

  return <ExperienceCanvas>
    <BackButton fallbackTo="/app/herramientas" label="Herramientas" />
    <EditorialHeading eyebrow="Voz saludable" title="Calentamiento" body="Activa respiración, resonancia y rango con una rutina guiada antes del ensayo o servicio." icon={Wind} />
    <section className="grid gap-3 sm:grid-cols-3"><MetricTile label="Patrón" value="4-4-8" detail="Respiración" icon={Wind} /><MetricTile label="Ciclos" value={tools.breathingCycleCount} detail="Completados" icon={Activity} tone="gold" /><MetricTile label="Escala" value="9" detail="Pasos guiados" icon={Volume2} tone="lilac" /></section>

    <EditorialCard className="p-5"><SectionHeading eyebrow="Configuración" title="Ajusta tu registro" /><div className="mt-5 flex gap-2 overflow-x-auto pb-1">{voiceClasses.map((voice) => <FilterChip key={voice} active={tools.warmupVoiceClass === voice} label={voice[0].toUpperCase() + voice.slice(1)} onClick={() => tools.setWarmupVoiceClass(voice)} />)}</div><div className="mt-4 flex gap-2 overflow-x-auto pb-1">{vowels.map((vowel) => <FilterChip key={vowel} active={tools.warmupVowel === vowel} label={vowel} onClick={() => tools.setWarmupVowel(vowel)} />)}</div></EditorialCard>

    <div className="grid gap-5 xl:grid-cols-2">
      <EditorialCard className="p-5"><SectionHeading eyebrow="Diafragma" title="Respiración guiada" /><div className="py-7 text-center"><div className={`mx-auto grid h-44 w-44 place-items-center rounded-full border-8 transition-all duration-700 ${tools.breathingPhase === 'inhale' ? 'scale-110 border-sky-200 bg-sky-50 text-sky-700' : tools.breathingPhase === 'hold' ? 'border-amber-200 bg-amber-50 text-amber-700' : tools.breathingPhase === 'exhale' ? 'scale-90 border-teal-200 bg-teal-50 text-teal-700' : 'border-[#e7ecdf] bg-[#f5f8f1] text-[#4a8a55]'}`}><div><p className="font-serif text-3xl">{phaseCopy[0]}</p><p className="mt-2 text-2xl font-black">{tools.breathingPhase === 'idle' ? '4 · 4 · 8' : `${tools.breathingTimer}s`}</p></div></div><p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-[#596576]">{phaseCopy[1]}</p></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => tools.setBreathingActive(!tools.breathingActive)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4a8a55] px-4 text-sm font-bold text-white focus-visible:ring-4 focus-visible:ring-[#4a8a55]/25">{tools.breathingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{tools.breathingActive ? 'Pausar' : 'Iniciar'}</button><button type="button" onClick={() => { tools.setBreathingActive(false); tools.setBreathingCycleCount(0); tools.setBreathingPhase('idle'); tools.setBreathingTimer(4); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#0B2545]/10 bg-white px-4 text-sm font-bold"><RefreshCw className="h-4 w-4" /> Reiniciar</button></div></EditorialCard>

      <EditorialCard className="p-5"><SectionHeading eyebrow="Vocalización" title={`Escala con “${tools.warmupVowel}”`} /><p className="mt-3 text-sm leading-6 text-[#596576]">Sigue cada nota con volumen cómodo. Detén el ejercicio si aparece tensión o dolor.</p><div className="mt-8 flex min-h-44 items-center justify-between gap-1 rounded-[1.4rem] bg-[#f6f7f2] px-3 py-6">{notes.map((note, index) => <div key={`${note}-${index}`} style={{ transform: `translateY(-${[0,8,16,24,32,24,16,8,0][index]}px)` }} className="flex min-w-0 flex-1 flex-col items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-black transition ${tools.scalePlaying && tools.activeScaleStep === index ? 'scale-110 bg-[#f6bb18] text-[#0B2545] ring-4 ring-[#f6bb18]/20' : 'border border-[#0B2545]/10 bg-white text-[#596576]'}`}>{index + 1}</span><span className="text-[10px] font-bold text-[#596576]">{note}</span></div>)}</div>{audioError && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">No fue posible iniciar el audio. Revisa el volumen del dispositivo e inténtalo de nuevo.</p>}<button type="button" disabled={tools.scalePlaying} onClick={() => void playScale()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0B2545] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{tools.scalePlaying ? <CircleStop className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{tools.scalePlaying ? 'Escala en curso' : 'Reproducir escala'}</button></EditorialCard>
    </div>
  </ExperienceCanvas>;
}
