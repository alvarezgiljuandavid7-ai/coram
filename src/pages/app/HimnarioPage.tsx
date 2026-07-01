import { useMemo, useState } from 'react';
import { BookMarked, ChevronRight, LibraryBig, Search } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import type { Hymn } from '../../domain/hymns/types';
import {
  AppHero,
  BackButton,
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
    const term = query.trim().toLowerCase();
    if (!term) return hymns;
    return hymns.filter((hymn) =>
      [hymn.title, hymn.hymnalName, hymn.lyrics, String(hymn.number)].some((value) => value.toLowerCase().includes(term)),
    );
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

      <div className="grid gap-4 xl:grid-cols-[1fr_430px]">
        <section className="space-y-3">
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

        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <PremiumCard dark className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
              {selected ? `Himno ${selected.number}` : `${filtered.length} himnos`}
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-white">{selected?.title ?? 'Selecciona un himno'}</h3>
            {selected ? (
              <>
                <div className="mt-4">
                  <BackButton fallbackTo="/app/himnario" label="Volver al himnario" onBeforeNavigate={closeHymnDetail} />
                </div>
                <pre className="mt-5 max-h-[66vh] overflow-auto whitespace-pre-wrap rounded-3xl border border-white/10 bg-slate-950/65 p-5 font-mono text-xs leading-6 text-slate-50">
                  {selected.lyrics}
                </pre>
              </>
            ) : (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-6 text-slate-300">
                Elige un himno para ver la letra completa.
              </p>
            )}
          </PremiumCard>
        </aside>
      </div>
    </PremiumScreen>
  );
}
