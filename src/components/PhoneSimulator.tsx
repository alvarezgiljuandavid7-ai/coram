import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoramLogo } from './CoramLogo';
import { transposeChords } from '../domain/corarios/chords';
import {
  getSectionPrice as getConfiguredSectionPrice,
  isSectionLocked as isConfiguredSectionLocked,
} from '../domain/monetization/access';
import { toggleCourseEnrollment, toggleFavoriteCorario } from '../domain/profile/profileActions';
import { createReusableAudioContext, getBrowserAudioContextClass } from '../domain/audio/reusableAudioContext';
import { getHeldPitchState } from '../domain/audio/pitchHold';
import { getTunerMatchScore } from '../domain/audio/tunerMatch';
import type { Hymn } from '../domain/hymns/types';
import {
  useAcademiaModule,
  useCheckoutModule,
  useCorariosModule,
  useHerramientasVocalesModule,
  useHimnarioModule,
  usePerfilModule,
} from './phone/modules';
import { 
  BookOpen, 
  BookOpenCheck,
  Search, 
  Heart, 
  Share2, 
  Download, 
  ArrowLeft, 
  ChevronRight, 
  Award, 
  Star, 
  PlayCircle, 
  User, 
  Compass, 
  Zap, 
  PhoneCall, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Lock,
  LogOut,
  SlidersHorizontal,
  Home as HomeIcon,
  HelpCircle,
  Copy,
  Volume2,
  VolumeX,
  Plus,
  Mic2,
  Music,
  Book,
  Wind,
  Check,
  DollarSign
} from 'lucide-react';
import { Corario, Course, Resource, MentorshipSession, Sponsor, UserProfile } from '../types';

const DEMO_RUNTIME_ENABLED = import.meta.env.DEV || import.meta.env.VITE_CORAM_ENABLE_DEMO === 'true';

const HYMNS_DATA: Hymn[] = [
  {
    id: 'hymn-1',
    number: 14,
    title: 'Sublime Gracia',
    hymnal: 'fe',
    hymnalName: 'Himnario de Fe y Devoción',
    key: 'G',
    chords: ['G', 'C', 'D7', 'Em'],
    lyrics: `[Estrofa 1]
Sublime gracia del Señor,
Que a un pecador salvó;
Fui ciego mas hoy veo yo,
Perdido y Él me halló.

[Estrofa 2]
Su gracia me enseñó a temer,
Mis dudas ahuyentó;
¡Oh, cuán precioso de obtener,
El día en que Él me halló!

[Coro]
¡En la cruz, en la cruz,
Do primero vi la luz,
Y las manchas de mi alma lavé!
Fue allí por fe que vi a Jesús,
Y siempre feliz con Él seré.

[Estrofa 3]
En los peligros o aflicción
Que he tenido aquí,
Su gracia siempre me libró,
Y me guiará feliz.`
  },
  {
    id: 'hymn-2',
    number: 84,
    title: 'Cuán Grande es Él',
    hymnal: 'gloria',
    hymnalName: 'Himnario de Gloria',
    key: 'A',
    chords: ['A', 'D', 'E7', 'F#m'],
    lyrics: `[Estrofa 1]
Señor, mi Dios, al contemplar los cielos,
El firmamento y las estrellas mil;
Al oír tu voz en los potentes truenos
Y ver brillar al sol en su cenit.

[Coro]
Mi corazón entona la canción:
¡Cuán grande es Él! ¡Cuán grande es Él!
Mi corazón entona la canción:
¡Cuán grande es Él! ¡Cuán grande es Él!

[Estrofa 2]
Al recorrer los montes y los valles
Y ver las bellas flores al pasar;
Al escuchar el canto de las aves
Y el murmurar del claro manantial.

[Estrofa 3]
Cuando recuerdo del amor divino,
Que Dios al hijo pródigo entregó;
Y cómo allá en la cruz por mi camino
Su propia vida alegremente dio.`
  },
  {
    id: 'hymn-3',
    number: 112,
    title: 'Lluvia de Bendiciones',
    hymnal: 'lluvia',
    hymnalName: 'Lluvia de Bendiciones',
    key: 'Bb',
    chords: ['Bb', 'Eb', 'F', 'Gm'],
    lyrics: `[Estrofa 1]
Lluvia de bendiciones,
Lluvia de bendiciones necesitamos, Señor;
Manda lluvias de gracia,
Lluvias de paz y de amor.

[Coro]
Manda la lluvia de vida,
Manda tu Espíritu, oh Dios;
Manda la lluvia divina,
Sobre tu siervo de honor.

[Estrofa 2]
Lluvia de bendiciones,
Trae consuelo al dolor;
Llena de santa unción,
La casa de oración, Señor.

[Estrofa 3]
Manda tu gracia abundante,
Como torrente de paz;
Que cada alma sedienta
Sienta tu gloria y poder más.`
  },
  {
    id: 'hymn-4',
    number: 45,
    title: 'Hay Poder en Jesús',
    hymnal: 'gloria',
    hymnalName: 'Himnario de Gloria',
    key: 'F',
    chords: ['F', 'Bb', 'C7', 'Dm'],
    lyrics: `[Estrofa 1]
¿Quieres ser salvo de toda maldad?
Tan sólo hay poder en mi Jesús;
¿Quieres vivir y gozar de su paz?
Tan sólo hay poder en la cruz.

[Coro]
Hay poder, poder, sin igual poder,
En Jesús que murió;
Hay poder, poder, sin igual poder,
En la sangre que Él vertió.

[Estrofa 2]
¿Quieres ser libre de orgullo y pasión?
Tan sólo hay poder en mi Jesús;
Pide al Señor un limpio corazón,
Tan sólo hay poder en la cruz.

[Estrofa 3]
¿Quieres servir a tu Rey y Señor?
Tan sólo hay poder en mi Jesús;
Ven a su altar a cantar su loor,
Tan sólo hay poder en la cruz.`
  },
  {
    id: 'hymn-5',
    number: 5,
    title: 'En la Cruz',
    hymnal: 'fe',
    hymnalName: 'Himnario de Fe y Devoción',
    key: 'E',
    chords: ['E', 'A', 'B7', 'C#m'],
    lyrics: `[Estrofa 1]
Me hirió el pecado, fui a Jesús,
Mostréle mi dolor;
Y con la fe en su santa cruz,
Hallé el consolador.

[Coro]
En la cruz, en la cruz, do primero vi la luz,
Y las manchas de mi alma lavé;
Fue allí por la fe que vi a Jesús,
Y siempre feliz con Él seré.

[Estrofa 2]
Venció la muerte con gran poder,
Y al cielo ascendió;
Mandó al Consolador para ser,
El guía que me guio.

[Estrofa 3]
Incomparable es su santo amor,
Que me libertará;
Por siempre cantaré a mi Salvador,
Su gracia no fallará.`
  }
];

