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

  return {
    async get(): Promise<BrowserAudioContext> {
      if (!context || context.state === 'closed') {
        context = new AudioContextClass();
      }

      if (context.state === 'suspended') {
        await context.resume();
      }

      return context;
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
