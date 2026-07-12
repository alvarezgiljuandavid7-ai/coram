import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Gauge, Moon, Music2, Sun } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useCoramApp } from '../../app/CoramAppContext';
import { getHymnLyrics } from '../../domain/hymns/hymnSearch';
import { defaultReadingPreferences } from '../../domain/engagement/readingPreferencesRepository';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

export function ReadingModePage() {
  const { entityType, entityId } = useParams();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get('collection');
  const {
    state,
    hymns,
    collections,
    readingPreferences,
    saveUserReadingPreferences,
    recordRecentActivity,
  } = useCoramApp();

  const [fontSize, setFontSize] = useState(readingPreferences?.fontSize ?? defaultReadingPreferences.fontSize);
  const [lineHeight, setLineHeight] = useState(readingPreferences?.lineHeight ?? defaultReadingPreferences.lineHeight);
  const [theme, setTheme] = useState(readingPreferences?.theme ?? defaultReadingPreferences.theme);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    if (!readingPreferences) return;
    setFontSize(readingPreferences.fontSize);
    setLineHeight(readingPreferences.lineHeight);
    setTheme(readingPreferences.theme);
  }, [readingPreferences]);

  const collection = collections.find((item) => item.id === collectionId);
  const collectionItems = collection?.items ?? [];
  const currentIndex = collectionItems.findIndex((item) => item.entityType === entityType && item.entityId === entityId);
  const previous = currentIndex > 0 ? collectionItems[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < collectionItems.length - 1 ? collectionItems[currentIndex + 1] : null;

  const content = useMemo(() => {
    if (entityType === 'corario') {
      const corario = state.corarios.find((item) => item.id === entityId);
      if (!corario) return null;
      return {
        title: corario.title,
        subtitle: `Corario / Tono ${corario.key}`,
        meta: [`Tono ${corario.key}`, corario.tempo ? `${corario.tempo} BPM` : 'Tempo libre'],
        body: corario.lyrics,
        backTo: '/app/corarios',
      };
    }

    if (entityType === 'hymn') {
      const hymn = hymns.find((item) => item.id === entityId);
      if (!hymn) return null;
      return {
        title: hymn.title,
        subtitle: `Himno ${hymn.number}`,
        meta: [`Tono ${hymn.key}`, hymn.hymnalName],
        body: getHymnLyrics(hymn),
        backTo: '/app/himnario',
      };
    }

    return null;
  }, [entityId, entityType, hymns, state.corarios]);

  useEffect(() => {
    if (!content || !entityType || !entityId) return;
    void recordRecentActivity({
      entityType: entityType === 'hymn' ? 'hymn' : 'corario',
      entityId,
      title: content.title,
      route: `/app/ensayo/${entityType}/${entityId}${collectionId ? `?collection=${collectionId}` : ''}`,
    });
  }, [collectionId, content, entityId, entityType, recordRecentActivity]);

  useEffect(() => {
    let sentinel: WakeLockSentinelLike | null = null;
    const wakeLock = 'wakeLock' in navigator ? (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }).wakeLock : undefined;

    if (!wakeLock) return undefined;

    wakeLock
      .request('screen')
      .then((nextSentinel) => {
        sentinel = nextSentinel;
        setWakeLockActive(true);
      })
      .catch(() => setWakeLockActive(false));

    return () => {
      setWakeLockActive(false);
      void sentinel?.release();
    };
  }, []);

  const persistPreferences = () =>
    saveUserReadingPreferences({
      fontSize,
      lineHeight,
      theme,
    });

  if (!content) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 text-white">
        <Link to="/app/colecciones" className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-[#0B2545]">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <p className="mt-8 text-lg font-black">No encontramos este contenido.</p>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const stepLabel = collection && currentIndex >= 0 ? `${currentIndex + 1}/${collectionItems.length}` : 'Libre';
  const progress =
    collectionItems.length > 0 && currentIndex >= 0 ? ((currentIndex + 1) / collectionItems.length) * 100 : 0;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-50' : 'bg-[oklch(98.5%_0.006_90)] text-[#0B2545]'}`}>
      <header className={`sticky top-0 z-20 border-b px-3 py-3 ${isDark ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link to={collectionId ? '/app/colecciones' : content.backTo} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37] text-slate-950">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-[#B5811F]">
              {collection ? `${collection.name} - ${stepLabel}` : content.subtitle}
            </p>
            <h1 className="truncate text-lg font-black">{content.title}</h1>
          </div>
          <button type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-current/10">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4">
        <section className={`rounded-[1.6rem] border p-4 shadow-xl ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
          {collection && (
            <div className="mb-4 rounded-2xl border border-current/10 p-3">
              <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#B5811F]">
                <span>Paso {stepLabel}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-current/10">
                <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="mb-4 grid gap-2 min-[430px]:grid-cols-2">
            {content.meta.map((item) => (
              <span
                key={item}
                className={`inline-flex min-h-10 items-center gap-2 rounded-2xl border px-3 text-sm font-black ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <Music2 className="h-4 w-4 text-[#B5811F]" />
                {item}
              </span>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-black uppercase tracking-wider text-[#B5811F]">
              Tamaño
              <input type="range" min={16} max={34} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-2 w-full" />
            </label>
            <label className="text-xs font-black uppercase tracking-wider text-[#B5811F]">
              Espaciado
              <input type="range" min={1.2} max={2.4} step={0.1} value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} className="mt-2 w-full" />
            </label>
            <button type="button" onClick={() => void persistPreferences()} className="min-h-11 rounded-2xl bg-[#D4AF37] px-4 text-sm font-black text-slate-950">
              Guardar preferencias
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFontSize((value) => Math.max(16, value - 1))}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-current/10 px-4 text-sm font-black transition active:scale-[0.98]"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize((value) => Math.min(34, value + 1))}
              className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-current/10 px-4 text-sm font-black transition active:scale-[0.98]"
            >
              A+
            </button>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-current/10 px-3 text-xs font-bold opacity-75">
              <Gauge className="h-4 w-4" />
              {wakeLockActive ? 'Pantalla activa' : 'Pantalla normal'}
            </span>
          </div>
        </section>

        <article className="mt-4">
          <pre
            className={`whitespace-pre-wrap rounded-[1.6rem] border p-5 font-sans shadow-xl ${isDark ? 'border-white/10 bg-slate-900 text-slate-50' : 'border-slate-200 bg-white text-[#0B2545]'}`}
            style={{ fontSize, lineHeight }}
          >
            {content.body}
          </pre>
        </article>
      </main>

      {collection && (
        <nav className={`fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 mx-auto grid max-w-3xl grid-cols-2 gap-2 rounded-[1.4rem] border p-2 shadow-2xl ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <CollectionNavButton item={previous} label="Anterior" icon="left" />
          <CollectionNavButton item={next} label="Siguiente" icon="right" />
        </nav>
      )}
    </div>
  );
}

function CollectionNavButton({
  item,
  label,
  icon,
}: {
  item: { entityType: 'corario' | 'hymn'; entityId: string; collectionId: string } | null;
  label: string;
  icon: 'left' | 'right';
}) {
  if (!item) {
    return <span className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-current/10 text-sm font-black opacity-35">{label}</span>;
  }

  return (
    <Link
      to={`/app/ensayo/${item.entityType}/${item.entityId}?collection=${item.collectionId}`}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-3 text-sm font-black text-slate-950"
    >
      {icon === 'left' && <ChevronLeft className="h-4 w-4" />}
      {label}
      {icon === 'right' && <ChevronRight className="h-4 w-4" />}
    </Link>
  );
}
