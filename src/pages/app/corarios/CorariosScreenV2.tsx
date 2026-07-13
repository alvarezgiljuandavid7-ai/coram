import { motion } from 'motion/react';
import type { ElementType } from 'react';
import {
  ArrowRight,
  BookOpenText,
  ChevronDown,
  Heart,
  Music2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddToCollectionControl } from '../../../components/app-premium/AddToCollectionControl';
import { BackButton, BrandedIcon, EmptyStatePremium, LoadingStatePremium } from '../../../components/app-premium/PremiumApp';
import type { Corario } from '../../../types';
import type { CorariosFilters } from './corariosViewModel';
import styles from './CorariosScreenV2.module.css';

type CorariosViewModel = ReturnType<typeof import('./corariosViewModel').buildCorariosViewModel>;

interface CorariosScreenV2Props {
  viewModel: CorariosViewModel;
  filters: CorariosFilters;
  selected: Corario | null;
  loading: boolean;
  error: string | null;
  isFavorite: (corarioId: string) => boolean;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onKeyChange: (value: string) => void;
  onResetFilters: () => void;
  onOpenCorario: (corario: Corario) => void;
  onCloseCorario: () => void;
  onToggleFavorite: (corarioId: string) => void;
}

export function CorariosScreenV2({
  viewModel,
  filters,
  selected,
  loading,
  error,
  isFavorite,
  onQueryChange,
  onCategoryChange,
  onKeyChange,
  onResetFilters,
  onOpenCorario,
  onCloseCorario,
  onToggleFavorite,
}: CorariosScreenV2Props) {
  const hasFilters = filters.query || filters.category !== 'Todos' || filters.key !== 'Todos';

  return (
    <div className={`${styles.screen} min-h-screen text-[#0B2545]`}>
      <main className="mx-auto max-w-7xl space-y-7 px-5 pb-8 pt-7 sm:px-7 md:space-y-9 md:px-10 md:pb-10 lg:px-12">
        <section className={`${styles.heading} relative min-h-48 py-4 md:min-h-52 md:py-7`}>
          <div className="relative z-10 max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#B5811F]">Biblioteca</p>
            <h1 className="mt-2 font-serif text-[clamp(3.15rem,10vw,5.8rem)] leading-[0.9] tracking-tight text-[#0B2545]">Corarios</h1>
            <span className="mt-5 block h-1 w-10 rounded-full bg-[#F6BB18]" />
            <p className="mt-4 max-w-sm text-[clamp(1rem,3vw,1.18rem)] leading-7 text-[#31425b]">Letras, tonos y repertorio para ministrar con excelencia.</p>
          </div>
          <div aria-hidden="true" className={`${styles.noteField} absolute bottom-3 right-0 hidden h-28 w-[44%] opacity-75 sm:block`}>
            <Music2 className="absolute bottom-7 left-[20%] h-6 w-6 rotate-12 text-[#e0ae4e]/55" />
            <Music2 className="absolute right-[18%] top-4 h-7 w-7 -rotate-12 text-[#e0ae4e]/55" />
          </div>
        </section>

        <section className={`${styles.heroImage} relative min-h-[20rem] overflow-hidden rounded-[1.7rem] border border-white/70 p-6 shadow-[0_18px_40px_rgba(43,49,55,0.13)] sm:min-h-[19rem] sm:p-8 md:p-10`}>
          <div className="relative z-10 max-w-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1c9] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#a56b09]"><BookOpenText className="h-3.5 w-3.5 fill-current" /> Biblioteca activa</span>
            <h2 className="mt-5 font-serif text-[clamp(2.1rem,7vw,3.6rem)] leading-[0.96] tracking-tight text-[#17305a]">Repertorio que inspira y edifica</h2>
            <p className="mt-4 max-w-xs text-base leading-6 text-[#3f4b5f]">Accede a letras completas, acordes y tonos para cada momento.</p>
            <Link to="/app/colecciones" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#4a8a55] px-5 text-sm font-bold text-white shadow-lg shadow-[#477f50]/25 transition hover:bg-[#3d7948] active:scale-[0.98]">Explorar colección <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div aria-label="Carrusel de biblioteca, posicion uno de cinco" className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {[0, 1, 2, 3, 4].map((dot) => <span key={dot} className={`h-2.5 rounded-full ${dot === 0 ? 'w-4 bg-[#F6BB18]' : 'w-2.5 bg-white/85'}`} />)}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex min-h-14 items-center gap-3 rounded-[1.35rem] border border-[#0B2545]/10 bg-white px-5 shadow-[0_7px_22px_rgba(24,45,71,0.07)] focus-within:border-[#4a8a55] focus-within:ring-4 focus-within:ring-[#4a8a55]/10">
            <Search className="h-6 w-6 shrink-0 text-[#0B2545]" />
            <label className="sr-only" htmlFor="corarios-search">Buscar corarios, letras o temas</label>
            <input id="corarios-search" value={filters.query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar corarios, letras o temas..." className="min-w-0 flex-1 bg-transparent text-base text-[#0B2545] outline-none placeholder:text-slate-400" />
            <button type="button" onClick={onResetFilters} className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition ${hasFilters ? 'bg-[#e8f1e6] text-[#367240]' : 'text-[#4a8a55] hover:bg-[#f3f8f1]'}`} aria-label="Limpiar filtros"><SlidersHorizontal className="h-5 w-5" /></button>
          </div>
          <div className="space-y-3">
            <FilterGroup label="Categoria" icon={BookOpenText} items={viewModel.categories} value={filters.category} onChange={onCategoryChange} />
            <FilterGroup label="Tono" icon={Music2} items={viewModel.keys} value={filters.key} onChange={onKeyChange} compact />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Corarios" detail="Disponibles" value={viewModel.metrics.available} icon={BookOpenText} tone="green" />
          <MetricCard label="Favoritos" detail="Guardados" value={viewModel.metrics.favorites} icon={Heart} tone="gold" />
          <MetricCard label="Resultados" detail="Búsqueda actual" value={viewModel.metrics.results} icon={Search} tone="lilac" />
        </section>

        {error && <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-900">{error}</div>}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-serif text-[clamp(1.8rem,5vw,2.55rem)] leading-none text-[#0B2545]">Corarios destacados</h2>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0B2545]/10 bg-white px-4 py-2 text-sm font-semibold text-[#31425b]">Orden alfabético <ChevronDown className="h-4 w-4" /></span>
            </div>
            {loading ? (
              <LoadingStatePremium label="Cargando corarios..." />
            ) : viewModel.items.length === 0 ? (
              <EmptyStatePremium icon={BookOpenText} title="No hay corarios publicados" body="Cuando el equipo de ministry publique corarios en Supabase aparecerán aquí. Mientras tanto, explora el himnario disponible." />
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-[#0B2545]/8 bg-white shadow-[0_16px_35px_rgba(19,38,63,0.08)]">
                {viewModel.items.map((corario, index) => <CorarioRow key={corario.id} corario={corario} active={selected?.id === corario.id || index === 0} favorite={isFavorite(corario.id)} onOpen={() => onOpenCorario(corario)} onFavorite={() => onToggleFavorite(corario.id)} />)}
              </div>
            )}
          </div>
          <aside className="hidden xl:sticky xl:top-28 xl:block xl:h-fit">
            <CorarioPreview selected={selected} favorite={selected ? isFavorite(selected.id) : false} onClose={onCloseCorario} onFavorite={() => selected && onToggleFavorite(selected.id)} />
          </aside>
        </section>
      </main>

      {selected && <MobileCorarioDialog selected={selected} favorite={isFavorite(selected.id)} onClose={onCloseCorario} onFavorite={() => onToggleFavorite(selected.id)} />}
    </div>
  );
}

function FilterGroup({ label, icon: Icon, items, value, onChange, compact = false }: { label: string; icon: ElementType; items: string[]; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return <div className="flex items-center gap-3 overflow-x-auto pb-1"><span className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]"><Icon className="h-4 w-4" /> {label}</span><div className="flex gap-2">{items.map((item) => <button key={item} type="button" onClick={() => onChange(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold transition active:scale-95 ${value === item ? 'bg-[#4a8a55] text-white shadow-md shadow-[#4a8a55]/20' : 'border border-[#0B2545]/8 bg-white text-[#233653] hover:border-[#4a8a55]/35'}`}>{compact && item !== 'Todos' ? item.toUpperCase() : item}</button>)}</div></div>;
}

