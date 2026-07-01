import { useMemo, useState } from 'react';
import { FolderOpen, Search } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import {
  AppHero,
  EmptyStatePremium,
  PremiumScreen,
  ResourceCard,
  SearchInputPremium,
  SectionHeader,
} from '../../components/app-premium/PremiumApp';

const filters = ['Todos', 'PDF Acordes', 'Guías Prácticas', 'Pistas / Audio', 'Partituras'] as const;

export function RecursosPage() {
  const { state } = useCoramApp();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('Todos');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return state.resources.filter((resource) => {
      const matchesFilter = activeFilter === 'Todos' || resource.category === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        resource.title.toLowerCase().includes(normalizedQuery) ||
        resource.description.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query, state.resources]);

  return (
    <PremiumScreen>
      <AppHero
        eyebrow="Biblioteca CorAM"
        title={
          <>
            Recursos para <span className="text-[#D4AF37]">preparar tu servicio.</span>
          </>
        }
        body="Material descargable para ensayos, clases y preparacion ministerial, listo para crecer con Supabase Storage."
      />

      <section className="space-y-3">
        <SectionHeader eyebrow="Filtros" title="Encuentra tu material" />
        <SearchInputPremium value={query} onChange={setQuery} placeholder="Buscar recursos..." />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`min-h-10 shrink-0 rounded-2xl px-4 text-xs font-black transition active:scale-95 ${
                activeFilter === filter
                  ? 'bg-[#0B2545] text-white shadow-lg shadow-[#0B2545]/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[#D4AF37]/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader eyebrow="Recursos" title="Biblioteca descargable" />
        {state.resources.length === 0 ? (
          <EmptyStatePremium
            icon={FolderOpen}
            title="Aun no hay recursos publicados"
            body="Cuando el administrador suba PDFs, audios, videos o guias en Supabase, apareceran en esta biblioteca."
          />
        ) : filtered.length === 0 ? (
          <EmptyStatePremium
            icon={Search}
            title="No hay recursos en este filtro"
            body="Prueba otra categoria o publica nuevos recursos desde el panel administrador."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>
    </PremiumScreen>
  );
}
