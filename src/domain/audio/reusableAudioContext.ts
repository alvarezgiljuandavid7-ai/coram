type BrowserAudioContext = AudioContext & {
  state: AudioContextState;
  resume: () => Promise<void>;
  close: () => Promise<void>;
};

type BrowserAudioContextConstructor = new () => BrowserAudioContext;

export function getBrowserAudioContextClass(): BrowserAudioContextConstructor {
  return (window.AudioContext || (window as typeof window & { webkitAudioContext?: BrowserAudioContextConstructor }).webkitAudioContext) as BrowserAudioContextConstructor;
}

export function createReusableAudioContext(AudioContextClass: BrowserAudioContextConstructor) {
  let context: BrowserAudioContext | null = null;
  let resumePromise: Promise<void> | null = null;

  const getOrCreateContext = () => {
    if (!context || context.state === 'closed') {
      context = new AudioContextClass();
      resumePromise = null;
    }

    return context;
  };

  const requestResume = (activeContext: BrowserAudioContext) => {
    if (activeContext.state !== 'suspended') return null;

    if (!resumePromise) {
      resumePromise = activeContext.resume().finally(() => {
        resumePromise = null;
      });
    }

    return resumePromise;
  };

  return {
    prepareFromUserGesture(): BrowserAudioContext {
      const activeContext = getOrCreateContext();
      // Safari only accepts this resume call while the original tap is active.
      void requestResume(activeContext);
      return activeContext;
    },
    async get(): Promise<BrowserAudioContext> {
      const activeContext = getOrCreateContext();
      const pendingResume = requestResume(activeContext);

      if (pendingResume) {
        await pendingResume;
      }

      return activeContext;
    },
    async dispose(): Promise<void> {
      if (!context || context.state === 'closed') {
        context = null;
        return;
      }

      const activeContext = context;
      context = null;
      await activeContext.close();
    },
  };
}