interface PhoneSimulatorProps {
  corarios: Corario[];
  courses: Course[];
  resources: Resource[];
  sponsors: Sponsor[];
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  mentorships: MentorshipSession[];
  monetizationSettings?: { id: string; name: string; isPremium: boolean; price: string }[];
  immersive?: boolean;
  onSignOut?: () => Promise<void> | void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export function getPhoneSimulatorLayout(immersive: boolean) {
  if (immersive) {
    return {
      rootClassName:
        'relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-950',
      screenClassName:
        'h-full w-full overflow-hidden relative flex flex-col transition-colors duration-300',
      showDeviceChrome: false,
    };
  }

  return {
    rootClassName:
      'relative w-full max-w-[370px] h-[720px] mx-auto bg-slate-950 rounded-[48px] shadow-2xl p-3 border-4 border-slate-900 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-indigo-950/20',
    screenClassName:
      'w-full h-full rounded-[36px] overflow-hidden relative flex flex-col transition-colors duration-300',
    showDeviceChrome: true,
  };
}

export function getInitialPhoneScreen(): string {
  return 'home';
}

export function getAdminShortcutLabel(isAdmin: boolean): string | null {
  void isAdmin;
  return null;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  corarios,
  courses,
  resources,
  sponsors,
  profile,
  setProfile,
  mentorships,
  monetizationSettings = [],
  immersive = false,
  onSignOut,
}) => {
  const layout = getPhoneSimulatorLayout(immersive);

  // Mobile navigation state
  const [currentScreen, setCurrentScreen] = useState<string>(getInitialPhoneScreen);
  const [selectedCorario, setSelectedCorario] = useState<Corario | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [onboardingIndex, setOnboardingIndex] = useState<number>(0);

  // General Notification Alert (Toaster)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isSectionLocked = (sectionId: string): boolean => {
    return isConfiguredSectionLocked(sectionId, monetizationSettings, profile);
  };

  const getSectionPrice = (sectionId: string): string => {
    return getConfiguredSectionPrice(sectionId, monetizationSettings);
  };

  const {
    showCartCheckout,
    setShowCartCheckout,
    checkoutItemName,
    checkoutItemPrice,
    checkoutTargetId,
    paymentMethod,
    setPaymentMethod,
    cardNumber,
    setCardNumber,
    cardName,
    setCardName,
    checkoutProcessing,
    checkoutSuccess,
    handleOpenCheckout,
    handleUnavailablePayment,
  } = useCheckoutModule({ getSectionPrice, showToast });

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    transposeOffset,
    setTransposeOffset,
    fontSize,
    setFontSize,
    metronomeBPM,
    setMetronomeBPM,
  } = useCorariosModule({ selectedCorario });

  const { isDarkMode, toggleDarkMode } = usePerfilModule({ showToast });

  // Paywall Modal state
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [paywallReason, setPaywallReason] = useState<string>('');

  // Metronome states
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [timeSignature, setTimeSignature] = useState<number>(4);
  const [metronomeVolume, setMetronomeVolume] = useState<number>(0.5);

  // Course Tutorial video interactive player states
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLessonPlaying, setIsLessonPlaying] = useState<boolean>(false);
  const { lessonProgress, setLessonProgress } = useAcademiaModule({
    activeLessonId,
    isLessonPlaying,
    playbackSpeed,
  });

  // --- HIMNARIOS STATES ---
  const {
    selectedHymnalFilter,
    setSelectedHymnalFilter,
    hymnSearchQuery,
    setHymnSearchQuery,
    hymnsData,
    hymnCollections,
    hymnsLoading,
    hymnsError,
    selectedHymn,
    setSelectedHymn,
    hymnTranspose,
    setHymnTranspose,
  } = useHimnarioModule({ demoRuntimeEnabled: DEMO_RUNTIME_ENABLED, demoHymns: HYMNS_DATA });

  // --- VOCAL WARM-UP STATES ---
  const {
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
  } = useHerramientasVocalesModule();

  // Interactive tuner Web Audio context refs to prevent memory leaks and shut down correctly!
  const micStreamRef = useRef<MediaStream | null>(null);
  const tunerAudioContextRef = useRef<AudioContext | null>(null);
  const tunerAnimationFrameIdRef = useRef<number | null>(null);
  const pianoAudioRef = useRef(createReusableAudioContext(getBrowserAudioContextClass()));
  const lastDetectedPitchRef = useRef<{ note: string | null; frequency: number | null; detectedAt: number }>({
    note: null,
    frequency: null,
    detectedAt: 0,
  });

  const beatRef = useRef<number>(1);
  beatRef.current = currentBeat;

  const tunerSelectedChordRef = useRef<string>('C');
  tunerSelectedChordRef.current = tunerSelectedChord;

  const tunerVoiceTypeRef = useRef<'grave' | 'aguda'>('grave');
  tunerVoiceTypeRef.current = tunerVoiceType;

  const tunerChordTypeRef = useRef<'mayor' | 'menor'>('mayor');
  tunerChordTypeRef.current = tunerChordType;

  // Sync metronome BPM when a specific song is loaded
  useEffect(() => {
    if (selectedCorario) {
      setMetronomeBPM(selectedCorario.tempo || 90);
      setIsMetronomePlaying(false);
      setCurrentBeat(1);
    }
  }, [selectedCorario]);

  // Audio synthesis ticking scheduler
  useEffect(() => {
    if (!isMetronomePlaying) return;

    let audioContext: AudioContext | null = null;

    const playTick = (beat: number) => {
      try {
        if (!audioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Subtly high-pitch first beat
        const isFirst = beat === 1;
        osc.frequency.setValueAtTime(isFirst ? 1100 : 650, audioContext.currentTime);

        gain.gain.setValueAtTime(metronomeVolume * 0.45, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        console.warn('Audio click context issue:', e);
      }
    };

    const intervalMs = (60 / metronomeBPM) * 1000;
    playTick(beatRef.current);

    const interval = setInterval(() => {
      setCurrentBeat(prev => {
        const next = prev >= timeSignature ? 1 : prev + 1;
        playTick(next);
        return next;
      });
    }, intervalMs);

    return () => {
      clearInterval(interval);
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
    };
  }, [isMetronomePlaying, metronomeBPM, timeSignature, metronomeVolume]);


  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Breathing Coach timer side-effect
  useEffect(() => {
    if (!breathingActive) {
      setBreathingPhase('idle');
      setBreathingTimer(4);
      return;
    }

    setBreathingPhase('inhale');
    setBreathingTimer(4);

    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          // Phase transition
          let nextPhase: 'inhale' | 'hold' | 'exhale' | 'idle' = 'inhale';
          let nextTime = 4;
          
          setBreathingPhase(curr => {
            if (curr === 'inhale') {
              nextPhase = 'hold';
              nextTime = 4;
            } else if (curr === 'hold') {
              nextPhase = 'exhale';
              nextTime = 8;
            } else {
              nextPhase = 'inhale';
              nextTime = 4;
              setBreathingCycleCount(c => c + 1);
            }
            return nextPhase;
          });
          
          return nextTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  // Dynamic Scale Audio Synthesizer for warm-ups (sequential EMs)
  const playVocalWarmupScale = () => {
    if (scalePlaying) return;
    
    let scaleNotes = ['C', 'D', 'E', 'F', 'G', 'F', 'E', 'D', 'C'];
    if (warmupVoiceClass === 'alto') {
      scaleNotes = ['A', 'B', 'C', 'D', 'E', 'D', 'C', 'B', 'A'];
    } else if (warmupVoiceClass === 'bajo') {
      scaleNotes = ['F', 'G', 'A', 'B', 'C', 'B', 'A', 'G', 'F'];
    }
    
    const isSoprano = warmupVoiceClass === 'soprano';
    const isAlto = warmupVoiceClass === 'alto';
    const isTenor = warmupVoiceClass === 'tenor';
    const isBajo = warmupVoiceClass === 'bajo';

    setScalePlaying(true);
    setActiveScaleStep(0);

    let currentStep = 0;
    
    const playNextStep = async () => {
      if (currentStep >= scaleNotes.length) {
        setScalePlaying(false);
        setActiveScaleStep(-1);
        return;
      }

      setActiveScaleStep(currentStep);
      const noteName = scaleNotes[currentStep];
      
      try {
        const audioCtx = await pianoAudioRef.current.get();
        const now = audioCtx.currentTime;

        const masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        
        // Balanced physical warmup volume
        masterGain.gain.setValueAtTime(0.45, now);

        const noteFreqs: Record<string, number> = {
          'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63, 'F': 349.23,
          'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
        
        let baseFreq = noteFreqs[noteName] || 261.63;
        
        // Audio transpositions for pitch ranges of registries
        if (isTenor) {
          baseFreq = baseFreq * 0.5;
        } else if (isBajo) {
          baseFreq = baseFreq * 0.35;
        } else if (isAlto && (noteName === 'A' || noteName === 'B')) {
          baseFreq = baseFreq * 0.5;
        }

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        const gain2 = audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.35, now + 0.04);
        gain1.gain.exponentialRampToValueAtTime(0.08, now + 0.25);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 2, now);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.02, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterGain);
        gain2.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        
      } catch (err) {
        console.warn('Vocal warmup play error:', err);
      }

      currentStep++;
      // Cascade timeout triggers next scale note beautifully
      setTimeout(playNextStep, 450);
    };

    playNextStep();
  };

  // Handle splash auto-timer or transition on click
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // --- INTERACTIVE VOCAL EAR TUNER & CHORD MATCHING SERVICES ---
  
  const CHORD_ROOT_INDEXES: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Calculate the shortest semitone distance (with key-wrapping on 12 tones) to any target chord note
  const getMinSemitoneDistanceToChord = (detectedNote: string, targetNotes: string[]): number => {
    const idxDetected = NOTE_NAMES.indexOf(detectedNote);
    if (idxDetected === -1) return 12;
    
    let minDistance = 12;
    targetNotes.forEach((tgt) => {
      const idxTgt = NOTE_NAMES.indexOf(tgt);
      if (idxTgt !== -1) {
        const d1 = Math.abs(idxDetected - idxTgt);
        const d2 = 12 - d1;
        const dist = Math.min(d1, d2);
        if (dist < minDistance) {
          minDistance = dist;
        }
      }
    });
    return minDistance;
  };

  // Resolve notes belonging to the selected reference chord
  const getChordNotes = (root: string, type: 'mayor' | 'menor'): string[] => {
    const rootIdx = CHORD_ROOT_INDEXES[root] ?? 0;
    const intervals = type === 'mayor' ? [0, 4, 7] : [0, 3, 7]; // standard Maj / min triad interval
    return intervals.map((semitones) => NOTE_NAMES[(rootIdx + semitones) % 12]);
  };

  // Obtain root pitch frequency in hertz, lowered by one octave if "Grave" is selected
  const getChordRootFreq = (root: string, voiceType: 'grave' | 'aguda'): number => {
    const baseFreqs: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63, 'F': 349.23,
      'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    const base = baseFreqs[root] ?? 261.63; // scale octave C4
    return voiceType === 'grave' ? base * 0.5 : base; // C3 (130Hz) for grave, C4 for aguda
  };

  const NOTE_SPANISH: Record<string, string> = {
    'C': 'DO', 'C#': 'DO#', 'D': 'RE', 'D#': 'RE#', 'E': 'MI', 'F': 'FA', 
    'F#': 'FA#', 'G': 'SOL', 'G#': 'SOL#', 'A': 'LA', 'A#': 'LA#', 'B': 'SI'
  };

  // Real Acoustic Piano Single Note Synthesis: replicates physical piano string decay, overtones and a wooden hammer click
  const playPianoSingleNote = async (noteName: string) => {
    try {
      const audioCtx = await pianoAudioRef.current.get();
      const now = audioCtx.currentTime;

      // Master gain
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.65, now);
      masterGain.connect(audioCtx.destination);

      const baseFreq = getChordRootFreq(noteName, tunerVoiceType);

      // Acoustic Piano harmonics: fundamental + string overtones
      const harmonics = [
        { freqMult: 1, gainMult: 0.70, decayMult: 1.0 },
        { freqMult: 2, gainMult: 0.35, decayMult: 0.8 },
        { freqMult: 3, gainMult: 0.18, decayMult: 0.6 },
        { freqMult: 4, gainMult: 0.08, decayMult: 0.4 },
        { freqMult: 5, gainMult: 0.04, decayMult: 0.3 }
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

      // Wood body hammer click
      const hammerOsc = audioCtx.createOscillator();
      const hammerGain = audioCtx.createGain();
      hammerOsc.type = 'triangle';
      hammerOsc.frequency.setValueAtTime(baseFreq * 5.5, now);

      hammerGain.gain.setValueAtTime(0.0, now);
      hammerGain.gain.linearRampToValueAtTime(0.12, now + 0.001);
      hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      hammerOsc.connect(hammerGain);
      hammerGain.connect(masterGain);

      hammerOsc.start(now);
      hammerOsc.stop(now + 0.05);

    } catch (err) {
      console.error("Piano note playback error", err);
    }
  };

  // Real Acoustic Piano Chord Synthesis: replicates physical piano string layers, hammer strikes, and natural sustain decay
  const playChordRef = async (root: string, type: 'mayor' | 'menor', voiceType: 'grave' | 'aguda') => {
    try {
      const audioCtx = await pianoAudioRef.current.get();
      const now = audioCtx.currentTime;

      // Master gain
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.55, now);
      masterGain.connect(audioCtx.destination);

      const getNoteFreqLocal = (n: string): number => {
        const baseFreqs: Record<string, number> = {
          'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63, 'F': 349.23,
          'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
        const f = baseFreqs[n] ?? 261.63;
        return voiceType === 'grave' ? f * 0.5 : f; // C3 or C4
      };

      // Play as beautiful 3-note piano chord (Tonic, Third, Fifth)
      const chordNotes = getChordNotes(root, type);
      
      chordNotes.forEach((noteName, chordIdx) => {
        const baseFreq = getNoteFreqLocal(noteName);
        if (!baseFreq) return;

        // Slight strum delay
        const noteStartTime = now + chordIdx * 0.04;

        // Acoustic Piano string harmonics
        const harmonics = [
          { freqMult: 1, gainMult: 0.60, decayMult: 1.0 },
          { freqMult: 2, gainMult: 0.28, decayMult: 0.8 },
          { freqMult: 3, gainMult: 0.14, decayMult: 0.6 },
          { freqMult: 4, gainMult: 0.07, decayMult: 0.4 },
          { freqMult: 5, gainMult: 0.03, decayMult: 0.3 }
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

        // Add acoustic wooden body hammer click
        const hammerOsc = audioCtx.createOscillator();
        const hammerGain = audioCtx.createGain();
        hammerOsc.type = 'triangle';
        hammerOsc.frequency.setValueAtTime(baseFreq * 5, noteStartTime);

        hammerGain.gain.setValueAtTime(0, noteStartTime);
        hammerGain.gain.linearRampToValueAtTime(0.10, noteStartTime + 0.001);
        hammerGain.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.045);

        hammerOsc.connect(hammerGain);
        hammerGain.connect(masterGain);

        hammerOsc.start(noteStartTime);
        hammerOsc.stop(noteStartTime + 0.05);
      });

    } catch (err) {
      console.error("Piano chord playback error", err);
      showToast("Activa los permisos de sonido para el entrenador vocal.");
    }
  };

  // Autocorrelation voice Pitch Detection algorithm (Real-time DSP)
  const autoCorrelateFrequency = (buffer: Float32Array, sampleRate: number): number => {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }
    const rms = Math.sqrt(sumOfSquares / SIZE);
    if (rms < 0.012) {
      return -1; // low ambient noise gate filtering
    }

    // Set sample boundaries
    let r1 = 0;
    let r2 = SIZE - 1;
    const clippingThreshold = 0.99;
    
    // Check signal stability or massive clipping
    let isClipped = false;
    for (let i = 0; i < SIZE; i++) {
      if (Math.abs(buffer[i]) > clippingThreshold) {
        isClipped = true;
        break;
      }
    }
    
    // Trim zero boundaries if not clipped
    if (!isClipped) {
      const noiseGate = 0.02;
      for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buffer[i]) < noiseGate) { r1 = i; break; }
      }
      for (let i = SIZE - 1; i > SIZE / 2; i--) {
        if (Math.abs(buffer[i]) < noiseGate) { r2 = i; break; }
      }
    }

    const trimmed = buffer.subarray(r1, r2);
    const trimmedSize = trimmed.length;
    if (trimmedSize < 256) return -1; // buffer anomaly guard

    const correlation = new Float32Array(trimmedSize);
    for (let lag = 0; lag < trimmedSize; lag++) {
      let accum = 0;
      for (let j = 0; j < trimmedSize - lag; j++) {
        accum += trimmed[j] * trimmed[j + lag];
      }
      correlation[lag] = accum;
    }

    // Find first primary peak
    let peakIndex = 0;
    while (correlation[peakIndex] > correlation[peakIndex + 1]) {
      peakIndex++;
      if (peakIndex >= trimmedSize - 1) return -1;
    }

    let maxVal = -1;
    let bestLag = -1;
    for (let lag = peakIndex; lag < trimmedSize; lag++) {
      if (correlation[lag] > maxVal) {
        maxVal = correlation[lag];
        bestLag = lag;
      }
    }

    let fundamentalLag = bestLag;

    // Parabolic interpolation for sub-Hz microtonal tuning precision
    if (fundamentalLag > 0 && fundamentalLag < trimmedSize - 1) {
      const x0 = correlation[fundamentalLag - 1];
      const x1 = correlation[fundamentalLag];
      const x2 = correlation[fundamentalLag + 1];
      const denominator = x0 + x2 - 2 * x1;
      if (denominator !== 0) {
        const offset = (x2 - x0) / (2 * denominator);
        fundamentalLag = fundamentalLag - offset;
      }
    }

    return sampleRate / fundamentalLag;
  };

  // Launch microphone recorder and feed audio buffer to pitch calculator
  const startLiveTuner = async () => {
    if (tunerActive) {
      cleanupTunerInstance();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      tunerAudioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      setTunerActive(true);
      setTunerMatchScore('idle');
      showToast("Micrófono activado. ¡Canta tu acorde en el micrófono!");

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      const updatePitch = () => {
        if (!tunerAudioContextRef.current || audioCtx.state === 'closed') return;

        analyser.getFloatTimeDomainData(dataArray);
        const freq = autoCorrelateFrequency(dataArray, audioCtx.sampleRate);

        if (freq !== -1 && freq > 60 && freq < 1200) {
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const noteNum = 12 * (Math.log(freq / 220) / Math.log(2)); // relative to A3 (220Hz)
          const midi = Math.round(noteNum) + 57; // A3 MIDI is 57
          const noteIdx = (midi % 12 + 12) % 12;
          const detectedVal = noteNames[noteIdx];
          const roundedFreq = Math.round(freq * 10) / 10;

          lastDetectedPitchRef.current = {
            note: detectedVal,
            frequency: roundedFreq,
            detectedAt: performance.now(),
          };

          setTunerDetectedFreq(roundedFreq);
          setTunerDetectedNote(detectedVal);

          // Standard reference frequency for selected target note
          const targetFreq = getChordRootFreq(tunerSelectedChordRef.current, tunerVoiceTypeRef.current);
          let bestTargetFreq = targetFreq;
          let minDiff = Math.abs(freq - targetFreq);
          
          // Test octaves 0.25x, 0.5x, 1x, 2x, 4x to find the user's register range
          [0.25, 0.5, 1, 2, 4].forEach(mult => {
            const tempFreq = targetFreq * mult;
            const tempDiff = Math.abs(freq - tempFreq);
            if (tempDiff < minDiff) {
              minDiff = tempDiff;
              bestTargetFreq = tempFreq;
            }
          });

          // Calculate deviation in cents relative to the closest octave of target note
          const centsDiff = Math.round(1200 * Math.log2(freq / bestTargetFreq));
          setTunerDeviation(centsDiff);

          setTunerMatchScore(
            getTunerMatchScore({
              detectedNote: detectedVal,
              targetNote: tunerSelectedChordRef.current,
              centsDiff,
            }),
          );
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

          setTunerDetectedFreq(heldPitch.frequency);
          setTunerDetectedNote(heldPitch.note);
          if (!heldPitch.held) {
            setTunerMatchScore('idle');
          }
        }

        tunerAnimationFrameIdRef.current = requestAnimationFrame(updatePitch);
      };

      tunerAnimationFrameIdRef.current = requestAnimationFrame(updatePitch);

    } catch (err) {
      console.error("Mic tuner failure", err);
      setTunerMicError(true);
      showToast("Micrófono no disponible. Puedes usar el Teclado de Piano abajo.");
      cleanupTunerInstance();
    }
  };

  // Simulated keyboard click for voice training: helps test reactions, indicators, and color changes
  const simulateTunerVoiceNote = (note: string) => {
    setTunerActive(true);
    
    const noteFreqs: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63, 'F': 349.23,
      'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    const baseFreq = noteFreqs[note] || 261.63;
    const voiceFreq = tunerVoiceTypeRef.current === 'grave' ? baseFreq * 0.5 : baseFreq;
    
    setTunerDetectedFreq(Math.round(voiceFreq * 10) / 10);
    setTunerDetectedNote(note);

    let centsDiff = 0;
    if (note === tunerSelectedChordRef.current) {
      centsDiff = [0, 6, -5, 10, -8][Math.floor(Math.random() * 5)];
    } else {
      centsDiff = [35, -45, 28, -32][Math.floor(Math.random() * 4)];
    }
    setTunerDeviation(centsDiff);

    setTunerMatchScore(
      getTunerMatchScore({
        detectedNote: note,
        targetNote: tunerSelectedChordRef.current,
        centsDiff,
      }),
    );

    showToast(`Simulando voz: ${NOTE_SPANISH[note] || note}`);
  };

  const cleanupTunerInstance = () => {
    if (tunerAnimationFrameIdRef.current) {
      cancelAnimationFrame(tunerAnimationFrameIdRef.current);
      tunerAnimationFrameIdRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      micStreamRef.current = null;
    }
    if (tunerAudioContextRef.current) {
      tunerAudioContextRef.current.close().catch(() => {});
      tunerAudioContextRef.current = null;
    }
    pianoAudioRef.current.dispose().catch(() => {});
    setTunerActive(false);
    setTunerDetectedFreq(null);
    setTunerDetectedNote(null);
    setTunerMatchScore('idle');
    lastDetectedPitchRef.current = { note: null, frequency: null, detectedAt: 0 };
  };

  // Close recording streaming automatically if they switch away or log out
  useEffect(() => {
    return () => {
      cleanupTunerInstance();
    };
  }, []);

  useEffect(() => {
    if (currentScreen !== 'vocal-tuner') {
      cleanupTunerInstance();
    }
  }, [currentScreen]);


  // Helper: toggle favorite
  const toggleFavorite = (corarioId: string) => {
    const isFav = profile.favoriteCorarios.includes(corarioId);
    setProfile((prev) => toggleFavoriteCorario(prev, corarioId));
    showToast(isFav ? 'Eliminado de tus favoritos.' : 'A\u00f1adido a tus favoritos.');
  };

  // Helper: enroll course
  const toggleEnroll = (courseId: string) => {
    const isEnrolled = profile.enrolledCourses.includes(courseId);
    if (isEnrolled) {
      showToast('Ya est\u00e1s inscrito en este curso.');
      return;
    }
    setProfile((prev) => toggleCourseEnrollment(prev, courseId));
    showToast('\u00a1Inscripci\u00f3n completada con \u00e9xito!');
  };

  // Helper: download resources during the free launch
  const handleResourceClick = (res: Resource) => {
    showToast(`Descargando ${res.title}... ¡Guardado en tu dispositivo!`);
  };

  // Header Component for inside screens
  const InnerHeader = ({ 
    title, 
    showBack = true, 
    backTo = 'home',
    titleLayoutId
  }: { 
    title: string; 
    showBack?: boolean; 
    backTo?: string;
    titleLayoutId?: string;
  }) => (
    <div className={`flex items-center justify-between px-4 py-3 border-b shadow-xs sticky top-0 z-10 transition-colors ${
      isDarkMode ? 'bg-slate-800 border-slate-750 text-white' : 'bg-white border-gray-100 text-slate-900'
    }`}>
      <div className="flex items-center space-x-2">
        {showBack && (
          <button 
            id={`btn-back-to-${backTo}`}
            onClick={() => {
              if (backTo === 'corarios-list') setSelectedCorario(null);
              if (backTo === 'academy') setSelectedCourse(null);
              setCurrentScreen(backTo);
            }} 
            className={`p-1 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-100 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {titleLayoutId ? (
          <motion.span 
            layoutId={titleLayoutId}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={`font-sans font-bold tracking-tight text-md block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            {title}
          </motion.span>
        ) : (
          <span className={`font-sans font-bold tracking-tight text-md block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{title}</span>
        )}
      </div>
      <div className="flex items-center space-x-1">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center space-x-1">
          <Sparkles className="w-2.5 h-2.5 fill-current" />
          <span>GRATIS</span>
        </span>
      </div>
    </div>
  );

  return (
    <div id="coram-smartphone-simulator" className={layout.rootClassName}>
      
      {/* Notch / Speaker bar */}
      {layout.showDeviceChrome && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-850"></div>
          <div className="w-12 h-1 bg-slate-850 rounded-full"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-900/55 border border-indigo-900"></div>
        </div>
      )}

      {/* Screen area container */}
      <div className={`${layout.screenClassName} ${
        isDarkMode ? 'dark-theme-simulator bg-slate-900' : 'bg-[#FAF9F6]'
      }`}>
        
        {/* Phone mock status bar */}
        {layout.showDeviceChrome && (
          <div className={`w-full h-7 backdrop-blur-xs flex items-center justify-between px-6 text-[11px] font-mono font-medium z-20 shrink-0 select-none pt-1 transition-colors ${
            isDarkMode ? 'bg-slate-800/70 text-slate-100 border-b border-slate-700/40' : 'bg-white/70 text-slate-800'
          }`}>
            <span>09:41 AM</span>
            <div className="flex items-center space-x-1.5">
              <span>5G</span>
              <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-[1px] flex items-center">
                <div className="h-full w-4 bg-slate-800 rounded-2xs"></div>
              </div>
            </div>
          </div>
        )}

        {/* Global Toaster message */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-10 left-4 right-4 bg-slate-900 text-white text-[12px] py-2 px-3 rounded-xl shadow-lg z-50 text-center flex items-center justify-center space-x-1.5 font-medium border border-slate-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Access information layer */}
        <AnimatePresence>
          {showPaywall && (
            <motion.div 
              id="paywall-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-40 flex items-end justify-center"
            >
              <motion.div 
                id="paywall-sheet"
                initial={{ y: 250 }}
                animate={{ y: 0 }}
                exit={{ y: 250 }}
                className="w-full bg-white rounded-t-3xl p-5 shadow-2xl relative"
              >
                {/* Drag handle decoration */}
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
                
                {/* Glowing Crown Icon */}
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-7 h-7 text-[#D4AF37]" />
                </div>

                <h3 className="font-sans font-extrabold text-slate-900 text-lg text-center tracking-tight">Contenido disponible</h3>
                <p className="text-center text-xs text-slate-500 max-w-[280px] mx-auto mt-1 mb-4 leading-normal">
                  Esta sección está habilitada para todos: <span className="font-semibold text-indigo-950">{paywallReason || 'Acceso completo'}</span>.
                </p>

                {/* Benefits checklist */}
                <div className="space-y-2 mb-5">
                  {[
                    'Todos los cancioneros de Angie MZ en PDF',
                    'Acceso a todos los cursos y temarios avanzados',
                    'Transposición ilimitada de acordes',
                    'Material técnico y descargas de audio exclusivas'
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start space-x-2 text-left">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 leading-tight">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <button 
                    id="btn-paywall-upgrade-now"
                    onClick={() => {
                      setShowPaywall(false);
                      setShowPaywall(false);
                    }}
                    className="w-full bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Continuar</span>
                  </button>
                  <button 
                    id="btn-paywall-close"
                    onClick={() => setShowPaywall(false)}
                    className="w-full text-slate-400 hover:text-slate-600 text-[11px] text-center py-1.5 font-medium"
                  >
                    Quizás más tarde
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SCREENS SWITCHER --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
          
          {/* 1. Splash Screen */}
          {currentScreen === 'splash' && (
            <motion.div 
              key="screen-splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A0B11] flex flex-col items-center justify-center px-6"
            >
              {/* Luxury logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-64 h-64 flex items-center justify-center -mt-6"
              >
                <CoramLogo variant="full" className="w-full h-full" />
              </motion.div>

              {/* Loader Dot Pulse */}
              <div className="flex space-x-1.5 mt-8">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-bounce delay-100"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-bounce delay-200"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 animate-bounce delay-300"></span>
              </div>

              <button 
                id="btn-skip-splash"
                onClick={() => setCurrentScreen('onboarding')} 
                className="mt-10 px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors"
              >
                Saltar intro
              </button>
            </motion.div>
          )}

          {/* 2. Onboarding Screen */}
          {currentScreen === 'onboarding' && (
            <motion.div 
              key="screen-onboarding"
              initial={{ translateX: 50, opacity: 0 }}
              animate={{ translateX: 0, opacity: 1 }}
              className="absolute inset-0 bg-[#FAF9F6] flex flex-col p-6"
            >
              <div className="flex justify-between items-center z-10">
                <span className="text-[10px] font-bold text-[#0B2545]/80 uppercase tracking-wider">CorAM • Angie MZ</span>
                <button 
                  id="btn-skip-onboarding"
                  onClick={() => setCurrentScreen('login')} 
                  className="text-xs font-semibold text-slate-500 hover:text-[#0B2545]"
                >
                  Saltar
                </button>
              </div>

              {/* Carousel Content */}
              <div className="flex-1 flex flex-col justify-center items-center text-center px-2">
                {onboardingIndex === 0 && (
                  <motion.div key="slide-1" className="space-y-4">
                    <div className="w-24 h-24 bg-[#0B2545]/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#0B2545]/10">
                      <BookOpenCheck className="w-12 h-12 text-[#0B2545]" />
                    </div>
                    <h3 className="font-sans font-black text-slate-900 text-xl tracking-tight leading-tight">Descubre cientos de corarios</h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Accede a la letra y transposición de acordes de coros pentecostales clásicos y modernos ordenadamente.
                    </p>
                  </motion.div>
                )}
                {onboardingIndex === 1 && (
                  <motion.div key="slide-2" className="space-y-4">
                    <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20">
                      <Award className="w-12 h-12 text-[#D4AF37]" />
                    </div>
                    <h3 className="font-sans font-black text-slate-900 text-xl tracking-tight leading-tight">Aprende con cursos y mentorías</h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Formación musical y mentorías privadas con Angie MZ diseñadas para elevar la excelencia en tu altar.
                    </p>
                  </motion.div>
                )}
                {onboardingIndex === 2 && (
                  <motion.div key="slide-3" className="space-y-4">
                    <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                      <Compass className="w-12 h-12 text-teal-600" />
                    </div>
                    <h3 className="font-sans font-black text-slate-900 text-xl tracking-tight leading-tight">Crece en tu ministerio</h3>
                    <p className="text-xs text-slate-500 leading-normal">
                      Descarga manuales prácticos, partituras calibradas y pistas de colchón para adorar con orden y unción.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Dots tracker */}
              <div className="flex justify-center space-x-1.5 mb-8">
                {[0, 1, 2].map((idx) => (
                  <button 
                    key={idx}
                    id={`btn-onboarding-dot-${idx}`}
                    onClick={() => setOnboardingIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${onboardingIndex === idx ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-slate-300'}`}
                  ></button>
                ))}
              </div>

              {/* Next CTA */}
              <button 
                id="btn-onboarding-next"
                onClick={() => {
                  if (onboardingIndex < 2) {
                    setOnboardingIndex(onboardingIndex + 1);
                  } else {
                    setCurrentScreen('login');
                  }
                }}
                className="w-full bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <span>{onboardingIndex === 2 ? 'Comenzar Ahora' : 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* 3. Login Screen */}
          {currentScreen === 'login' && (
            <motion.div 
              key="screen-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#FAF9F6] flex flex-col p-6 overflow-y-auto"
            >
              <div className="mt-4 flex flex-col items-center justify-center">
                <CoramLogo variant="icon" size={110} />
                <h4 className="font-serif text-[#C29031] text-2xl font-bold tracking-tight leading-none mt-2">CorAM</h4>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ACCESO GRATUITO DEL MINISTRO</p>
              </div>

              {/* Social authentication widgets */}
              <div className="space-y-2.5 mt-8">
                <button 
                  id="btn-login-google"
                  onClick={() => {
                    setProfile({ ...profile, name: 'Hno. Juan Alvarez (G)', isPremium: false });
                    showToast('Ingresado con tu cuenta de Google.');
                    setCurrentScreen('home');
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-3 px-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center space-x-3 transition-colors"
                >
                  <span className="text-red-500 font-bold">G</span>
                  <span>Continuar con Google</span>
                </button>
              </div>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="px-3 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">o usa tu email</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Login form inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CORREO ELECTRÓNICO</label>
                  <input 
                    type="email" 
                    placeholder="alvarezgiljuandavid7@gmail.com"
                    defaultValue={profile.email}
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-405"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">CONTRASEÑA</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                      defaultValue=""
                    className="w-full bg-white text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-405"
                  />
                </div>
              </div>

              <div className="text-right mt-1.5">
                <a href="#reset" className="text-[10px] text-[#D4AF37] font-semibold">¿Olvidaste tu contraseña?</a>
              </div>

              {/* Primary CTA */}
              <button 
                id="btn-login-submit"
                onClick={() => {
                  setProfile({ ...profile, name: 'Hno. Juan David' });
                  showToast('Sesión iniciada con éxito.');
                  setCurrentScreen('home');
                }}
                className="w-full bg-[#0B2545] hover:bg-slate-900 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-sm mt-6"
              >
                Ingresar al Altar
              </button>

              <div className="mt-auto text-center pt-8">
                <p className="text-[10px] text-slate-400">
                  ¿Aún no tienes cuenta? <span className="text-[#0B2545] font-bold underline cursor-pointer">Regístrate</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* 4. Home Screen */}
          {currentScreen === 'home' && (
            <motion.div 
              key="screen-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col pb-4"
            >
              {/* Header inside home */}
              <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-gray-100 shadow-2xs">
                <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => setCurrentScreen('home')}>
                  <CoramLogo variant="icon" size={32} className="shrink-0" />
                  <span className="font-serif font-black text-[#C29031] text-lg tracking-tight leading-none">CorAM</span>
                </div>
                {/* User mini profile block */}
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span id="user-display-name" className="text-[10px] font-bold text-slate-800 block line-clamp-1 max-w-[80px]">{profile.name}</span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.2">Gratis</span>
                  </div>
                  <img 
                    src={profile.avatarUrl} 
                    alt="avatar" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full border border-gray-200"
                    onClick={() => setCurrentScreen('profile')}
                  />
                </div>
              </div>

              {/* Main Feed Content Area */}
              <div className="p-4 space-y-4 flex-1">
                {/* Banner Principal Novedades (Promotion) */}
                <div className="relative rounded-2xl bg-gradient-to-r from-[#0B2545] via-slate-900 to-[#1e3450] p-4 text-white overflow-hidden shadow-md border border-slate-800">
                  {/* Decorative faint glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="relative z-10 space-y-1">
                    <span className="inline-block bg-[#D4AF37] text-slate-950 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-sm">ACADEMIA EXCLUSIVA</span>
                    <h4 className="font-sans font-extrabold text-sm tracking-tight leading-tight pt-1">
                      Aprende Armonía Colectiva y Modulaciones con Angie MZ
                    </h4>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Clases virtuales interactivas con temarios optimizados estilo MasterClass.
                    </p>
                    
                    <button 
                      id="btn-home-banner-cta"
                      onClick={() => {
                        const advancedCourse = courses.find(c => c.id === 'course-2');
                        if (advancedCourse) {
                          setSelectedCourse(advancedCourse);
                          setCurrentScreen('course-detail');
                        } else {
                          setCurrentScreen('academy');
                        }
                      }}
                      className="mt-2.5 px-3 py-1 bg-white hover:bg-slate-100 text-[#0B2545] rounded-lg text-[10px] font-bold transition-all shadow-2xs"
                    >
                      Ver Curso
                    </button>
                  </div>
                </div>

                {/* Quick Access Menu Tiles Grid (12 Columns helper) */}
                <div>
                  <h5 className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">Accesos Rápidos</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: BookOpen, label: 'Corarios', target: 'corarios-list', bg: 'bg-blue-50 text-blue-700' },
                      { icon: Music, label: 'Himnarios', target: 'himnarios', bg: 'bg-indigo-50 text-indigo-705' },
                      { icon: PlayCircle, label: 'Cursos', target: 'academy', bg: 'bg-amber-50 text-amber-707' },
                      { icon: FileText, label: 'Recursos', target: 'recursos', bg: 'bg-teal-50 text-teal-707' },
                      { icon: PhoneCall, label: 'Mentorías', target: 'mentorias', bg: 'bg-pink-50 text-pink-707' },
                      { icon: Wind, label: 'Calentamiento', target: 'vocal-warmup', bg: 'bg-emerald-50 text-emerald-707' },
                    ].map((item, index) => (
                      <button 
                        key={index}
                        id={`btn-quick-access-${item.target}`}
                        onClick={() => {
                          const keyMap: Record<string, string> = {
                            'corarios-list': 'corarios',
                            'himnarios': 'himnarios',
                            'mentorias': 'mentorships',
                            'vocal-warmup': 'warmups'
                          };
                          const sectionKey = keyMap[item.target];
                          if (sectionKey && isSectionLocked(sectionKey)) {
                            handleOpenCheckout(sectionKey, item.label);
                          } else {
                            if (item.target === 'vocal-warmup') {
                              setBreathingActive(false);
                              setScalePlaying(false);
                            }
                            setCurrentScreen(item.target);
                          }
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 transition-all text-center space-y-1 shadow-2xs cursor-pointer"
                      >
                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9.5px] font-extrabold text-slate-700 leading-none">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Vocal Ear Tuner Banner */}
                <div className="bg-gradient-to-r from-sky-500/5 via-indigo-500/10 to-white p-3.5 rounded-2xl border border-indigo-100/60 shadow-3xs flex items-center justify-between text-left relative overflow-hidden group">
                  <div className="flex items-center space-x-3 max-w-[72%]">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0B2545] to-[#1e3450] text-[#D4AF37] shrink-0 shadow-xs">
                      <Mic2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] bg-slate-100 text-[#0B2545] font-black tracking-wider uppercase px-2 py-0.5 rounded">Ajuste de Oído y Afinación</span>
                      <h6 className="font-sans font-extrabold text-slate-800 text-xs mt-0.5 tracking-tight">Afinador y Teclado de Piano</h6>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Entrena tu voz con la total precisión y sonoridad de un piano real.</p>
                    </div>
                  </div>
                  <button 
                    id="btn-home-vocal-tuner-trigger"
                    onClick={() => {
                      if (isSectionLocked('tuner_piano')) {
                        handleOpenCheckout('tuner_piano', 'Afinador y Teclado de Piano');
                      } else {
                        cleanupTunerInstance();
                        setCurrentScreen('vocal-tuner');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#0B2545] hover:bg-slate-900 border border-slate-700 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    Abrir
                  </button>
                </div>

                {/* Section: Corarios Populares (First 3) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">Corarios Populares</h5>
                    <button 
                      id="btn-see-all-corarios"
                      onClick={() => setCurrentScreen('corarios-list')} 
                      className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-2">
                    {corarios.slice(0, 3).map((cor) => (
                      <motion.div 
                        layoutId={`corario-card-${cor.id}`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        key={cor.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all shadow-3xs"
                      >
                        <div 
                          className="flex-1 cursor-pointer text-left"
                          onClick={() => {
                            setSelectedCorario(cor);
                            setCurrentScreen('corario-detail');
                          }}
                        >
                          <div className="flex items-center space-x-1.5">
                            <motion.span 
                              layoutId={`corario-title-${cor.id}`}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              className="text-xs font-bold text-slate-800 tracking-tight block"
                            >
                              {cor.title}
                            </motion.span>
                          </div>
                          <motion.span 
                            layoutId={`corario-meta-${cor.id}`}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            className="text-[9px] text-slate-500 font-medium block mt-0.5"
                          >
                            {cor.category} • Tono {cor.key}
                          </motion.span>
                        </div>
                        <button 
                          id={`btn-fav-toggle-home-${cor.id}`}
                          onClick={() => toggleFavorite(cor.id)}
                          className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 z-10 relative"
                        >
                          <Heart className={`w-4 h-4 ${profile.favoriteCorarios.includes(cor.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#D4AF37]/10 via-amber-50 to-orange-50/50 p-3.5 rounded-xl border border-[#D4AF37]/35 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-[#D4AF37]">PAQUETE DE EXCELENCIA</span>
                    <h6 className="font-sans font-bold text-slate-800 text-xs mt-0.5">Cancionero y materiales de Angie MZ</h6>
                    <p className="text-[9px] text-slate-500 max-w-[190px]">Descarga PDFs, cifrados profesionales y material avanzado.</p>
                  </div>
                  <button 
                    id="btn-home-open-resources"
                    onClick={() => setCurrentScreen('recursos')}
                    className="px-3 py-1.5 bg-[#0B2545] hover:bg-slate-900 text-white rounded-lg text-[9px] font-black"
                  >
                    ABRIR
                  </button>
                </div>

                {/* Section: Cursos Destacados */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">Cursos Destacados</h5>
                    <button 
                      id="btn-see-all-courses"
                      onClick={() => setCurrentScreen('academy')} 
                      className="text-[10px] font-bold text-[#D4AF37] hover:underline"
                    >
                      Ver academia
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {courses.slice(0, 2).map((course) => (
                      <div 
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                          setCurrentScreen('course-detail');
                        }}
                        className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 cursor-pointer transition-all flex flex-col shadow-3xs"
                      >
                        <img 
                          src={course.imageUrl} 
                          alt={course.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-18 object-cover"
                        />
                        <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-black text-amber-600 block">{course.instructor}</span>
                            <span className="text-[10px] font-bold text-slate-800 tracking-tight leading-tight line-clamp-2">{course.title}</span>
                          </div>
                          <span className="text-[8px] text-slate-500 block pt-1">{course.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integrated Sponsors Elegante (Patrocinadores) */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center space-x-1.5 mb-2 justify-center">
                    <SlidersHorizontal className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Aliados de Confianza</span>
                  </div>
                  <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none justify-center">
                    {sponsors.map(sp => (
                      <div key={sp.id} className="text-center shrink-0 w-22 p-1.5 bg-slate-50 border border-slate-200/50 rounded-lg">
                        <span className="text-sm block">{sp.logoUrl}</span>
                        <span className="text-[8px] font-bold text-slate-600 block line-clamp-1">{sp.name}</span>
                        <span className="text-[7px] text-slate-400">{sp.category}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* 5. Biblioteca de Corarios List */}
          {currentScreen === 'corarios-list' && (
            <motion.div 
              key="screen-corarios-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader title="Biblioteca CorAM" showBack={true} backTo="home" />

              {/* Filtering and Search Controls */}
              <div className="p-3 bg-white space-y-2 border-b border-gray-100">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    placeholder="Buscar por título, letra o autor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-405"
                  />
                </div>

                {/* Category Filtering Pills (Adoración, Avivamiento, Pentecostales, Coros antiguos, Coros nuevos) */}
                <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none pt-1">
                  {['Todo', 'Adoración', 'Avivamiento', 'Pentecostales', 'Coros antiguos', 'Coros nuevos'].map((cat) => (
                    <button 
                      key={cat}
                      id={`btn-filter-category-${cat}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all ${
                        selectedCategory === cat 
                          ? 'bg-[#0B2545] text-white border border-[#0B2545]' 
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* List of Corarios */}
              <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                {corarios.filter(c => {
                  let matchesQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     c.lyrics.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                     (c.author && c.author.toLowerCase().includes(searchQuery.toLowerCase()));
                  let matchesCategory = selectedCategory === 'Todo' || c.category === selectedCategory;
                  return matchesQuery && matchesCategory;
                }).length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Compass className="w-8 h-8 mx-auto stroke-1" />
                    <p className="text-xs mt-2">No encontramos corarios para esta búsqueda...</p>
                    <button 
                      id="btn-reset-filters"
                      onClick={() => { setSearchQuery(''); setSelectedCategory('Todo'); }} 
                      className="text-xs text-[#D4AF37] mt-1 underline font-semibold"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  corarios.filter(c => {
                    let matchesQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       c.lyrics.toLowerCase().includes(searchQuery.toLowerCase());
                    let matchesCategory = selectedCategory === 'Todo' || c.category === selectedCategory;
                    return matchesQuery && matchesCategory;
                  }).map((cor) => (
                    <motion.div 
                      layoutId={`corario-card-${cor.id}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      key={cor.id}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all shadow-3xs"
                    >
                      <div 
                        className="flex-1 cursor-pointer mr-2 text-left"
                        onClick={() => {
                          setSelectedCorario(cor);
                          setCurrentScreen('corario-detail');
                        }}
                      >
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <motion.h6 
                            layoutId={`corario-title-${cor.id}`}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            className="text-xs font-bold text-slate-800 tracking-tight block"
                          >
                            {cor.title}
                          </motion.h6>
                        </div>
                        <motion.p 
                          layoutId={`corario-meta-${cor.id}`}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="text-[9px] text-slate-500 font-medium mt-0.5 block"
                        >
                          {cor.category} • Tono {cor.key} • BPM {cor.tempo}
                        </motion.p>
                      </div>
                      <button 
                        id={`btn-fav-toggle-list-${cor.id}`}
                        onClick={() => toggleFavorite(cor.id)}
                        className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors z-10 relative"
                      >
                        <Heart className={`w-4 h-4 ${profile.favoriteCorarios.includes(cor.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* 6. Detalle del Corario Screen */}
          {currentScreen === 'corario-detail' && selectedCorario && (
            <motion.div 
              key="screen-corario-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader 
                title={selectedCorario.title} 
                showBack={true} 
                backTo="corarios-list" 
                titleLayoutId={`corario-title-${selectedCorario.id}`}
              />

              {/* Music Tuner Toolbar (Transpose & Sizing) */}
              <div className="bg-white border-b border-gray-100 p-2.5 px-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">TONO:</span>
                  <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                    <button 
                      id="btn-transpose-down"
                      onClick={() => setTransposeOffset(transposeOffset - 1)}
                      className="px-1.5 py-0.5 text-xs text-slate-600 font-black hover:bg-slate-200 rounded-md"
                    >
                      -
                    </button>
                    <span className="px-1.5 text-xs font-bold font-mono text-[#D4AF37]">
                      {transposeOffset >= 0 ? `+${transposeOffset}` : transposeOffset}
                    </span>
                    <button 
                      id="btn-transpose-up"
                      onClick={() => setTransposeOffset(transposeOffset + 1)}
                      className="px-1.5 py-0.5 text-xs text-slate-600 font-black hover:bg-slate-200 rounded-md"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="range" 
                    min="11" 
                    max="20" 
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[9px] font-bold font-mono text-slate-500">{fontSize}px</span>
                </div>
              </div>

              {/* Integrated metronome widget */}
              <div className="bg-slate-50 border-b border-slate-200/60 p-3 px-4 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="flex h-2 w-2 relative">
                      {isMetronomePlaying && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isMetronomePlaying ? 'bg-[#D4AF37]' : 'bg-slate-400'}`}></span>
                    </span>
                    <span className="text-[9px] text-[#C29031] font-bold uppercase tracking-wider">Metrónomo Integrado</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button 
                      onClick={() => setTimeSignature(t => t === 4 ? 3 : t === 3 ? 6 : t === 6 ? 2 : 4)}
                      className="px-2 py-0.5 rounded bg-white text-[9px] font-bold border border-slate-200 text-slate-600 font-mono shadow-3xs hover:bg-slate-50"
                    >
                      Compás: {timeSignature === 6 ? '6/8' : `${timeSignature}/4`}
                    </button>
                    <button 
                      onClick={() => setMetronomeVolume(v => v === 0 ? 0.5 : v === 0.5 ? 1 : 0)}
                      className="p-1 rounded bg-white border border-slate-200 text-slate-500 shadow-3xs hover:bg-slate-50"
                      title="Alternar Silencio"
                    >
                      {metronomeVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#C29031]" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Fine BPM selectors */}
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 px-1.5 shadow-3xs">
                    <button 
                      onClick={() => setMetronomeBPM(b => Math.max(40, b - 1))}
                      className="px-1 text-xs text-slate-500 font-bold hover:bg-slate-100 rounded"
                    >
                      -1
                    </button>
                    <span className="text-xs font-mono font-black text-slate-800 w-12 text-center block leading-none">
                      {metronomeBPM} <span className="text-[7px] text-slate-400 font-sans block leading-none font-bold mt-0.5">BPM</span>
                    </span>
                    <button 
                      onClick={() => setMetronomeBPM(b => Math.min(240, b + 1))}
                      className="px-1 text-xs text-slate-500 font-bold hover:bg-slate-100 rounded"
                    >
                      +1
                    </button>
                  </div>

                  {/* BPM slider track */}
                  <input 
                    type="range" 
                    min="40" 
                    max="220" 
                    value={metronomeBPM}
                    onChange={(e) => setMetronomeBPM(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />

                  {/* Playback key button */}
                  <button
                    onClick={() => setIsMetronomePlaying(!isMetronomePlaying)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-3xs transition-all ${
                      isMetronomePlaying 
                        ? 'bg-[#C29031] text-white' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isMetronomePlaying ? 'Parar' : 'Iniciar'}
                  </button>
                </div>

                {/* Beat sequential lights */}
                <div className="flex justify-center gap-1 bg-white/40 p-1.5 rounded-lg border border-slate-150 shadow-3xs">
                  {Array.from({ length: timeSignature === 6 ? 6 : timeSignature }).map((_, stepIdx) => {
                    const beatNum = stepIdx + 1;
                    const isActive = currentBeat === beatNum && isMetronomePlaying;
                    return (
                      <div 
                        key={stepIdx}
                        className={`flex-1 h-4 rounded-md transition-all duration-75 flex items-center justify-center border text-[9px] font-mono font-bold ${
                          isActive 
                            ? beatNum === 1 
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-white scale-102 shadow-2xs' 
                              : 'bg-amber-400 border-amber-400 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {beatNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lyrics Panel */}
              <div className="p-4 flex-1 overflow-y-auto">
                <motion.div 
                  layoutId={`corario-card-${selectedCorario.id}`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="bg-white rounded-2xl p-4 border border-slate-150/70 shadow-3xs"
                >
                  <motion.div 
                    layoutId={`corario-meta-${selectedCorario.id}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between flex-wrap gap-1 w-full"
                  >
                    <div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{selectedCorario.category}</span>
                      <span className="text-[9px] text-slate-400 ml-2">Autor: {selectedCorario.author || 'Tradicional'}</span>
                    </div>
                    {transposeOffset !== 0 && (
                      <span className="text-[9px] font-bold text-[#D4AF37] italic">Transpuesto ({transposeOffset} semitono)</span>
                    )}
                  </motion.div>

                  {/* Lyrics scroll body */}
                  <pre 
                    className="whitespace-pre-wrap font-mono text-slate-800 leading-relaxed border-l-2 border-[#D4AF37]/50 pl-3 leading-loose"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {transposeChords(selectedCorario.lyrics, transposeOffset)}
                  </pre>
                </motion.div>
              </div>

              {/* Actions Bottom Bar */}
              <div className="bg-white border-t border-gray-100 p-3 px-4 flex items-center justify-around space-x-2">
                <button 
                  id="btn-detail-fav-toggle"
                  onClick={() => toggleFavorite(selectedCorario.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-100 hover:bg-slate-50 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${profile.favoriteCorarios.includes(selectedCorario.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                  <span>Favorito</span>
                </button>
                <button 
                  id="btn-detail-share"
                  onClick={() => {
                    showToast('Link de Coro copiado al portapapeles.');
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-100 hover:bg-slate-50 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span>Compartir</span>
                </button>
                <button 
                  id="btn-detail-download-pdf"
                  onClick={() => {
                    showToast('Descargando archivo PDF listo para imprimir...');
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#0B2545] hover:bg-slate-900 text-white flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 7. Cursos list */}
          {currentScreen === 'academy' && (
            <motion.div 
              key="screen-academy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader title="Academia de Alabanza" showBack={true} backTo="home" />

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-[#0B2545] text-white p-4 rounded-2xl border border-[#D4AF37]/20 relative">
                  <span className="text-[9px] font-black tracking-widest text-[#D4AF37] block">CULTIVANDO EXCELENCIA</span>
                  <h4 className="font-sans font-bold text-sm tracking-tight leading-tight mt-0.5">Estudia con los mejores directores ministeriales</h4>
                  <p className="text-[10px] text-slate-300 mt-1">Cursos estructurados para músicos y coristas pentecostales que sirven a Dios.</p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[11px] font-extrabold text-slate-500 tracking-wider uppercase">Cursos Virtuales</h5>
                  {courses.map((course) => {
                    const isEnrolled = profile.enrolledCourses.includes(course.id);
                    return (
                      <div 
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                          setCurrentScreen('course-detail');
                        }}
                        className="bg-white rounded-xl overflow-hidden border border-slate-100 hover:border-slate-200 cursor-pointer transition-all flex flex-col shadow-3xs"
                      >
                        <div className="relative">
                          <img 
                            src={course.imageUrl} 
                            alt={course.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-24 object-cover"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white shadow-sm bg-green-600">
                            Gratuito
                          </span>
                        </div>
                        <div className="p-3 space-y-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-amber-600 uppercase">{course.instructor}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                              <span className="text-[9px] font-bold text-slate-700">{course.rating}</span>
                            </div>
                          </div>
                          <h6 className="text-xs font-bold text-slate-800 tracking-tight leading-tight">{course.title}</h6>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{course.description}</p>
                          <div className="flex items-center justify-between pt-1.5">
                            <span className="text-[9px] text-slate-400 font-medium">{course.duration}</span>
                            {isEnrolled && (
                              <span className="text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">Inscrito ✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 8. Detalle del Curso Screen */}
          {currentScreen === 'course-detail' && selectedCourse && (
            <motion.div 
              key="screen-course-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader title="Detalle del Curso" showBack={true} backTo="academy" />

              <div className="flex-1 overflow-y-auto">
                {activeLessonId ? (() => {
                  const activeLessonObj = selectedCourse.syllabus.find(l => l.id === activeLessonId);
                  return (
                    <div className="bg-[#0B0C15] text-white p-3.5 space-y-3 relative overflow-hidden shadow-inner border-b border-slate-800">
                      {/* Floating G-clef water logo */}
                      <div className="absolute right-0 bottom-0 text-white/[0.04] pointer-events-none select-none">
                        <CoramLogo variant="icon" size={170} />
                      </div>

                      {/* Flash background with metronome first beat */}
                      {isMetronomePlaying && (
                        <div 
                          className="absolute inset-0 bg-[#D4AF37]/5 transition-opacity duration-150 pointer-events-none"
                          style={{ opacity: currentBeat === 1 ? 0.3 : 0.05 }}
                        />
                      )}

                      {/* Top status header */}
                      <div className="flex items-center justify-between relative z-10 text-[10px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[#D4AF37] font-black uppercase tracking-widest font-mono">REPRODUCTOR DE ACADEMIA</span>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveLessonId(null);
                            setIsLessonPlaying(false);
                          }}
                          className="px-2 py-0.5 rounded bg-white/10 text-white/70 hover:text-white text-[9px] hover:bg-white/15 transition-all font-bold"
                        >
                          ✕ Quitar
                        </button>
                      </div>

                      {/* Main screen area for course media */}
                      <div className="h-28 bg-gradient-to-tr from-black/90 to-slate-950 rounded-xl border border-white/10 flex flex-col justify-between p-3 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <span className="text-[8px] text-[#D4AF37] uppercase tracking-wider block font-bold font-mono">{selectedCourse.instructor}</span>
                            <span className="text-xs font-bold text-white block truncate max-w-[185px]">{activeLessonObj?.title}</span>
                          </div>
                          
                          {/* Active speed badge speed controls */}
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35 px-1.5 py-0.5 rounded-md font-mono font-bold leading-none">
                              {playbackSpeed.toFixed(2)}x
                            </span>
                          </div>
                        </div>

                        {/* Rhythmic visual audio wave bars */}
                        <div className="flex items-center justify-center space-x-0.5 py-2">
                          {Array.from({ length: 24 }).map((_, i) => {
                            const size = isLessonPlaying ? Math.abs(Math.sin((lessonProgress + i) * 0.45)) * 18 + 4 : 4;
                            return (
                              <motion.span 
                                key={i} 
                                animate={{ height: isLessonPlaying ? [size, size * 0.3, size] : 4 }}
                                transition={{ duration: 0.7 + (i % 4) * 0.12, repeat: Infinity }}
                                className="w-[3px] bg-[#D4AF37] rounded-full opacity-80"
                                style={{ height: '4px' }}
                              />
                            );
                          })}
                        </div>

                        {/* Speed interactive timeline seek */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] text-white/50 font-mono">
                            <span>{formatTime(lessonProgress)}</span>
                            <span>{activeLessonObj?.duration || "03:30"}</span>
                          </div>
                          <div 
                            className="bg-white/20 h-1 rounded-full overflow-hidden cursor-pointer relative"
                            onClick={(e) => {
                              const bRect = e.currentTarget.getBoundingClientRect();
                              const clickPos = (e.clientX - bRect.left) / bRect.width;
                              setLessonProgress(Math.floor(clickPos * 210));
                            }}
                          >
                            <div 
                              className="bg-[#D4AF37] h-full transition-all duration-150" 
                              style={{ width: `${(lessonProgress / 210) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Velocidad de Reproducción Dashboard Buttons */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 relative z-10 text-left">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider flex items-center space-x-1">
                            <Sliders className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>Velocidad de Lección</span>
                          </span>
                          <span className="text-[8px] text-[#D4AF37] font-semibold italic">Ajusta para practicar lento</span>
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {([0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as number[]).map((spd) => (
                            <button
                              key={spd}
                              onClick={() => {
                                setPlaybackSpeed(spd);
                                showToast(`Velocidad configurada a ${spd}x para facilidad de práctica.`);
                              }}
                              className={`py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                                playbackSpeed === spd 
                                  ? 'bg-[#D4AF37] text-slate-900 border border-[#D4AF37]' 
                                  : 'bg-white/10 text-white/80 hover:bg-white/15'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rehearsal Metronome for Active Lesson */}
                      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-2.5 relative z-10 text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            <span className="flex h-1.5 w-1.5 relative">
                              {isMetronomePlaying && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isMetronomePlaying ? 'bg-[#D4AF37]' : 'bg-slate-400'}`}></span>
                            </span>
                            <span className="text-[9px] text-white/90 font-bold uppercase tracking-wider">Metrónomo de Apoyo</span>
                          </div>
                          <button
                            onClick={() => setTimeSignature(t => t === 4 ? 3 : t === 3 ? 6 : t === 6 ? 2 : 4)}
                            className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-bold font-mono text-[#D4AF37] border border-white/5"
                          >
                            Métrica: {timeSignature === 6 ? '6/8' : `${timeSignature}/4`}
                          </button>
                        </div>

                        {/* BPM fine tuning block */}
                        <div className="flex items-center justify-between space-x-2">
                          <button 
                            onClick={() => setMetronomeBPM(b => Math.max(40, b - 5))}
                            className="w-7 h-7 bg-white/10 hover:bg-white/15 rounded-lg text-[#D4AF37] text-xs font-bold flex items-center justify-center select-none"
                          >
                            -5
                          </button>
                          <div className="flex-1 text-center bg-black/40 rounded-lg py-1 px-2 border border-white/5">
                            <span className="text-lg font-mono font-black text-white leading-none block">{metronomeBPM} <span className="text-[7px] text-slate-300 font-sans tracking-widest font-extrabold uppercase">BPM</span></span>
                          </div>
                          <button 
                            onClick={() => setMetronomeBPM(b => Math.min(240, b + 5))}
                            className="w-7 h-7 bg-white/10 hover:bg-white/15 rounded-lg text-[#D4AF37] text-xs font-bold flex items-center justify-center select-none"
                          >
                            +5
                          </button>
                        </div>

                        {/* Flashing beat timeline lights */}
                        <div className="flex justify-center space-x-1">
                          {Array.from({ length: timeSignature === 6 ? 6 : timeSignature }).map((_, stpi) => {
                            const bNum = stpi + 1;
                            const isActiveTick = currentBeat === bNum && isMetronomePlaying;
                            return (
                              <div 
                                key={stpi}
                                className={`flex-1 h-3 rounded-md transition-all duration-75 flex items-center justify-center text-[8px] font-mono font-bold border ${
                                  isActiveTick 
                                    ? bNum === 1 
                                      ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-900 scale-102 shadow-2xs' 
                                      : 'bg-amber-400 border-amber-400 text-slate-950'
                                    : 'bg-white/5 border-white/10 text-white/30'
                                }`}
                              >
                                {bNum}
                              </div>
                            );
                          })}
                        </div>

                        {/* Active player master action controls */}
                        <div className="flex gap-1.5 pt-0.5">
                          <button
                            onClick={() => setIsMetronomePlaying(!isMetronomePlaying)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center space-x-1.5 shadow-sm transition-all ${
                              isMetronomePlaying 
                                ? 'bg-[#D4AF37] text-slate-950' 
                                : 'bg-white/10 text-[#D4AF37] border border-white/5 hover:bg-white/15'
                            }`}
                          >
                            {isMetronomePlaying ? '⏹ Detener Ticks' : '▶ Activar Metrónomo'}
                          </button>

                          <button
                            onClick={() => setIsLessonPlaying(!isLessonPlaying)}
                            className="px-3 bg-white/10 rounded-lg text-white text-[10px] hover:bg-white/15 border border-white/5 font-bold"
                          >
                            {isLessonPlaying ? 'Pausar' : 'Reproducir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="relative">
                    <img 
                      src={selectedCourse.imageUrl} 
                      alt={selectedCourse.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end p-3">
                      <div>
                        <span className="text-[#D4AF37] font-black text-[9px] uppercase tracking-wider">{selectedCourse.instructor}</span>
                        <h4 className="text-white font-sans font-bold text-sm tracking-tight leading-tight">{selectedCourse.title}</h4>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-4">
                  {/* Bio Description */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Acerca del Curso</span>
                    <p className="text-xs text-slate-600 leading-relaxed text-left">{selectedCourse.description}</p>
                  </div>

                  {/* Syllabus / Temario List */}
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Contenido / Sílabo</span>
                    <div className="space-y-1.5">
                      {selectedCourse.syllabus.map((lesson, idx) => {
                        const showLock = false;
                        const isCurrentlyPlaying = activeLessonId === lesson.id;
                        return (
                          <div 
                            key={lesson.id}
                            className={`p-2.5 rounded-lg flex items-center justify-between transition-all border ${
                              isCurrentlyPlaying 
                                ? 'bg-amber-500/5 border-[#D4AF37] shadow-sm' 
                                : 'bg-white border-slate-100'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <span className={`text-[10px] font-bold mt-0.5 w-5 h-5 rounded-md flex items-center justify-center ${
                                isCurrentlyPlaying ? 'bg-[#D4AF37] text-white' : 'bg-slate-50 text-slate-400'
                              }`}>{idx + 1}</span>
                              <div className="text-left">
                                <span className={`text-xs font-bold block tracking-tight line-clamp-1 ${
                                  isCurrentlyPlaying ? 'text-[#C29031]' : 'text-slate-700'
                                }`}>{lesson.title}</span>
                                <span className="text-[9px] text-slate-400 font-medium font-mono">{lesson.duration}</span>
                              </div>
                            </div>
                            <div>
                              {showLock ? (
                                <Lock className="w-3.5 h-3.5 text-amber-500 cursor-pointer" onClick={() => {
                                  handleOpenCheckout('courses', `Curso: ${selectedCourse.title}`);
                                }} />
                              ) : (
                                <PlayCircle 
                                  className={`w-4 h-4 cursor-pointer transition-transform ${
                                    isCurrentlyPlaying ? 'text-[#C29031] scale-110' : 'text-[#0B2545]'
                                  }`} 
                                  onClick={() => {
                                    setActiveLessonId(lesson.id);
                                    setIsLessonPlaying(true);
                                    setLessonProgress(0);
                                    showToast(`Lección iniciada: "${lesson.title}". Controla el tempo de práctica en el reproductor.`);
                                  }} 
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Action Bottom Trigger */}
              <div className="bg-white border-t border-gray-100 p-3 flex">
                <button 
                  id="btn-course-enroll"
                  onClick={() => toggleEnroll(selectedCourse.id)}
                  disabled={profile.enrolledCourses.includes(selectedCourse.id)}
                  className={`w-full text-xs font-bold py-3.5 rounded-xl transition-all shadow-sm ${
                    profile.enrolledCourses.includes(selectedCourse.id)
                      ? 'bg-green-50 text-green-700 border border-green-200 pointer-events-none'
                      : 'bg-[#0B2545] hover:bg-slate-900 text-white'
                  }`}
                >
                  {profile.enrolledCourses.includes(selectedCourse.id) ? 'Ya estás Inscrito ✓' : 'Inscribirme Ahora'}
                </button>
              </div>
            </motion.div>
          )}

          {/* 9. Mentorías Screen */}
          {currentScreen === 'mentorias' && (
            <motion.div 
              key="screen-mentorias"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader title="Mentorías Angie MZ" showBack={true} backTo="home" />

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-gradient-to-tr from-[#0B2545] to-[#D4AF37]/50 text-white p-4 rounded-2xl relative border border-[#D4AF37]/25 text-left">
                  <span className="text-[9px] font-black text-[#D4AF37] block">MENTORÍA PRIVADA CON ANGIE MZ</span>
                  <h4 className="font-sans font-bold text-sm tracking-tight leading-tight mt-0.5">Asesoría directa y técnica de canto ministerial</h4>
                  <p className="text-[10px] text-slate-200 mt-1">Perfecto para directores de alabanza, solistas consagrados y grupos musicales.</p>
                </div>

                <div className="space-y-4">
                  {mentorships.map((m) => (
                    <div 
                      key={m.id}
                      className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 transition-all shadow-3xs text-left space-y-3"
                    >
                      <div className="flex items-start justify-between border-b border-gray-50 pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-amber-600 block">{m.coach}</span>
                          <h5 className="text-xs font-bold text-slate-800 tracking-tight leading-normal">{m.title}</h5>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#0B2545] block">{m.price}</span>
                          <span className="text-[8px] text-slate-400 block font-mono">{m.duration}</span>
                        </div>
                      </div>

                      {/* Benefits checklist widget */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Beneficios de la Sesión:</span>
                        {m.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="text-[10px] text-slate-600 leading-tight">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      {/* WhatsApp Trigger */}
                      <button 
                        id={`btn-book-whatsapp-${m.id}`}
                        onClick={() => {
                          const encodedMsg = encodeURIComponent(m.whatsAppMsg);
                          showToast('Abriendo WhatsApp corporativo...');
                          window.open(`https://api.whatsapp.com/send?phone=5730000000&text=${encodedMsg}`, '_blank');
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-3xs flex items-center justify-center space-x-1.5"
                      >
                        <span>🟢 Agendar por WhatsApp</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 10. Recursos Screen (PDFs & Media Downloads) */}
          {currentScreen === 'recursos' && (
            <motion.div 
              key="screen-recursos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader title="Recursos Directos" showBack={true} backTo="home" />

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-[#FAF9F6] text-slate-700 p-3 rounded-xl border border-slate-200">
                  <p className="text-[10px] leading-relaxed text-left">
                    Consigue kits de afinación, partituras, audiolibros, guías prácticas de respiración y archivos MIDI para el ministerio.
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  {resources.map((res) => {
                    return (
                      <div 
                        key={res.id}
                        className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between"
                      >
                        <div className="flex-1 mr-3">
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full uppercase">{res.category}</span>
                          <h6 className="text-[11px] font-bold text-slate-800 tracking-tight leading-snug mt-1">{res.title}</h6>
                          <p className="text-[9px] text-slate-500 mt-1 line-clamp-1">{res.description}</p>
                          <span className="text-[8px] text-slate-400 font-mono mt-2 block">{res.fileSize} • {res.downloadsCount} descargas</span>
                        </div>
                        <button 
                          id={`btn-resource-download-${res.id}`}
                          onClick={() => handleResourceClick(res)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all shrink-0 bg-slate-50 hover:bg-slate-150 text-slate-700 border-slate-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* INTERACTIVE VOCAL EAR TUNER & CHORD MATCHING WORKSPACE */}
          {currentScreen === 'vocal-tuner' && (
            <motion.div 
              key="screen-vocal-tuner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col bg-slate-50 text-left animate-fade-in font-sans"
            >
              {/* Top navigation bar */}
              <InnerHeader title="Afinador de Piano Vocal" showBack={true} backTo="home" />

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                
                {/* Visual header card */}
                <div className="bg-gradient-to-br from-[#0B2545] via-[#10315c] to-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-[#D4AF37]/35 animate-pulse">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-[#D4AF37] block uppercase">ACADEMIA COMINISTRO</span>
                  <h4 className="font-sans font-extrabold text-sm tracking-tight leading-none mt-1">Afinación Inteligente de Piano</h4>
                  <p className="text-[10px] text-slate-300 mt-1.5 leading-normal">
                    Entrena tu oído y coloca tu voz a tono con precisión micrométrica. Selecciona tu nota objetivo en el teclado, escúchala y afina tu canto en tiempo real.
                  </p>
                </div>

                {/* Settings Bento Grid - Dual Option Columns */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Item 1: Range setup */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-1.5 shadow-3xs text-left">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">1. Registro Vocal</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-205">
                      <button
                        id="btn-voice-grave-toggle"
                        onClick={() => {
                          setTunerVoiceType('grave');
                          showToast("Registro Masculino/Grave activado (C3-B3)");
                        }}
                        className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${
                          tunerVoiceType === 'grave'
                            ? 'bg-white text-slate-950 shadow-3xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Grave (🧑)
                      </button>
                      <button
                        id="btn-voice-aguda-toggle"
                        onClick={() => {
                          setTunerVoiceType('aguda');
                          showToast("Registro Femenino/Agudo activado (C4-B4)");
                        }}
                        className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${
                          tunerVoiceType === 'aguda'
                            ? 'bg-white text-[#0B2545] shadow-3xs'
                            : 'text-slate-500 hover:text-slate-[#0B2545]'
                        }`}
                      >
                        Agudo (👩)
                      </button>
                    </div>
                  </div>

                  {/* Item 2: Chord structure playing type */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-1.5 shadow-3xs text-left">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">2. Armonía Acorde</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-205">
                      <button
                        id="btn-harmonic-major"
                        onClick={() => {
                          setTunerChordType('mayor');
                          showToast("Modo Acorde: Mayor");
                        }}
                        className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${
                          tunerChordType === 'mayor'
                            ? 'bg-white text-[#0B2545] shadow-3xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Mayor (3aM)
                      </button>
                      <button
                        id="btn-harmonic-minor"
                        onClick={() => {
                          setTunerChordType('menor');
                          showToast("Modo Acorde: Menor");
                        }}
                        className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${
                          tunerChordType === 'menor'
                            ? 'bg-white text-[#0B2545] shadow-3xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Menor (3am)
                      </button>
                    </div>
                  </div>
                </div>

                {/* --- REAL HTML CSS ACCOMMODATED PIANO KEYBOARD --- */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">3. Teclado de Piano Acústico</span>
                      <p className="text-[9.5px] text-slate-500">Toca para oír y fijar como <span className="font-extrabold text-slate-800">Nota Objetivo</span>:</p>
                    </div>
                    <span className="text-[8.5px] bg-[#0B2545]/5 text-[#0B2545] px-2 py-0.5 rounded font-mono font-bold uppercase">
                      Nota: {NOTE_SPANISH[tunerSelectedChord]} ({tunerSelectedChord})
                    </span>
                  </div>

                  {/* Acoustic Piano Simulator Layout Container */}
                  <div className="relative h-28 bg-slate-900 rounded-xl p-1 shadow-inner flex select-none overflow-hidden border border-slate-950">
                    
                    {/* White keys rendering (7 keys) */}
                    {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note) => {
                      const isSelected = tunerSelectedChord === note;
                      const nameSp = NOTE_SPANISH[note];
                      return (
                        <div
                          key={note}
                          id={`piano-key-white-${note}`}
                          onClick={() => {
                            setTunerSelectedChord(note);
                            playPianoSingleNote(note);
                          }}
                          className={`flex-1 h-full rounded-b-md flex flex-col justify-end items-center pb-2.5 transition-all text-[9px] font-bold select-none cursor-pointer border-r border-slate-200 last:border-0 ${
                            isSelected 
                              ? 'bg-amber-50 text-[#0B2545] border-b-[6px] border-b-[#D4AF37] shadow-inner font-black' 
                              : 'bg-white text-slate-450 active:bg-slate-250'
                          }`}
                        >
                          <span className="text-[10px] font-black">{nameSp}</span>
                          <span className="text-[8px] opacity-60 font-mono italic select-none">{note}</span>
                        </div>
                      );
                    })}

                    {/* Black keys absolute positioned */}
                    {[
                      { note: 'C#', left: '10.5%' },
                      { note: 'D#', left: '24.5%' },
                      { note: 'F#', left: '53.2%' },
                      { note: 'G#', left: '67.4%' },
                      { note: 'A#', left: '81.6%' }
                    ].map((bk) => {
                      const isSelected = tunerSelectedChord === bk.note;
                      const nameSp = NOTE_SPANISH[bk.note];
                      return (
                        <div
                          key={bk.note}
                          id={`piano-key-black-${bk.note}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTunerSelectedChord(bk.note);
                            playPianoSingleNote(bk.note);
                          }}
                          style={{ left: bk.left }}
                          className={`absolute w-[10%] h-[58%] rounded-b-md z-10 flex flex-col justify-end items-center pb-1.5 transition-all cursor-pointer shadow-md select-none border border-slate-950 ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-b-[4px] border-b-yellow-600 font-extrabold'
                              : 'bg-slate-900 hover:bg-slate-950 text-slate-300 active:bg-slate-800'
                          }`}
                        >
                          <span className="text-[8px] font-extrabold">{nameSp}</span>
                          <span className="text-[7.5px] font-mono scale-90 opacity-80">{bk.note}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chord vs unison auditory feedback switcher */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id="btn-keyboard-play-unison"
                      onClick={() => playPianoSingleNote(tunerSelectedChord)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black rounded-lg flex items-center justify-center space-x-1 transition-all border border-slate-200"
                    >
                      <Volume2 className="w-3 h-3 text-slate-600" />
                      <span>🔊 Escuchar Nota ({NOTE_SPANISH[tunerSelectedChord]})</span>
                    </button>
                    <button
                      id="btn-keyboard-play-chord"
                      onClick={() => playChordRef(tunerSelectedChord, tunerChordType, tunerVoiceType)}
                      className="py-1.5 bg-[#0B2545] hover:bg-indigo-950 text-[#D0E1F9] hover:text-white text-[10px] font-black rounded-lg flex items-center justify-center space-x-1 transition-all shadow-3xs"
                    >
                      <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                      <span>🔊 Escuchar Acorde {tunerSelectedChord}{tunerChordType === 'menor' ? 'm' : ''}</span>
                    </button>
                  </div>
                </div>

                {/* Vocal performance gauge */}
                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl border border-slate-900 shadow-xl relative overflow-hidden">
                  
                  {/* Ambient background matrix mesh */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none opacity-30"></div>
                  
                  {/* Gauge header and active status label */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 relative z-10 mb-3.5">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${tunerActive ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_#10B981]' : 'bg-slate-700'}`} />
                      <span className="text-[8.5px] font-mono tracking-widest text-sky-400 font-extrabold uppercase">Calibrador Vocal Directo</span>
                    </div>
                    <span className="text-[8px] font-mono font-black text-amber-400 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 shadow-[0_0_8px_rgba(235,160,30,0.05)]">
                      Objetivo: {NOTE_SPANISH[tunerSelectedChord]} ({tunerSelectedChord})
                    </span>
                  </div>

                  {/* Large Typography display for current pitch */}
                  <div className="flex flex-col items-center justify-center space-y-1 relative z-10 py-1.5">
                    <span className="text-[8px] font-mono tracking-wider text-slate-500 block uppercase font-bold">Estado de Afinación Vocal:</span>
                    
                    {/* Dynamic color status bar block */}
                    {tunerActive && tunerDetectedNote ? (
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-black font-sans tracking-tight leading-none text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] flex items-baseline gap-1.5">
                          <span>Cantando:</span>
                          <span className={`text-3xl font-extrabold font-sans underline decoration-2 ${
                            tunerMatchScore === 'perfect' ? 'text-emerald-400 decoration-emerald-500' :
                            tunerMatchScore === 'near' ? 'text-sky-400 decoration-sky-400' :
                            'text-red-500 decoration-red-500'
                          }`}>
                            {NOTE_SPANISH[tunerDetectedNote] || tunerDetectedNote}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 mt-1 font-semibold">{tunerDetectedFreq} Hz</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-1">
                        {tunerActive ? (
                          <>
                            <Mic2 className="w-5 h-5 text-sky-400 animate-bounce mb-1" />
                            <span className="text-[10px] font-black text-sky-400 tracking-wide">🎙ï¸ LISTO - EMITE UN SONIDO CONSTANTE...</span>
                            <span className="text-[8px] text-slate-500 mt-0.5 block">"No se marcará nada hasta que cantes o toques"</span>
                          </>
                        ) : (
                          <>
                            <Mic2 className="w-5 h-5 text-slate-600 opacity-50 mb-1" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Afinador Apagado</span>
                            <span className="text-[8.5px] text-slate-600">Presiona Activar Micrófono abajo</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* --- SUTILE METROLOGY SLIDERS (No complicated SVG) --- */}
                  {tunerActive && tunerDetectedNote && (
                    <div className="space-y-2 mt-4 relative z-10 animate-fade-in text-left">
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-400">
                        <span>BEMOL (BAJO)</span>
                        <span className={`${
                          tunerMatchScore === 'perfect' ? 'text-emerald-400 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.1)]' :
                          tunerMatchScore === 'near' ? 'text-sky-400 font-extrabold' : 'text-red-500 font-extrabold'
                        }`}>
                          {tunerDeviation === 0 ? '✓ EN TONO PERFECTO' : tunerDeviation > 0 ? `+${tunerDeviation} CENTS (ALTO)` : `${tunerDeviation} CENTS (BAJO)`}
                        </span>
                        <span>SOSTENIDO (ALTO)</span>
                      </div>

                      {/* Slider gauge container */}
                      <div className="relative w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 flex items-center shadow-inner overflow-visible">
                        {/* Perfect pitch center deadzone notch */}
                        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-slate-700/80 z-0"></div>
                        <div className="absolute inset-y-0 left-1/4 w-[1px] bg-slate-800/50 z-0"></div>
                        <div className="absolute inset-y-0 left-3/4 w-[1px] bg-slate-800/50 z-0"></div>

                        {/* Sliding dynamic glow bead */}
                        <motion.div 
                          className={`absolute w-3.5 h-3.5 rounded-full shadow-md z-15 -translate-x-1.5 ${
                            tunerMatchScore === 'perfect' ? 'bg-emerald-400 shadow-emerald-500/50 scale-110 border border-emerald-300' :
                            tunerMatchScore === 'near' ? 'bg-sky-400 shadow-sky-500/50 border border-sky-300' :
                            'bg-red-500 shadow-red-500/50 border border-red-300'
                          }`}
                          animate={{ left: `${Math.min(Math.max(((tunerDeviation + 45) / 90) * 100, 4), 96)}%` }}
                          transition={{ type: "spring", stiffness: 220, damping: 22 }}
                        />
                      </div>

                      {/* Cents grid numbers */}
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-650 px-1 select-none">
                        <span>-45c</span>
                        <span>-20c</span>
                        <span className="text-slate-500 block font-bold">0c (AFINADO)</span>
                        <span>+20c</span>
                        <span>+45c</span>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE LIGHT EVALUATOR PANELS (Strictly RED, BLUE, GREEN color states based on target note match) */}
                  {tunerActive && tunerDetectedNote && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-900/60 relative z-10 animate-fade-in select-none">
                      
                      {/* RED LIGHT: Fuera de Tono (Incorrect note entirely) */}
                      <div className={`p-2 rounded-xl text-center border transition-all duration-300 flex flex-col items-center justify-center space-y-1 ${
                        tunerMatchScore === 'none'
                          ? 'bg-red-950/45 border-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : 'bg-slate-900/15 border-slate-900/60 opacity-20'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${tunerMatchScore === 'none' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]' : 'bg-slate-800'}`} />
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-350 block">LEJOS</span>
                        <span className="text-[7px] text-slate-500 block leading-none">Roja (Desafinado)</span>
                      </div>

                      {/* BLUE LIGHT: Cerca de Tono (Same note with cents deviation, or just 1 semitone off) */}
                      <div className={`p-2 rounded-xl text-center border transition-all duration-300 flex flex-col items-center justify-center space-y-1 ${
                        tunerMatchScore === 'near'
                          ? 'bg-sky-950/45 border-sky-900/60 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                          : 'bg-slate-900/15 border-slate-900/60 opacity-20'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${tunerMatchScore === 'near' ? 'bg-sky-400 animate-pulse shadow-[0_0_8px_#38BDF8]' : 'bg-slate-800'}`} />
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-350 block">ACERCÁNDOSE</span>
                        <span className="text-[7px] text-slate-500 block leading-none">Azul (Cerca)</span>
                      </div>

                      {/* GREEN LIGHT: Afinado Perfecto (Same note within tight boundary) */}
                      <div className={`p-2 rounded-xl text-center border transition-all duration-300 flex flex-col items-center justify-center space-y-1 ${
                        tunerMatchScore === 'perfect'
                          ? 'bg-emerald-950/45 border-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                          : 'bg-slate-900/15 border-slate-900/60 opacity-20'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${tunerMatchScore === 'perfect' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]' : 'bg-slate-800'}`} />
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-350 block">PERFECTO</span>
                        <span className="text-[7px] text-slate-500 block leading-none">Verde (Afinado)</span>
                      </div>

                    </div>
                  )}

                  {/* Silence active indicator statement placeholder */}
                  {tunerActive && !tunerDetectedNote && (
                    <div className="text-center text-slate-500 text-[8.5px] font-mono pt-2 block font-medium uppercase tracking-wider">
                      Ningún tono vocal detectado. Se mantiene a la espera
                    </div>
                  )}

                </div>

                {/* Primary Mic Trigger Buttons */}
                <div className="flex space-x-2.5">
                  <button
                    id="btn-toggle-tuner-active-action"
                    onClick={() => startLiveTuner()}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-xs ${
                      tunerActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#0B2545] hover:bg-slate-900 border border-slate-700 text-white'
                    }`}
                  >
                    <Mic2 className={`w-3.5 h-3.5 ${tunerActive ? 'animate-bounce' : ''}`} />
                    <span>{tunerActive ? 'Detener Afinador' : '🔴 Activar Afinador'}</span>
                  </button>
                </div>

                {/* --- OFFLINE / TESTING INTERACTIVE MANUAL VOICE SIMULATOR --- */}
                <div className="bg-slate-100/75 border border-slate-205 p-3.5 rounded-2xl space-y-2.5 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-[#8C6239] uppercase tracking-wider block">Entrenador Vocal Instructivo</span>
                    <span className="text-[8px] font-bold text-slate-500 px-2.5 py-0.5 rounded-md bg-white border border-slate-210 shadow-3xs uppercase">Bypass de voz</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 leading-normal">
                    Usa una nota de voz abajo para practicar tu canto. El calibrador evaluará si coincide con la Objetivo actual (<span className="font-extrabold text-slate-700">{NOTE_SPANISH[tunerSelectedChord]}</span>):
                  </p>

                  <div className="grid grid-cols-4 gap-1.5">
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note) => {
                      const isTargetNote = note === tunerSelectedChord;
                      // Determine simulated distance
                      const isCurrentlyActiveSim = tunerActive && tunerDetectedNote === note;

                      return (
                        <button
                          key={note}
                          id={`btn-simulate-vocal-key-${note}`}
                          onClick={() => simulateTunerVoiceNote(note)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black tracking-tight transition-all border flex flex-col items-center justify-center shadow-3xs ${
                            isCurrentlyActiveSim
                              ? isTargetNote
                                ? 'bg-emerald-500 border-emerald-600 text-white font-extrabold hover:bg-emerald-600 scale-102'
                                : note === 'C#' || note === 'B' || note === 'D' || note === 'D#' ? 'bg-sky-450 border-sky-500 text-white font-extrabold scale-102' : 'bg-red-500 border-red-600 text-white font-extrabold scale-102'
                              : isTargetNote
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-white hover:bg-slate-200 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="leading-none">{NOTE_SPANISH[note] || note}</span>
                          <span className={`text-[7px] mt-1 tracking-tight font-black leading-none ${
                            isCurrentlyActiveSim 
                              ? 'text-white' 
                              : isTargetNote
                                ? 'text-emerald-700' 
                                : 'text-slate-400 font-medium'
                          }`}>
                            {isTargetNote ? '¡Igual!' : 'Voz'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Practical Guideline Tip Box */}
                <div className="bg-amber-500/5 rounded-xl border border-amber-500/10 p-3 text-left space-y-1">
                  <span className="text-[10px] font-black text-slate-900 block">💡 Consejos para la Afinación Concreta:</span>
                  <p className="text-[9.5px] text-slate-600 leading-relaxed font-medium">
                    1. Toca la tecla del piano de referencia para grabar o memorizar en tu oído la tónica correcta.
                    <br />
                    2. Activa tu micrófono y canta de manera estable a la misma altura.
                    <br />
                    3. Si cantas la nota correcta, la luz se pondrá <strong>Verde (Afinado)</strong> o <strong>Azul (Cerca)</strong>. Si te desvías a otra nota, brillará la luz <strong>Roja (Fuera)</strong>.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* --- NEW SCREEN: HIMNARIOS (HYMNALS VIEW) --- */}
          {/* ========================================== */}
          {currentScreen === 'himnarios' && (
            <motion.div
              key="screen-himnarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col bg-slate-50 text-left animate-fade-in font-sans"
            >
              {!selectedHymn ? (
                <>
                  <InnerHeader title="Himnarios" showBack={true} backTo="home" />

                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {/* Master overview block */}
                    <div className="bg-gradient-to-br from-[#0B2545] to-[#1e3450] text-white p-4 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
                      <span className="text-[8px] font-black tracking-widest text-[#D4AF37] block uppercase">ALABANZA TRADICIONAL</span>
                      <h4 className="font-sans font-extrabold text-sm tracking-tight leading-none mt-1">L\u00edrica y Claves de Himnos</h4>
                      <p className="text-[10px] text-slate-300 mt-1.5 leading-normal">
                        Consulta himnarios tradicionales cristianos. Encuentra la t\u00f3nica perfecta y transpone la tonalidad en tiempo real para adaptarla a la congregaci\u00f3n.
                      </p>
                    </div>

                    {/* Search & Filter bar layout */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-hymn-search"
                          type="text"
                          placeholder="Buscar por n\u00famero, t\u00edtulo o letra..."
                          value={hymnSearchQuery}
                          onChange={(e) => setHymnSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-indigo-500 font-medium text-slate-850 placeholder:text-slate-400 focus:outline-hidden"
                        />
                      </div>

                      {/* Filter pills */}
                      <div className="flex space-x-1.5 overflow-x-auto py-1 scrollbar-none">
                        {[
                          { id: 'todos', label: 'Todos' },
                          ...hymnCollections,
                        ].map((filter) => (
                          <button
                            key={filter.id}
                            id={`btn-filter-hymnal-${filter.id}`}
                            onClick={() => setSelectedHymnalFilter(filter.id)}
                            className={`px-3 py-1 text-[10px] font-black rounded-full border transition-all shrink-0 uppercase tracking-tight ${
                              selectedHymnalFilter === filter.id
                                ? 'bg-[#0B2545] border-[#0B2545] text-white shadow-3xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hymnals Grid List */}
                    <div className="space-y-2.5">
                      {(() => {
                        const filtered = hymnsData.filter((hymn) => {
                          const matchesFilter = selectedHymnalFilter === 'todos' || hymn.hymnal === selectedHymnalFilter;
                      {hymnsLoading && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 text-[10px] font-bold text-slate-500">
                          Cargando himnos desde Supabase...
                        </div>
                      )}
                      {hymnsError && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[10px] font-bold text-amber-800">
                          {hymnsError}
                        </div>
                      )}
                          const query = hymnSearchQuery.toLowerCase().trim();
                          const matchesSearch = 
                            !query || 
                            hymn.title.toLowerCase().includes(query) || 
                            hymn.number.toString().includes(query) || 
                            hymn.lyrics.toLowerCase().includes(query) ||
                            hymn.hymnalName.toLowerCase().includes(query);
                          return matchesFilter && matchesSearch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-8 bg-white border border-dashed border-slate-205 rounded-2xl p-4">
                              <span className="text-xs font-bold text-slate-400 block">No se encontraron himnos</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Prueba buscando otro criterio o cambiando de himnario.</span>
                            </div>
                          );
                        }

                        return filtered.map((hymn) => (
                          <button
                            key={hymn.id}
                            id={`btn-hymn-card-${hymn.id}`}
                            onClick={() => {
                              setSelectedHymn(hymn);
                              setHymnTranspose(0);
                            }}
                            className="w-full bg-white border border-slate-150 hover:border-slate-350 p-3 flex items-center justify-between transition-all shadow-3xs rounded-xl"
                          >
                            <div className="space-y-0.5 text-left">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[9px] bg-slate-100 text-slate-800 font-extrabold px-1.5 py-0.5 rounded-sm border border-slate-200">
                                  #{hymn.number}
                                </span>
                                <h5 className="text-[11.5px] font-extrabold text-slate-800 leading-none">{hymn.title}</h5>
                              </div>
                              <span className="text-[9px] text-slate-500 font-bold block">
                                {hymn.hymnalName} • Tono: <span className="text-[#0B2545] font-black">{hymn.key}</span>
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-xs sticky top-0 z-10">
                    <button
                      id="btn-back-to-hymn-list"
                      onClick={() => setSelectedHymn(null)}
                      className="flex items-center space-x-1 text-xs font-black text-[#0B2545] hover:underline"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Volver</span>
                    </button>
                    <span className="text-[11px] font-black text-slate-450 uppercase tracking-widest">
                      Himno #{selectedHymn.number}
                    </span>
                    <div className="w-10"></div>
                  </div>

                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {/* Header info */}
                    <div className="text-left space-y-1">
                      <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-wider block">{selectedHymn.hymnalName}</span>
                      <h4 className="text-base font-extrabold text-slate-850 leading-tight tracking-tight">{selectedHymn.title}</h4>
                    </div>

                    {/* Interactive transposition and tone playing dashboard */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-10 shadow-3xs space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Audio Pitch Tonic Button */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex flex-col justify-between text-left space-y-1">
                          <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Escuchar Tónica</span>
                          <button
                            id="btn-play-hymn-initial-tone"
                            onClick={() => {
                              const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                              const baseIdx = notes.indexOf(selectedHymn.key.replace('m', ''));
                              if (baseIdx !== -1) {
                                let newIndex = (baseIdx + hymnTranspose) % 12;
                                if (newIndex < 0) newIndex += 12;
                                const transKey = notes[newIndex];
                                playPianoSingleNote(transKey);
                                showToast(`Reproduciendo Tono Inicial: ${transKey}`);
                              }
                            }}
                            className="w-full py-1.5 bg-[#0B2545] hover:bg-slate-900 text-white text-[10px] font-extrabold rounded-lg flex items-center justify-center space-x-1 shadow-2xs transition-all"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                            <span>Tocar Tónica</span>
                          </button>
                        </div>

                        {/* Transposition adjustment tool */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex flex-col justify-between text-left space-y-1">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Transponer</span>
                          <div className="flex items-center justify-between bg-white rounded-lg border border-slate-205 p-0.5">
                            <button
                              id="btn-hymn-transpose-down"
                              onClick={() => setHymnTranspose(prev => Math.max(-6, prev - 1))}
                              className="px-2 py-0.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-black"
                            >
                              -
                            </button>
                            <span className="text-[10px] font-black text-slate-800">
                              {hymnTranspose >= 0 ? `+${hymnTranspose}` : hymnTranspose}
                            </span>
                            <button
                              id="btn-hymn-transpose-up"
                              onClick={() => setHymnTranspose(prev => Math.min(6, prev + 1))}
                              className="px-2 py-0.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-black"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Info lines displaying resulting Pitch Key */}
                      <div className="flex justify-between items-center bg-[#0B2545]/5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-205">
                        <span className="text-slate-500 font-medium">Original: <strong className="text-slate-705">{selectedHymn.key}</strong></span>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-500 font-medium">Ajustado:</span>
                          <span className="text-emerald-700 font-black px-2 py-0.5 bg-emerald-100 border border-emerald-200 rounded-md">
                            {(() => {
                              const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                              const baseIdx = notes.indexOf(selectedHymn.key);
                              if (baseIdx === -1) return selectedHymn.key;
                              let newIndex = (baseIdx + hymnTranspose) % 12;
                              if (newIndex < 0) newIndex += 12;
                              return notes[newIndex];
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Clickable reference chords preview (Acoustic Piano Cadence) */}
                      <div className="space-y-1.5 text-left">
                        <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block animate-pulse">Acordes de Acompañamiento (Haz clic para oír)</span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {selectedHymn.chords.map((chord) => {
                            let transposedChord = chord;
                            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                            const isMinor = chord.endsWith('m');
                            const chordRoot = chord.replace('m', '').replace('7', '');
                            const baseIdx = notes.indexOf(chordRoot);
                            if (baseIdx !== -1) {
                              let newIndex = (baseIdx + hymnTranspose) % 12;
                              if (newIndex < 0) newIndex += 12;
                              transposedChord = notes[newIndex] + (isMinor ? 'm' : '') + (chord.includes('7') ? '7' : '');
                            }

                            return (
                              <button
                                key={chord}
                                id={`btn-play-hymn-reference-chord-${transposedChord}`}
                                onClick={() => {
                                  const r = transposedChord.match(/^[A-G]#?/)?.[0] || 'C';
                                  const t = transposedChord.includes('m') ? 'menor' : 'mayor';
                                  playChordRef(r, t, 'grave');
                                  showToast(`Acorde: ${transposedChord}`);
                                }}
                                className="bg-slate-50 border border-slate-205 hover:bg-indigo-50 hover:border-indigo-200 p-2 text-center flex flex-col items-center justify-center transition-all shadow-3xs rounded-xl"
                              >
                                <span className="text-[11px] font-black text-slate-800">{transposedChord}</span>
                                <span className="text-[7px] text-slate-400 font-extrabold tracking-tight mt-0.5">OÍR</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Book pages style for lyric box */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs relative overflow-hidden select-text text-left">
                      <div className="absolute top-0 bottom-0 left-4 w-px bg-red-150/50"></div>
                      <div className="pl-6 space-y-4 font-serif text-[12.5px] leading-relaxed text-slate-700 whitespace-pre-line tracking-wide">
                        {transposeChords(selectedHymn.lyrics, hymnTranspose)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* --- NEW SCREEN: VOCAL WARM-UP (PREP. VOCAL) --- */}
          {/* ========================================== */}
          {currentScreen === 'vocal-warmup' && (
            <motion.div
              key="screen-vocal-warmup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col bg-slate-50 text-left animate-fade-in font-sans"
            >
              <InnerHeader title="Prep. Vocal" showBack={true} backTo="home" />

              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Visual Overview header */}
                <div className="bg-[#0B2545] text-white p-4 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-[#D4AF37]/50 animate-pulse">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="text-[8px] font-black tracking-widest text-[#D4AF37] block uppercase">MINISTERIO SALUDABLE</span>
                  <h4 className="font-sans font-extrabold text-sm tracking-tight leading-none mt-1">Gimnasia y Calentamiento</h4>
                  <p className="text-[10px] text-slate-350 mt-1.5 leading-normal">
                    Evita la fatiga vocal y expande tu rango antes de subir al altar. Practica rutinas de soporte diafragmático y escalas de afinación interactiva.
                  </p>
                </div>

                {/* Vocal Setup configuration */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-10 shadow-3xs space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">1. Configuración de Registro Vocal</span>
                  
                  {/* Voice type selectors */}
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-205">
                    {[
                      { id: 'soprano', label: 'Soprano', desc: 'Soprano' },
                      { id: 'alto', label: 'Alto', desc: 'Alto/Contr' },
                      { id: 'tenor', label: 'Tenor', desc: 'Tenor' },
                      { id: 'bajo', label: 'Bajo', desc: 'Bajo/Bar' }
                    ].map((vClass) => (
                      <button
                        key={vClass.id}
                        id={`btn-warmup-class-${vClass.id}`}
                        onClick={() => {
                          setWarmupVoiceClass(vClass.id as any);
                          showToast(`Frecuencia de Escala ajustada para ${vClass.label}`);
                        }}
                        className={`py-1.5 rounded-lg text-center transition-all ${
                          warmupVoiceClass === vClass.id
                            ? 'bg-[#0B2545] text-white font-extrabold shadow-3xs'
                            : 'text-slate-500 hover:text-slate-800 text-[10px] font-medium'
                        }`}
                      >
                        <span className="text-[9.5px] block font-black leading-none">{vClass.label}</span>
                        <span className="text-[7.5px] opacity-75 mt-0.5 block leading-none">{vClass.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Practice Vowel Selection */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[10px] font-extrabold text-slate-500 tracking-tight">Fonema / Vocal:</span>
                    <div className="flex space-x-1">
                      {['Mmm', 'Liii', 'Ahhh', 'Oooo'].map((vowel) => (
                        <button
                          key={vowel}
                          id={`btn-vowel-select-${vowel}`}
                          onClick={() => setWarmupVowel(vowel)}
                          className={`px-2.5 py-1 text-[9.5px] font-black rounded-lg border transition-all ${
                            warmupVowel === vowel
                              ? 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold shadow-3xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {vowel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Exercises selection Tabs */}
                <div className="flex border-b border-slate-200">
                  <button
                    id="btn-tab-exercise-breath"
                    onClick={() => {
                      setWarmupExerciseType('respiracion');
                      setBreathingActive(false);
                      setScalePlaying(false);
                    }}
                    className={`flex-1 py-1.5 text-[11px] font-black border-b-2 text-center uppercase tracking-tight transition-all ${
                      warmupExerciseType === 'respiracion'
                        ? 'border-[#0B2545] text-[#0B2545] font-black'
                        : 'border-transparent text-slate-500 hover:text-slate-850 font-medium'
                    }`}
                  >
                    💨 Diafragma (Calma)
                  </button>
                  <button
                    id="btn-tab-exercise-scales"
                    onClick={() => {
                      setWarmupExerciseType('escalas');
                      setBreathingActive(false);
                      setScalePlaying(false);
                    }}
                    className={`flex-1 py-1.5 text-[11px] font-black border-b-2 text-center uppercase tracking-tight transition-all ${
                      warmupExerciseType === 'escalas'
                        ? 'border-[#0B2545] text-[#0B2545] font-black'
                        : 'border-transparent text-slate-500 hover:text-slate-850 font-medium'
                    }`}
                  >
                    🎵 Escalas Acústicas
                  </button>
                </div>

                {/* TAB 1 CONTENT: BREATHING METRONOME / DIAPHRAGM COACH */}
                {warmupExerciseType === 'respiracion' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 shadow-3xs text-center">
                    
                    {/* Concentric guided breathing circle animation */}
                    <div className="py-4 flex flex-col items-center justify-center relative">
                      <div className="relative flex items-center justify-center h-40 w-40">
                        {/* Dynamic Background Ripple Pulse ring based on current phase */}
                        <div className={`absolute rounded-full transition-all duration-1000 ${
                          breathingPhase === 'inhale' 
                            ? 'w-36 h-36 bg-blue-105/40 animate-ping' 
                            : breathingPhase === 'hold'
                              ? 'w-38 h-38 bg-amber-105/30'
                              : breathingPhase === 'exhale'
                                ? 'w-24 h-24 bg-teal-105/40 animate-pulse'
                                : 'w-20 h-20 bg-slate-100/75'
                        }`} />

                        {/* Core Diaphragm coaching sphere */}
                        <div className={`rounded-full border flex flex-col items-center justify-center text-center transition-all duration-1000 shadow-sm relative z-5 transform ${
                          breathingPhase === 'inhale'
                            ? 'w-32 h-32 bg-sky-50 border-sky-305 text-sky-800 scale-110 shadow-[0_0_15px_rgba(54,162,235,0.4)]'
                            : breathingPhase === 'hold'
                              ? 'w-32 h-32 bg-amber-50 border-amber-305 text-amber-800 scale-115 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                              : breathingPhase === 'exhale'
                                ? 'w-24 h-24 bg-teal-50 border-teal-301 text-teal-850 scale-90 shadow-[0_0_12px_rgba(20,184,166,0.4)]'
                                : 'w-24 h-24 bg-slate-50 border-slate-202 text-slate-700'
                        }`}>
                          
                          {breathingPhase === 'idle' ? (
                            <Wind className="w-8 h-8 text-slate-400" />
                          ) : (
                            <span className="text-2xl font-black font-mono leading-none">
                              {breathingTimer}s
                            </span>
                          )}

                          <span className="text-[7.5px] tracking-widest uppercase text-slate-400 font-black mt-1 block">
                            {breathingPhase === 'idle' ? 'Listo' : 'Paso'}
                          </span>
                        </div>
                      </div>

                      {/* Explicit state verbal instructions */}
                      <div className="mt-4 space-y-1">
                        <span className={`text-xs font-black uppercase tracking-tight block ${
                          breathingPhase === 'inhale' 
                            ? 'text-sky-600' 
                            : breathingPhase === 'hold'
                              ? 'text-amber-600 animate-pulse'
                              : breathingPhase === 'exhale'
                                ? 'text-teal-605'
                                : 'text-slate-705'
                        }`}>
                          {breathingPhase === 'inhale' && '🗣ï¸ ¡INHALA POR LA NARIZ!'}
                          {breathingPhase === 'hold' && '🛑 ¡RETÉN EL AIRE EN EL DIAFRAGMA!'}
                          {breathingPhase === 'exhale' && '💨 EXHALA SUAVEMENTE (SSSS)'}
                          {breathingPhase === 'idle' && 'Guía de Respiración Estándar 4-4-8'}
                        </span>
                        
                        <p className="text-[9.5px] text-slate-400 leading-normal max-w-xs mx-auto">
                          {breathingPhase === 'inhale' && 'Expande el abdomen llenando los pulmones con calma.'}
                          {breathingPhase === 'hold' && 'Sella los hombros y mantén la presión del soporte estable.'}
                          {breathingPhase === 'exhale' && 'Controla la vía de salida de forma lineal de principio a fin.'}
                          {breathingPhase === 'idle' && 'Ayuda a regular el ritmo cardíaco y a sostener coros extensos.'}
                        </p>
                      </div>
                    </div>

                    {/* Cycle counter readouts and action triggers */}
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-205 p-2.5 rounded-xl">
                      <span className="text-[10px] font-extrabold text-slate-500">Ciclos Completados:</span>
                      <span className="text-emerald-700 bg-emerald-100 border border-emerald-250 font-black px-3 py-1 rounded-lg text-xs leading-none">
                        {breathingCycleCount}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="btn-breathing-control-toggle"
                        onClick={() => {
                          setBreathingActive(!breathingActive);
                          if (!breathingActive) {
                            setBreathingCycleCount(0);
                            showToast("Metrónomo respiratorio iniciado.");
                          } else {
                            showToast("Metrónomo respiratorio pausado.");
                          }
                        }}
                        className={`w-full py-2 text-xs font-black rounded-lg tracking-tight transition-all shadow-3xs uppercase ${
                          breathingActive
                            ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                            : 'bg-[#0B2545] text-white hover:bg-[#07192F]'
                        }`}
                      >
                        {breathingActive ? '⏹ï¸ Detener' : '▶ï¸ Iniciar'}
                      </button>

                      <button
                        id="btn-breathing-reset"
                        onClick={() => {
                          setBreathingActive(false);
                          setBreathingCycleCount(0);
                          setBreathingPhase('idle');
                          setBreathingTimer(4);
                          showToast("Historial respiratorio de unción reiniciado.");
                        }}
                        className="py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-600 text-xs font-black rounded-lg transition-all shadow-3xs uppercase"
                      >
                        🔄 Limpiar
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2 CONTENT: VOCALIZER PIANO SCALES */}
                {warmupExerciseType === 'escalas' && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-4 space-y-4 shadow-3xs text-left">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">2. Reproductor de Escala Interactiva</span>
                    
                    <p className="text-[9.5px] text-slate-500 leading-normal mb-3">
                      Sigue el canto al unísono de la escala del piano. Concéntrate en la vocalización del ejercicio del fonema <span className="font-extrabold text-[#0B2545]">"{warmupVowel}"</span>.
                    </p>

                    {/* Scale Dots / Staff visualizer displaying current scale pitches */}
                    <div className="bg-slate-50 border border-slate-205 py-6 px-4 rounded-3xl flex flex-col items-center justify-center space-y-4">
                      
                      <div className="flex items-end justify-between w-full max-w-xs relative px-1">
                        <div className="absolute top-[44%] left-5 right-5 h-[1.5px] bg-slate-200 z-1" />

                        {(() => {
                          let notes = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'Fa', 'Mi', 'Re', 'Do'];
                          if (warmupVoiceClass === 'alto') {
                            notes = ['La', 'Si', 'Do', 'Re', 'Mi', 'Re', 'Do', 'Si', 'La'];
                          } else if (warmupVoiceClass === 'bajo') {
                            notes = ['Fa', 'Sol', 'La', 'Si', 'Do', 'Si', 'La', 'Sol', 'Fa'];
                          }

                          return notes.map((note, idx) => {
                            const isNodeActive = scalePlaying && activeScaleStep === idx;
                            const verticalOffsets = [0, 8, 16, 24, 32, 24, 16, 8, 0];
                            const heightPx = verticalOffsets[idx];

                            return (
                              <div
                                key={idx}
                                style={{ transform: `translateY(-${heightPx}px)` }}
                                className="flex flex-col items-center justify-center space-y-2 relative z-3 transition-all duration-300 transform"
                              >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-black text-[9.5px] leading-none transition-all shadow-3xs ${
                                  isNodeActive
                                    ? 'bg-amber-400 border-amber-500 text-slate-900 scale-120 ring-[4px] ring-amber-100 font-black'
                                    : 'bg-white border-slate-200 text-slate-650'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[8px] font-black leading-none ${isNodeActive ? 'text-amber-600 font-extrabold' : 'text-slate-400 font-medium'}`}>
                                  {note}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      <div className="h-4"></div>
                    </div>

                    {/* Scale Player triggering mechanism */}
                    <button
                      id="btn-warmup-play-scale"
                      onClick={() => {
                        playVocalWarmupScale();
                        showToast(`Iniciando escala. ¡Lleva tu afinación con "${warmupVowel}"!`);
                      }}
                      disabled={scalePlaying}
                      className={`w-full py-2.5 text-xs font-black rounded-xl uppercase tracking-tight flex items-center justify-center space-x-2 transition-all shadow-3xs ${
                        scalePlaying
                          ? 'bg-amber-100 border border-amber-200 text-amber-850 cursor-not-allowed text-[10px]'
                          : 'bg-[#0B2545] hover:bg-slate-900 text-white'
                      }`}
                    >
                      <Volume2 className={`w-3.5 h-3.5 text-amber-305 ${scalePlaying ? 'animate-bounce' : ''}`} />
                      <span>{scalePlaying ? 'Escala en curso...' : '🔊 Iniciar Escala de Afinación'}</span>
                    </button>
                  </div>
                )}

                {/* Vocal Health Editorial Panel for Pre-Service Ministers */}
                <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-3xs space-y-3 text-left">
                  <span className="text-[10px] font-black tracking-widest text-[#0B2545] block uppercase">CONSEJOS DE ALTAR & VOZ</span>
                  
                  <div className="space-y-2.5">
                    {[
                      { title: '💧 Mantente hidratado', text: 'Toma agua al clima antes de subir. Impide resequedad en los pliegues vocales.' },
                      { title: '💆 Relaja el cuello y hombros', text: 'La tensión física comprime la laringe. Mueve el cuello en rotación de unción gentil.' },
                      { title: '☕ Evita lácteos y cafeína', text: 'Crean exceso de mucosidad o resecan la garganta antes del servicio de alabanza.' },
                      { title: '✝ï¸ Ministra con unción y técnica', text: 'La unción del Espíritu obra maravillas, alabando a Dios con toda la excelencia de tu templo.' }
                    ].map((tip, index) => (
                      <div key={index} className="flex space-x-2.5 items-start">
                        <div className="w-3.5 h-3.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div className="space-y-0.5">
                          <h6 className="text-[10px] font-extrabold text-slate-800 leading-none">{tip.title}</h6>
                          <p className="text-[9px] text-slate-500 leading-relaxed">{tip.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* 11. Profile Screen (Perímetro Personalizado) */}
          {currentScreen === 'profile' && (
            <motion.div 
              key="screen-profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <InnerHeader title="Mi Perfil" showBack={true} backTo="home" />

              <div className="p-4 space-y-4 flex-1 overflow-y-auto text-left">
                {/* Meta details header card */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center space-x-3 shadow-3xs">
                  <img 
                    src={profile.avatarUrl} 
                    alt="profile user" 
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full border border-slate-250 ring-2 ring-[#0B2545]/10"
                  />
                  <div>
                    <h5 className="font-sans font-bold text-slate-800 text-sm tracking-tight">{profile.name}</h5>
                    <p className="text-[10px] text-slate-500">{profile.email}</p>
                    <span className="text-[8px] bg-slate-100 text-slate-500 rounded-md px-1.5 py-0.5 inline-block mt-1 font-mono uppercase font-bold text-indigo-950">
                      Cuenta {profile.authProvider}
                    </span>
                  </div>
                </div>

                {/* Subsections widgets with tabs detail */}
                <div className="space-y-3">
                  {/* Favorited choruses listing */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Mis Corarios Guardados ({profile.favoriteCorarios.length})</span>
                    {profile.favoriteCorarios.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-3 text-center text-[10px] text-slate-400 border border-slate-100">
                        Aún no tienes coros favoritos guardados.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {profile.favoriteCorarios.map(favId => {
                          const corObj = corarios.find(c => c.id === favId);
                          if (!corObj) return null;
                          return (
                            <div 
                              key={favId}
                              onClick={() => {
                                setSelectedCorario(corObj);
                                setCurrentScreen('corario-detail');
                              }}
                              className="bg-white border border-slate-100 p-2 rounded-xl text-left hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                            >
                              <span className="text-[11px] font-bold text-slate-700 line-clamp-1">{corObj.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Registered Courses listing */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Mis Cursos En Progreso ({profile.enrolledCourses.length})</span>
                    {profile.enrolledCourses.length === 0 ? (
                      <button 
                        id="btn-profile-explore-academy"
                        onClick={() => setCurrentScreen('academy')}
                        className="w-full bg-slate-50 rounded-xl p-4 text-center text-[10px] text-slate-400 hover:text-indigo-950 border border-dashed border-slate-200"
                      >
                        Inscríbete en un curso y cultiva tu voz. Explora Academia
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        {profile.enrolledCourses.map(courseId => {
                          const courseObj = courses.find(c => c.id === courseId);
                          if (!courseObj) return null;
                          return (
                            <div 
                              key={courseId}
                              onClick={() => {
                                setSelectedCourse(courseObj);
                                setCurrentScreen('course-detail');
                              }}
                              className="bg-white border border-slate-100 p-2 rounded-xl text-left hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <span className="text-[11.5px] font-bold text-slate-700 block line-clamp-1">{courseObj.title}</span>
                                <span className="text-[8px] text-slate-400 font-medium uppercase tracking-wider">{courseObj.instructor}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-100 border border-slate-200 p-3 rounded-2xl space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">UTILIDADES DE SESION</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-600">Modo Oscuro</span>
                      <button 
                        id="btn-toggle-dark-mode"
                        onClick={toggleDarkMode}
                        className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-colors shadow-2xs ${
                          isDarkMode ? 'bg-[#38bdf8] text-slate-950' : 'bg-slate-350 text-slate-700 hover:bg-slate-400'
                        }`}
                      >
                        {isDarkMode ? 'ACTIVADO' : 'APAGADO'}
                      </button>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/50 flex space-x-2">
                      <button 
                        id="btn-developer-logout"
                        onClick={() => {
                          void onSignOut?.();
                          showToast('Sesión cerrada.');
                        }}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] py-1.5 rounded-lg flex items-center justify-center space-x-1 font-bold"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* --- SMARTPHONE APP NAVIGATION BAR (Always visible in home or lists, etc) --- */}
        {['home', 'corarios-list', 'academy', 'recursos', 'mentorias', 'profile'].includes(currentScreen) && (
          <div className={`h-14 border-t flex items-center justify-around shrink-0 z-10 px-1 relative transition-colors ${
            isDarkMode ? 'bg-slate-800 border-slate-750 text-slate-100' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            {[
              { icon: HomeIcon, label: 'Inicio', id: 'home' },
              { icon: BookOpen, label: 'Corarios', id: 'corarios-list' },
              { icon: PlayCircle, label: 'Cursos', id: 'academy' },
              { icon: User, label: 'Perfil', id: 'profile' }
            ].map((tab) => {
              const isActive = currentScreen === tab.id;
              return (
                <button 
                  key={tab.id}
                  id={`btn-bottom-tab-${tab.id}`}
                  onClick={() => {
                    setSelectedCorario(null);
                    setSelectedCourse(null);
                    
                    // Intercept access based on dynamic monetization rules
                    if (tab.id === 'corarios-list' && isSectionLocked('corarios')) {
                      handleOpenCheckout('corarios', 'Corarios y Cadenas');
                    } else {
                      setCurrentScreen(tab.id);
                    }
                  }}
                  className={`flex flex-col items-center justify-center space-y-1 py-1 px-3 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:text-amber-400' : 'hover:text-[#0B2545]'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${
                    isActive 
                      ? (isDarkMode ? 'text-amber-400 stroke-2' : 'text-[#0B2545] stroke-2') 
                      : 'text-slate-400 stroke-1.5'
                  }`} />
                  <span className={`text-[8.5px] font-bold ${
                    isActive 
                      ? (isDarkMode ? 'text-amber-400 font-black' : 'text-[#0B2545] font-black') 
                      : 'text-slate-400'
                  }`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* --- CONTENT ACCESS CONFIRMATION MODAL --- */}
        {showCartCheckout && (
          <div id="cart-checkout-overlay" className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50 font-sans">
            <div id="cart-checkout-modal" className="bg-white w-full max-w-[310px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85%] border border-slate-100 relative">
              
              {/* Header */}
              <div className="bg-[#0B2545] text-white p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] block">CorAM</span>
                    <h4 className="text-[11px] font-black leading-none">Confirmación de acceso</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCartCheckout(false)}
                  className="text-white/70 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Checkout Progress / Content */}
              {!checkoutSuccess ? (
                <div className="p-4 flex-1 overflow-y-auto space-y-4 text-left">
                  
                  {/* Bill Details */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider block">Servicio Solicitado:</span>
                    <h5 className="font-extrabold text-xs text-slate-800 tracking-tight leading-normal mt-0.5">{checkoutItemName}</h5>
                    
                    <div className="flex items-center justify-between border-t border-slate-200/50 mt-2.5 pt-2 font-mono">
                      <span className="text-[9.5px] font-bold text-slate-500">Estado:</span>
                      <span className="text-sm font-black text-[#0B2545] bg-[#0B2545]/5 px-2 py-0.5 rounded-md">
                        {checkoutItemPrice}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods tabs selector */}
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Elegir medio de contacto:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'whatsapp', label: 'WhatsApp' }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`text-[9px] font-bold py-1.5 rounded-lg text-center transition-all border ${
                            paymentMethod === method.id 
                              ? 'bg-amber-500/10 border-amber-500 text-amber-900 font-extrabold' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'whatsapp' && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl space-y-2 text-center">
                      <span className="text-xs font-black text-emerald-800 block">💬 Consultar por WhatsApp</span>
                      <p className="text-[9.5px] text-slate-600 leading-normal">
                        ¿Prefieres coordinar directamente? Presiona el botón de consulta a continuación para enviarle un mensaje predeterminado a <strong>Angie MZ</strong>.
                      </p>
                    </div>
                  )}

                  {/* Checkout Actions Buttons */}
                  <div className="pt-2 border-t border-slate-100">
                    {paymentMethod === 'whatsapp' ? (
                      <a
                        href="https://wa.me/5491112345678?text=Hola%20Angie,%20me%20gustaria%20adquirir%20el%20acceso%20a%20CorAM"
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          showToast('Abriendo chat con Angie MZ...');
                          setShowCartCheckout(false);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-xl text-[10px] text-center uppercase tracking-wider block transition-colors shadow-xs"
                      >
                        Enviar Mensaje Directo
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          if (paymentMethod === 'card' && (!cardNumber || !cardName)) {
                            showToast('Por favor completa los datos requeridos.');
                            return;
                          }
                          handleUnavailablePayment();
                        }}
                        disabled={checkoutProcessing}
                        className="w-full bg-[#0B2545] hover:bg-slate-900 border border-slate-800 text-white font-black py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1 transition-colors shadow-xs cursor-pointer"
                      >
                        {checkoutProcessing ? (
                          <>
                            <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <span>Continuar</span>
                        )}
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                /* Success screen */
                <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center min-h-[260px]">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-6 h-6 stroke-2" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Acceso disponible</h4>
                    <span className="text-[10px] font-mono text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">ID TRANS: #TX2026-CORAM</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-2">
                      Tu cuenta ya tiene acceso a las herramientas del cancionero, cursos y mentorías. ¡Adora con alegría!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCartCheckout(false);
                      // Automatic screen routing to unlock experience!
                      if (checkoutTargetId === 'courses') {
                        setCurrentScreen(selectedCourse ? 'course-detail' : 'academy');
                      } else if (checkoutTargetId === 'corarios') {
                        setCurrentScreen('corarios-list');
                      } else if (checkoutTargetId === 'tuner_piano') {
                        setCurrentScreen('vocal-tuner');
                      } else if (checkoutTargetId === 'resources') {
                        setCurrentScreen('recursos');
                      } else if (checkoutTargetId === 'mentorships') {
                        setCurrentScreen('mentorias');
                      } else if (checkoutTargetId === 'hymnarios') {
                        setCurrentScreen('himnarios');
                      } else if (checkoutTargetId === 'warmups') {
                        setCurrentScreen('vocal-warmup');
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Empezar a Edificar mi Voz
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Bottom bar capsule decoration */}
        <div className="w-full h-5 bg-white flex justify-center items-center shrink-0 select-none pb-1">
          <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};
