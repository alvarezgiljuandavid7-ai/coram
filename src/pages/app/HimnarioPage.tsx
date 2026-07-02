import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookMarked, ChevronRight, LibraryBig, Search, X } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import { filterHymns, getHymnLyrics } from '../../domain/hymns/hymnSearch';
import type { Hymn } from '../../domain/hymns/types';
import {
  AppHero,
  BrandedIcon,
  EmptyStatePremium,
  LoadingStatePremium,
  PremiumCard,
  PremiumScreen,
  SearchInputPremium,
  SectionHeader,
  StatCard,
} from '../../components/app-premium/PremiumApp';

export function HimnarioPage() {
  const { hymns, hymnsLoading, hymnsError } = useCoramApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Hymn | null>(null);

  const filtered = useMemo(() => {
    return filterHymns(hymns, query);
  }, [hymns, query]);

  const closeHymnDetail = () => setSelected(null);

  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);

  return (
    <PremiumScreen>
      <AppHero
        eyebrow="Himnario Manantial"
        title={
          <>
            Himnos para <span className="text-[#D4AF37]">adorar con memoria.</span>
          </>
        }
        body="Consulta himnos cargados desde Supabase con busqueda rapida por numero, titulo o fragmento de letra."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Himnos" value={hymnsLoading ? '...' : hymns.length.toString()} detail="En el himnario" icon={BookMarked} />
        <StatCard label="Resultados" value={filtered.length.toString()} detail="Busqueda actual" icon={Search} />
        <StatCard label="Fuente" value="Supabase" detail="Contenido real" icon={LibraryBig} />
      </div>

      {hymnsError && (
        <PremiumCard className="border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {hymnsError}
        </PremiumCard>
      )}

      <section className="space-y-3">
        <SectionHeader eyebrow="Buscar" title="Encuentra un himno" />
        <SearchInputPremium value={query} onChange={setQuery} placeholder="Buscar por numero, titulo o letra" />
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="min-w-0 space-y-3">
          <SectionHeader eyebrow="Lista" title="Himnos disponibles" />
          {hymnsLoading ? (
            <LoadingStatePremium label="Cargando himnario..." />
          ) : filtered.length === 0 ? (
            <EmptyStatePremium
              icon={BookMarked}
              title="No encontramos himnos"
              body="Prueba con otro numero, titulo o fragmento de la letra."
            />
          ) : (
            <PremiumCard className="p-2">
              <div className="divide-y divide-slate-100">
                {filtered.map((hymn) => (
                  <button
                    key={hymn.id}
                    type="button"
                    onClick={() => setSelected(hymn)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 active:scale-[0.99] ${
                      selected?.id === hymn.id ? 'bg-[#D4AF37]/10' : ''
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B2545] text-sm font-black text-[#D4AF37]">
                      {hymn.number || '-'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-[#0B2545]">{hymn.title}</span>
                      <span className="block truncate text-xs font-semibold text-slate-500">{hymn.hymnalName}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </PremiumCard>
          )}
        </section>

        <aside className="hidden min-w-0 xl:sticky xl:top-28 xl:block xl:h-fit">
          {selected ? (
            <HymnDetailCard selected={selected} onClose={closeHymnDetail} />
          ) : (
            <PremiumCard dark className="p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">{filtered.length} himnos</p>
              <h3 className="mt-2 text-2xl font-black leading-tight text-white">Selecciona un himno</h3>
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-6 text-slate-300">
                Elige un himno para ver la letra completa.
              </p>
            </PremiumCard>
          )}
        </aside>
      </div>

      {selected && <MobileHymnDialog selected={selected} onClose={closeHymnDetail} />}
    </PremiumScreen>
  );
}

function HymnDetailCard({ selected, onClose }: { selected: Hymn; onClose: () => void }) {
  return (
    <PremiumCard dark className="p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Himno {selected.number}</p>
      <h3 className="mt-2 text-2xl font-black leading-tight text-white">{selected.title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white px-3 py-2 text-xs font-black text-[#0B2545] shadow-sm transition active:scale-[0.99]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al listado
      </button>
      <pre className="mt-5 max-h-[58vh] overflow-auto whitespace-pre-wrap rounded-3xl border border-white/10 bg-slate-950/65 p-5 font-mono text-xs leading-6 text-slate-50 xl:max-h-[66vh]">
        {getHymnLyrics(selected)}
      </pre>
    </PremiumCard>
  );
}

function MobileHymnDialog({ selected, onClose }: { selected: Hymn; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 px-3 pb-3 pt-16 xl:hidden" role="dialog" aria-modal="true">
      <button type="button" aria-label="Cerrar letra" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section className="relative flex max-h-[86vh] w-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#071426] text-white shadow-2xl shadow-slate-950/40">
        <div className="border-b border-white/10 bg-[#071426] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Himno {selected.number}</p>
              <h3 className="mt-1 line-clamp-2 text-xl font-black leading-tight text-white">{selected.title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B2545] shadow-sm transition active:scale-95"
              aria-label="Cerrar letra"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap bg-slate-950/45 p-4 font-mono text-sm leading-7 text-slate-50">
          {getHymnLyrics(selected)}
        </pre>
        <button type="button" onClick={onClose} className="min-h-12 border-t border-white/10 bg-white px-4 text-sm font-black text-[#0B2545] active:bg-slate-100">
          Volver al listado
        </button>
      </section>
    </div>
  );
}
