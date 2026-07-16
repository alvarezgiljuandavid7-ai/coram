import { useEffect, useRef, useState } from 'react';
import { Activity, CircleStop, Pause, Play, RefreshCw, Volume2, Wind } from 'lucide-react';
import { useCoramApp } from '../../../app/CoramAppContext';
import { useHerramientasVocalesModule } from '../../../components/phone/modules/HerramientasVocales';
import { BackButton } from '../../../components/app-premium/PremiumApp';
import { EditorialCard, ExperienceCanvas } from '../../../components/experience-v2/ExperienceV2';
import { createReusableAudioContext, getBrowserAudioContextClass } from '../../../domain/audio/reusableAudioContext';

const voiceClasses = ['soprano', 'alto', 'tenor', 'bajo'] as const;
const vowels = ['Mmm', 'Liii', 'Ahhh', 'Oooo'];
const noteFrequencies: Record<string, number> = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392, A: 440, B: 493.88 };

function WarmupMetric({ icon: Icon, value, label, tone = 'green' }: { icon: typeof Activity; value: string | number; label: string; tone?: 'green' | 'gold' | 'lilac' }) {
  const toneClass = tone === 'gold' ? 'bg-[#fff5df] text-[#ae7918]' : tone === 'lilac' ? 'bg-[#f4effa] text-[#8057a0]' : 'bg-[#edf6ea] text-[#4a8a55]';
  return <div className="min-w-0 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_10px_24px_rgba(11,37,69,0.06)]"><span className={`grid h-8 w-8 place-items-center rounded-xl ${toneClass}`}><Icon className="h-4 w-4" /></span><p className="mt-2 truncate text-xl font-black leading-none text-[#0B2545]">{value}</p><p className="mt-1 text-[11px] font-bold text-[#596576]">{label}</p></div>;
}

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

   function playScale() {
     if (tools.scalePlaying) return;
     // Must happen synchronously from the button press for Safari on iOS.
     audioRef.current.prepareFromUserGesture();
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
         oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime((noteFrequencies[notes[step]] ?? 261.63) * octave, now);
        gain.gain.setValueAtTime(0, now);
         gain.gain.linearRampToValueAtTime(0.36, now + 0.04);
         gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
         oscillator.stop(now + 0.55);
        step += 1;
         timeoutRef.current = window.setTimeout(() => void playNext(), 575);
      } catch {
        failPlayback();
      }
    };
     void playNext();
   }

  const phaseCopy = { idle: ['Listo', 'Respira con calma y prepara el soporte.'], inhale: ['Inhala', 'Expande el abdomen sin elevar los hombros.'], hold: ['Sostén', 'Mantén el soporte estable y relajado.'], exhale: ['Exhala', 'Suelta el aire lentamente con un sonido continuo.'] }[tools.breathingPhase];
  const notes = scaleForVoice(tools.warmupVoiceClass);

   return <ExperienceCanvas>
     <BackButton fallbackTo="/app/herramientas" label="Herramientas" />
     <section className="grid gap-4 py-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a56b09]">Voz saludable</p><h1 className="mt-2 font-serif text-[clamp(2.3rem,9.5vw,4.2rem)] leading-[0.92] text-[#0B2545]">Calentamiento</h1><div className="mt-4 h-1 w-12 rounded-full bg-[#f6bb18]" /><p className="mt-4 max-w-xl text-sm leading-6 text-[#596576] sm:text-base">Activa respiración, resonancia y rango antes del ensayo o servicio.</p></div><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf6ea] text-[#4a8a55] shadow-sm"><Wind className="h-5 w-5" /></span></section>
     <section className="grid grid-cols-3 gap-2 sm:gap-3"><WarmupMetric icon={Wind} value="4-4-8" label="Patrón" /><WarmupMetric icon={Activity} value={tools.breathingCycleCount} label="Ciclos" tone="gold" /><WarmupMetric icon={Volume2} value="9" label="Notas" tone="lilac" /></section>
     <div className="grid gap-4 xl:grid-cols-2">
       <EditorialCard className="p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a56b09]">Diafragma</p><h2 className="mt-2 font-serif text-[clamp(1.6rem,6vw,2.25rem)] leading-none text-[#0B2545]">Respiración guiada</h2><div className="py-4 text-center sm:py-6"><div className={`mx-auto grid h-32 w-32 place-items-center rounded-full border-6 transition-all duration-700 sm:h-40 sm:w-40 ${tools.breathingPhase === 'inhale' ? 'scale-105 border-sky-200 bg-sky-50 text-sky-700' : tools.breathingPhase === 'hold' ? 'border-amber-200 bg-amber-50 text-amber-700' : tools.breathingPhase === 'exhale' ? 'scale-90 border-teal-200 bg-teal-50 text-teal-700' : 'border-[#e7ecdf] bg-[#f5f8f1] text-[#4a8a55]'}`}><div><p className="font-serif text-2xl sm:text-3xl">{phaseCopy[0]}</p><p className="mt-1 text-xl font-black sm:text-2xl">{tools.breathingPhase === 'idle' ? '4 · 4 · 8' : `${tools.breathingTimer}s`}</p></div></div><p className="mx-auto mt-4 max-w-sm text-[13px] leading-5 text-[#596576]">{phaseCopy[1]}</p></div><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => tools.setBreathingActive(!tools.breathingActive)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-3 text-sm font-bold text-white focus-visible:ring-4 focus-visible:ring-[#2563eb]/25">{tools.breathingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{tools.breathingActive ? 'Pausar' : 'Iniciar'}</button><button type="button" onClick={() => { tools.setBreathingActive(false); tools.setBreathingCycleCount(0); tools.setBreathingPhase('idle'); tools.setBreathingTimer(4); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0B2545]/10 bg-white px-3 text-sm font-bold text-[#0B2545]"><RefreshCw className="h-4 w-4" /> Reiniciar</button></div></EditorialCard>
        <EditorialCard className="p-4 sm:p-5"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a56b09]">Vocalización</p><h2 className="mt-2 font-serif text-[clamp(1.6rem,6vw,2.25rem)] leading-none text-[#0B2545]">Escala con “{tools.warmupVowel}”</h2><p className="mt-3 text-[13px] leading-5 text-[#596576]">Sigue cada nota con volumen cómodo. Detén el ejercicio si aparece tensión o dolor.</p><div className="mt-4 rounded-2xl border border-[#0B2545]/8 bg-[#fffdf8] p-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">Ajusta tu registro</p><div className="mt-2 grid grid-cols-4 gap-2">{voiceClasses.map((voice) => <button type="button" key={voice} onClick={() => tools.setWarmupVoiceClass(voice)} className={`min-h-9 rounded-xl px-1 text-[10px] font-black transition focus-visible:ring-4 focus-visible:ring-[#2563eb]/20 ${tools.warmupVoiceClass === voice ? 'bg-[#2563eb] text-white shadow-[0_6px_12px_rgba(37,99,235,0.18)]' : 'border border-[#0B2545]/10 bg-white text-[#0B2545]'}`}>{voice[0].toUpperCase() + voice.slice(1)}</button>)}</div><div className="mt-2 grid grid-cols-4 gap-2">{vowels.map((vowel) => <button type="button" key={vowel} onClick={() => tools.setWarmupVowel(vowel)} className={`min-h-9 rounded-xl px-1 text-[10px] font-black transition focus-visible:ring-4 focus-visible:ring-[#2563eb]/20 ${tools.warmupVowel === vowel ? 'bg-[#2563eb] text-white shadow-[0_6px_12px_rgba(37,99,235,0.18)]' : 'border border-[#0B2545]/10 bg-white text-[#0B2545]'}`}>{vowel}</button>)}</div></div><div className="mt-4 grid grid-cols-9 items-end gap-1 rounded-[1.2rem] bg-[#f6f7f2] px-2 py-5 sm:mt-6 sm:gap-2 sm:px-3">{notes.map((note, index) => <div key={`${note}-${index}`} className="flex min-w-0 flex-col items-center gap-1"><span className={`grid h-6 w-6 place-items-center rounded-full text-[9px] font-black transition sm:h-8 sm:w-8 sm:text-[10px] ${tools.scalePlaying && tools.activeScaleStep === index ? 'scale-110 bg-[#f6bb18] text-[#0B2545] ring-4 ring-[#f6bb18]/20' : 'border border-[#0B2545]/10 bg-white text-[#596576]'}`}>{index + 1}</span><span className="text-[9px] font-bold text-[#596576] sm:text-[10px]">{note}</span></div>)}</div>{audioError && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">No fue posible iniciar el audio. Revisa el volumen del dispositivo e inténtalo de nuevo.</p>}<button type="button" disabled={tools.scalePlaying} onClick={playScale} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{tools.scalePlaying ? <CircleStop className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{tools.scalePlaying ? 'Escala en curso' : 'Reproducir escala'}</button></EditorialCard>
     </div>
   </ExperienceCanvas>;
 }
