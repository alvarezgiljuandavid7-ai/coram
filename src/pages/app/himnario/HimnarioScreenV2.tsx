import { motion } from 'motion/react';
import { useEffect, useRef, useState, type Key } from 'react';
import {
  ArrowRight,
  BookMarked,
  BookOpenText,
  ChevronDown,
  Heart,
  Music2,
  PlayCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddToCollectionControl } from '../../../components/app-premium/AddToCollectionControl';
import { EmptyStatePremium, LoadingStatePremium } from '../../../components/app-premium/PremiumApp';
import { getHymnLyrics } from '../../../domain/hymns/hymnSearch';
import type { Hymn } from '../../../domain/hymns/types';
import { getNextHymnRenderCount, HYMN_RENDER_BATCH_SIZE, type HimnarioFilters } from './himnarioViewModel';
import styles from './HimnarioScreenV2.module.css';

type HimnarioViewModel = ReturnType<typeof import('./himnarioViewModel').buildHimnarioViewModel>;

interface HimnarioScreenV2Props {
  viewModel: HimnarioViewModel;
  filters: HimnarioFilters;
  selected: Hymn | null;
  loading: boolean;
  error: string | null;
  isFavorite: (hymnId: string) => boolean;
  onQueryChange: (value: string) => void;
  onKeyChange: (value: string) => void;
  onToggleOnlyFavorites: () => void;
  onResetFilters: () => void;
  onOpenHymn: (hymn: Hymn) => void;
  onCloseHymn: () => void;
  onToggleFavorite: (hymnId: string) => void;
}

