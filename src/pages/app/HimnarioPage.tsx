import { useMemo, useState } from 'react';
import { ArrowLeft, BookMarked, ChevronRight, LibraryBig, Search } from 'lucide-react';
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

      {selected && (
        <section className="xl:hidden">
          <HymnDetailCard selected={selected} onClose={closeHymnDetail} />
        </section>
      )}

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