function MetricCard({ label, detail, value, icon: Icon, tone }: { label: string; detail: string; value: number; icon: ElementType; tone: 'green' | 'gold' | 'lilac' }) {
  const tones = { green: 'from-[#edf3e8] to-[#f8faf3] text-[#4a8a55]', gold: 'from-[#fff2d7] to-[#fffaf0] text-[#bb7c12]', lilac: 'from-[#f2ecf9] to-[#fbf8ff] text-[#9063aa]' };
  return <div className={`flex min-w-0 items-center gap-3 rounded-[1.35rem] border border-white bg-gradient-to-br p-4 shadow-[0_10px_22px_rgba(34,49,64,0.06)] ${tones[tone]}`}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/80 shadow-sm"><Icon className={`h-5 w-5 ${label === 'Favoritos' ? 'fill-current' : ''}`} /></div><div className="min-w-0"><p className="text-2xl font-black leading-none text-[#0B2545]">{value}</p><p className="mt-1 text-sm font-bold text-[#0B2545]">{label}</p><p className="text-xs text-[#4e5a6d]">{detail}</p></div></div>;
}

function CorarioRow({ corario, active, favorite, onOpen, onFavorite }: { key?: string; corario: Corario; active: boolean; favorite: boolean; onOpen: () => void; onFavorite: () => void }) {
  return <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${styles.corarioRow} ${active ? styles.rowActive : 'bg-white'} group flex min-w-0 items-center gap-3 border-b border-[#0B2545]/7 p-3 last:border-b-0 sm:gap-4 sm:p-4`}>
    <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"><CorarioThumbnail title={corario.title} category={corario.category} /><div className="min-w-0"><span className="inline-flex rounded-full bg-[#e2efdf] px-2 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-[#49704d]">{corario.category}</span><h3 className="mt-1 truncate font-serif text-[clamp(1.12rem,4vw,1.5rem)] leading-tight text-[#0B2545]">{corario.title}</h3><p className="mt-1 truncate text-sm text-[#596576]">♫ {corario.lyrics.replace(/\s+/g, ' ')}</p></div></button>
    <span className="hidden h-9 min-w-9 place-items-center rounded-full bg-[#e6f0e2] px-2 text-sm font-black text-[#386843] sm:grid">{corario.key}</span>
    <button type="button" onClick={onFavorite} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-white transition hover:border-[#4a8a55]/35 active:scale-95 ${favorite ? 'border-[#4a8a55] text-[#4a8a55]' : 'border-[#0B2545]/8 text-[#0B2545]'}`} aria-label={favorite ? `Quitar ${corario.title} de favoritos` : `Guardar ${corario.title} en favoritos`}><Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} /></button>
    <button type="button" onClick={onOpen} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#0B2545] shadow-md shadow-[#0B2545]/10 transition hover:bg-[#f5f8f2] active:scale-95" aria-label={`Abrir ${corario.title}`}><ArrowRight className="h-5 w-5" /></button>
  </motion.article>;
}

function CorarioThumbnail({ title, category }: { title: string; category: string }) {
  return <div aria-hidden="true" className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(140deg,#254e77,#e5bb61_55%,#f5e6c4)] shadow-inner"><Music2 className="relative z-10 h-7 w-7 text-white/90" /><span className="absolute inset-x-0 bottom-0 h-7 bg-[#0B2545]/35" /><span className="sr-only">{title} · {category}</span></div>;
}

function CorarioPreview({ selected, favorite, onClose, onFavorite }: { selected: Corario | null; favorite: boolean; onClose: () => void; onFavorite: () => void }) {
  return <div className="overflow-hidden rounded-[1.6rem] bg-[#0B2545] p-6 text-white shadow-xl shadow-[#0B2545]/20"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e4ba56]">{selected?.category ?? 'Vista previa'}</p><h3 className="mt-3 font-serif text-3xl leading-none">{selected?.title ?? 'Selecciona un corario'}</h3>{selected ? <><div className="mt-5 flex items-center gap-2"><BackButton fallbackTo="/app/corarios" label="Volver" onBeforeNavigate={onClose} /><button type="button" onClick={onFavorite} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e4ba56] text-[#0B2545]" aria-label="Cambiar favorito"><Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} /></button><Link to={`/app/ensayo/corario/${selected.id}`} className="inline-flex min-h-11 items-center rounded-2xl border border-white/20 px-3 text-xs font-black">Ensayar</Link></div><pre className="mt-5 max-h-[48vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-white/8 p-4 font-sans text-sm leading-7 text-slate-100">{selected.lyrics}</pre><div className="mt-4"><AddToCollectionControl entityType="corario" entityId={selected.id} /></div></> : <p className="mt-4 text-sm leading-6 text-slate-300">Abre una canción para leer la letra, guardarla o llevarla a modo ensayo.</p>}</div>;
}

function MobileCorarioDialog({ selected, favorite, onClose, onFavorite }: { selected: Corario; favorite: boolean; onClose: () => void; onFavorite: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end bg-[#0B2545]/60 p-3 pt-16 xl:hidden" role="dialog" aria-modal="true" aria-label={`Detalle de ${selected.title}`}><button type="button" aria-label="Cerrar detalle" className="absolute inset-0" onClick={onClose} /><motion.section initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative flex max-h-[86vh] w-full flex-col overflow-hidden rounded-[1.7rem] bg-[#fffdf8] shadow-2xl"><div className="flex items-start justify-between border-b border-[#0B2545]/8 p-5"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a56b09]">{selected.category} · Tono {selected.key}</p><h3 className="mt-2 font-serif text-3xl leading-none text-[#0B2545]">{selected.title}</h3></div><button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3ebdc] text-[#0B2545]" aria-label="Cerrar"><X className="h-5 w-5" /></button></div><pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-5 font-sans text-base leading-8 text-[#243651]">{selected.lyrics}</pre><div className="flex flex-wrap gap-2 border-t border-[#0B2545]/8 p-4"><button type="button" onClick={onFavorite} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#4a8a55] px-4 text-sm font-bold text-white"><Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />{favorite ? 'Guardado' : 'Guardar'}</button><Link to={`/app/ensayo/corario/${selected.id}`} className="inline-flex min-h-11 items-center rounded-full border border-[#0B2545]/12 px-4 text-sm font-bold text-[#0B2545]">Modo ensayo</Link><AddToCollectionControl entityType="corario" entityId={selected.id} /></div></motion.section></div>;
}