export function HimnarioScreenV2({
  viewModel,
  filters,
  selected,
  loading,
  error,
  isFavorite,
  onQueryChange,
  onKeyChange,
  onToggleOnlyFavorites,
  onResetFilters,
  onOpenHymn,
  onCloseHymn,
  onToggleFavorite,
}: HimnarioScreenV2Props) {
  const hasFilters = Boolean(filters.query) || filters.key !== 'Todos' || filters.onlyFavorites;
  const [renderedCount, setRenderedCount] = useState(HYMN_RENDER_BATCH_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const visibleHymns = viewModel.items.slice(0, renderedCount);
  const hasMoreHymns = visibleHymns.length < viewModel.items.length;

  useEffect(() => {
    setRenderedCount(Math.min(HYMN_RENDER_BATCH_SIZE, viewModel.items.length));
  }, [filters.key, filters.onlyFavorites, filters.query, viewModel.items.length]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasMoreHymns || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRenderedCount((current) => getNextHymnRenderCount(current, viewModel.items.length));
      }
    }, { rootMargin: '520px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreHymns, viewModel.items.length]);

  const loadMoreHymns = () => {
    setRenderedCount((current) => getNextHymnRenderCount(current, viewModel.items.length));
  };

  return (
    <div className={`${styles.screen} min-h-screen text-[#0B2545]`}>
      <main className="mx-auto max-w-7xl space-y-5 px-5 pb-8 pt-5 sm:px-7 md:space-y-9 md:px-10 md:pb-10 lg:px-12">
        <section className={`${styles.heading} relative min-h-0 py-2 md:min-h-52 md:py-7`}>
          <div className="relative z-10 max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#B5811F]">Biblioteca congregacional</p>
            <h1 className="mt-2 font-serif text-[clamp(2.45rem,9vw,5.8rem)] leading-[0.92] tracking-tight">Himnario</h1>
            <span className="mt-4 block h-1 w-10 rounded-full bg-[#F6BB18]" />
            <p className="mt-3 max-w-md text-[clamp(0.96rem,3vw,1.18rem)] leading-6 text-[#31425b]">
              Himnos, letras y memoria para cantar juntos con propósito.
            </p>
          </div>
          <div aria-hidden="true" className="absolute bottom-5 right-[8%] hidden text-[#d7a743]/45 sm:block">
            <BookOpenText className="h-20 w-20 stroke-[1.1]" />
          </div>
        </section>

        <section className={`${styles.heroImage} relative min-h-[20rem] overflow-hidden rounded-[1.7rem] border border-white/70 p-6 shadow-[0_18px_40px_rgba(43,49,55,0.13)] sm:min-h-[19rem] sm:p-8 md:p-10`}>
          <div className="relative z-10 max-w-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f0df] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#3d7146]">
              <BookMarked className="h-3.5 w-3.5" /> Colección publicada
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2.1rem,7vw,3.6rem)] leading-[0.96] tracking-tight text-[#17305a]">
              Cantos que atraviesan generaciones
            </h2>
            <p className="mt-4 max-w-xs text-base leading-6 text-[#3f4b5f]">Encuentra la letra, guarda tus himnos y prepara el repertorio del próximo servicio.</p>
            <Link to="/app/colecciones" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#4a8a55] px-5 text-sm font-bold text-white shadow-lg shadow-[#477f50]/25 transition hover:bg-[#3d7948] active:scale-[0.98]">
              Ver colecciones <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {!filters.query && <section className="grid grid-cols-3 overflow-hidden rounded-[1.2rem] border border-white bg-white shadow-[0_10px_22px_rgba(34,49,64,0.06)] sm:rounded-[1.35rem]">
          <MetricCard label="Himnos" detail="Disponibles" value={viewModel.metrics.available} icon={BookMarked} tone="green" />
          <MetricCard label="Favoritos" detail="Guardados" value={viewModel.metrics.favorites} icon={Heart} tone="gold" />
          <MetricCard label="Resultados" detail="Búsqueda actual" value={viewModel.metrics.results} icon={Search} tone="lilac" />
        </section>}

        <section className="space-y-3">
          <div className="flex min-h-14 items-center gap-3 rounded-[1.35rem] border border-[#0B2545]/10 bg-white px-5 shadow-[0_7px_22px_rgba(24,45,71,0.07)] focus-within:border-[#4a8a55] focus-within:ring-4 focus-within:ring-[#4a8a55]/10">
            <Search className="h-6 w-6 shrink-0" />
            <label className="sr-only" htmlFor="himnario-search">Buscar himnos</label>
            <input id="himnario-search" value={filters.query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar por número, título o letra..." className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400" />
            <button type="button" onClick={onResetFilters} className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${hasFilters ? 'bg-[#e8f1e6] text-[#367240]' : 'text-[#4a8a55] hover:bg-[#f3f8f1]'}`} aria-label="Limpiar filtros">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]"><Music2 className="h-4 w-4" /> Tono</span>
            <div className="flex gap-2">
              {viewModel.keys.map((key) => <FilterChip key={key} active={filters.key === key} label={key} onClick={() => onKeyChange(key)} />)}
              <button type="button" onClick={onToggleOnlyFavorites} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition active:scale-95 ${filters.onlyFavorites ? 'bg-[#4a8a55] text-white shadow-md shadow-[#4a8a55]/20' : 'border border-[#0B2545]/8 bg-white text-[#233653]'}`}>
                <Heart className={`h-4 w-4 ${filters.onlyFavorites ? 'fill-current' : ''}`} /> Favoritos
              </button>
            </div>
          </div>
        </section>

        {error && <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-900">{error}</div>}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="font-serif text-[clamp(1.85rem,8vw,2.55rem)] leading-none">{filters.query ? 'Resultados' : 'Himnos disponibles'}</h2>{filters.query && <p className="mt-2 text-sm font-semibold text-[#3d7146]" aria-live="polite">{viewModel.metrics.results} resultado{viewModel.metrics.results === 1 ? '' : 's'} para &quot;{filters.query}&quot;</p>}</div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0B2545]/10 bg-white px-4 py-2 text-sm font-semibold text-[#31425b]">Por número <ChevronDown className="h-4 w-4" /></span>
            </div>
            {loading ? (
              <LoadingStatePremium label="Cargando himnario..." />
            ) : viewModel.items.length === 0 ? (
              <EmptyStatePremium icon={BookMarked} title="No encontramos himnos" body="Prueba con otro número, tono, título o fragmento de la letra." />
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-[#0B2545]/8 bg-white shadow-[0_16px_35px_rgba(19,38,63,0.08)]">
                {visibleHymns.map((hymn, index) => (
                  <HymnRow key={hymn.id} hymn={hymn} active={selected?.id === hymn.id || index === 0} favorite={isFavorite(hymn.id)} onOpen={() => onOpenHymn(hymn)} onFavorite={() => onToggleFavorite(hymn.id)} />
                ))}
                {hasMoreHymns && <div ref={loadMoreRef} className="flex flex-col items-center gap-2 border-t border-[#0B2545]/7 p-5 text-center">
                  <p className="text-sm text-[#596576]" aria-live="polite">Mostrando {visibleHymns.length} de {viewModel.items.length} himnos</p>
                  <button type="button" onClick={loadMoreHymns} className="min-h-11 rounded-full border border-[#0B2545]/12 bg-[#fffdf8] px-4 text-sm font-bold text-[#0B2545] transition hover:border-[#4a8a55] hover:text-[#3d7948] active:scale-[0.98]">Cargar {Math.min(HYMN_RENDER_BATCH_SIZE, viewModel.items.length - visibleHymns.length)} más</button>
                </div>}
              </div>
            )}
          </div>
          <aside className="hidden xl:sticky xl:top-28 xl:block xl:h-fit">
            <HymnPreview hymn={selected} favorite={selected ? isFavorite(selected.id) : false} onFavorite={() => selected && onToggleFavorite(selected.id)} />
          </aside>
        </section>
      </main>

      {selected && <MobileHymnDialog hymn={selected} favorite={isFavorite(selected.id)} onClose={onCloseHymn} onFavorite={() => onToggleFavorite(selected.id)} />}
    </div>
  );
}

function FilterChip({ active, label, onClick }: { key?: Key; active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold transition active:scale-95 ${active ? 'bg-[#4a8a55] text-white shadow-md shadow-[#4a8a55]/20' : 'border border-[#0B2545]/8 bg-white text-[#233653]'}`}>{label}</button>;
}

function MetricCard({ label, detail, value, icon: Icon, tone }: { label: string; detail: string; value: number; icon: typeof BookMarked; tone: 'green' | 'gold' | 'lilac' }) {
  const tones = { green: 'bg-[#f0f6ed] text-[#4a8a55]', gold: 'bg-[#fff6e6] text-[#bb7c12]', lilac: 'bg-[#f6f0fb] text-[#9063aa]' };
  return <div className={`flex min-w-0 flex-col items-center justify-center gap-1 border-r border-white/90 p-2 text-center last:border-r-0 sm:flex-row sm:justify-start sm:gap-2 sm:p-3 ${tones[tone]}`}><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/85 shadow-sm sm:h-9 sm:w-9"><Icon className={`h-4 w-4 ${label === 'Favoritos' ? 'fill-current' : ''}`} /></div><div className="min-w-0"><p className="text-lg font-black leading-none text-[#0B2545] sm:text-xl">{value}</p><p className="mt-1 text-[10px] font-bold leading-tight text-[#0B2545] sm:text-xs">{label}</p><p className="hidden text-xs text-[#4e5a6d] lg:block">{detail}</p></div></div>;
}

function HymnRow({ hymn, active, favorite, onOpen, onFavorite }: { key?: Key; hymn: Hymn; active: boolean; favorite: boolean; onOpen: () => void; onFavorite: () => void }) {
  return <article className={`${styles.hymnRow} ${active ? styles.rowActive : 'bg-white'} flex min-w-0 items-center gap-2 border-b border-[#0B2545]/7 p-3 last:border-b-0 sm:gap-4 sm:p-4`}>
    <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(145deg,#17305a,#335b69)] text-lg font-black text-[#f1c967] shadow-md sm:h-16 sm:w-16 sm:text-xl">{hymn.number || '–'}</span><span className="min-w-0"><span className="inline-flex rounded-full bg-[#e2efdf] px-2 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#49704d]">Himno {hymn.number || 'sin número'}</span><span className="mt-1 block line-clamp-2 break-words font-sans text-[0.98rem] font-bold leading-[1.15] text-[#0B2545] sm:font-serif sm:text-[clamp(1.12rem,4vw,1.5rem)]">{hymn.title}</span><span className="mt-1 block truncate text-xs text-[#596576] sm:text-sm">♫ {getHymnLyrics(hymn).replace(/\s+/g, ' ')}</span></span></button>
    <span className="hidden h-9 min-w-9 place-items-center rounded-full bg-[#fff0cf] px-2 text-sm font-black text-[#a56b09] sm:grid">{hymn.key || 'C'}</span>
    <button type="button" onClick={onFavorite} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white transition active:scale-95 ${favorite ? 'border-[#4a8a55] text-[#4a8a55]' : 'border-[#0B2545]/8'}`} aria-label={favorite ? `Quitar ${hymn.title} de favoritos` : `Guardar ${hymn.title} en favoritos`}><Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} /></button>
    <button type="button" onClick={onOpen} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-md shadow-[#0B2545]/10 transition active:scale-95" aria-label={`Abrir ${hymn.title}`}><ArrowRight className="h-5 w-5" /></button>
  </article>;
}

function HymnPreview({ hymn, favorite, onFavorite }: { hymn: Hymn | null; favorite: boolean; onFavorite: () => void }) {
  return <div className="overflow-hidden rounded-[1.6rem] bg-[#0B2545] p-6 text-white shadow-xl shadow-[#0B2545]/20"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e4ba56]">{hymn ? `Himno ${hymn.number}` : 'Vista previa'}</p><h3 className="mt-3 font-serif text-3xl leading-none">{hymn?.title ?? 'Selecciona un himno'}</h3>{hymn ? <><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={onFavorite} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e4ba56] px-4 text-xs font-black text-[#0B2545]"><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />{favorite ? 'Guardado' : 'Guardar'}</button><Link to={`/app/ensayo/hymn/${hymn.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-black"><PlayCircle className="h-4 w-4" /> Ensayar</Link></div><pre className="mt-5 max-h-[48vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-white/8 p-4 font-sans text-sm leading-7 text-slate-100">{getHymnLyrics(hymn)}</pre><div className="mt-4"><AddToCollectionControl entityType="hymn" entityId={hymn.id} /></div></> : <p className="mt-4 text-sm leading-6 text-slate-300">Abre un himno para leer la letra, guardarlo o llevarlo a modo ensayo.</p>}</div>;
}

function MobileHymnDialog({ hymn, favorite, onClose, onFavorite }: { hymn: Hymn; favorite: boolean; onClose: () => void; onFavorite: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end bg-[#0B2545]/60 p-3 pt-16 xl:hidden" role="dialog" aria-modal="true" aria-label={`Detalle de ${hymn.title}`}><button type="button" aria-label="Cerrar letra" className="absolute inset-0" onClick={onClose} /><motion.section initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative flex max-h-[86vh] w-full flex-col overflow-hidden rounded-[1.7rem] bg-[#fffdf8] shadow-2xl"><div className="flex items-start justify-between border-b border-[#0B2545]/8 p-5"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a56b09]">Himno {hymn.number} · Tono {hymn.key || 'C'}</p><h3 className="mt-2 font-serif text-3xl leading-none">{hymn.title}</h3></div><button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3ebdc]" aria-label="Cerrar"><X className="h-5 w-5" /></button></div><pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-5 font-sans text-base leading-8 text-[#243651]">{getHymnLyrics(hymn)}</pre><div className="flex flex-wrap gap-2 border-t border-[#0B2545]/8 p-4"><button type="button" onClick={onFavorite} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#4a8a55] px-4 text-sm font-bold text-white"><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />{favorite ? 'Guardado' : 'Guardar'}</button><Link to={`/app/ensayo/hymn/${hymn.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0B2545]/12 px-4 text-sm font-bold"><PlayCircle className="h-4 w-4" /> Modo ensayo</Link><AddToCollectionControl entityType="hymn" entityId={hymn.id} /></div></motion.section></div>;
}
