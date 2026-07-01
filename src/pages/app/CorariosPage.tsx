import { useMemo, useState } from 'react';
import type { Key } from 'react';
import { BookOpenText, Heart, Music2, Search } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import {
  AppHero,
  BackButton,
  BrandedIcon,
  EmptyStatePremium,
  PremiumCard,
  PremiumScreen,
  SearchInputPremium,
  SectionHeader,
  StatCard,
} from '../../components/app-premium/PremiumApp';
import type { Corario } from '../../types';

export function CorariosPage() {
  const { state } = useCoramApp();
  const { corarios, profile, setProfile } = state;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Corario | null>(null);

  const favorites = useMemo(
    () => corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id)),
    [corarios, profile.favoriteCorarios],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return corarios;
    return corarios.filter((item) =>
      [item.title, item.category, item.author, item.lyrics].filter(Boolean).some((value) => value?.toLowerCase().includes(term)),
    );
  }, [corarios, query]);

  const toggleFavorite = (id: string) => {
    setProfile((current) => ({
      ...current,
      favoriteCorarios: current.favoriteCorarios.includes(id)
        ? current.favoriteCorarios.filter((favoriteId) => favoriteId !== id)
        : [...current.favoriteCorarios, id],
    }));
  };

  const closeCorarioDetail = () => setSelected(null);

  return (
    <PremiumScreen>
      <AppHero
        eyebrow="Biblioteca de corarios"
        title={
          <>
            Letras y tonos para <span className="text-[#D4AF37]">ministrar mejor.</span>
          </>
        }
        body="Busca corarios, guarda favoritos y abre letras completas con una lectura clara para ensayo o plataforma."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Corarios" value={corarios.length.toString()} detail="Letras disponibles" icon={Music2} />
        <StatCard label="Favoritos" value={favorites.length.toString()} detail="Guardados" icon={Heart} />
        <StatCard label="Resultados" value={filtered.length.toString()} detail="Busqueda actual" icon={Search} />
      </div>

      <section className="space-y-3">
        <SectionHeader eyebrow="Buscar" title="Encuentra una letra" />
        <SearchInputPremium value={query} onChange={setQuery} placeholder="Buscar por titulo, categoria, autor o letra" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_430px]">
        <section className="space-y-3">
          <SectionHeader eyebrow="Biblioteca" title="Corarios disponibles" />
          {filtered.length === 0 ? (
            <EmptyStatePremium
              icon={BookOpenText}
              title="No encontramos corarios"
              body="Prueba otro titulo, tono, autor o fragmento de la letra."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((corario) => (
                <CorarioCard
                  key={corario.id}
                  corario={corario}
                  active={selected?.id === corario.id}
                  favorite={profile.favoriteCorarios.includes(corario.id)}
                  onOpen={() => setSelected(corario)}
                  onFavorite={() => toggleFavorite(corario.id)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-28 xl:h-fit">
          <PremiumCard dark className="p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
              {selected?.category ?? `${filtered.length} resultados`}
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight text-white">{selected?.title ?? 'Selecciona un corario'}</h3>
            {selected ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  <BackButton fallbackTo="/app/corarios" label="Volver a corarios" onBeforeNavigate={closeCorarioDetail} />
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selected.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#D4AF37] px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-[#e5c452] active:scale-[0.99]"
                  >
                    <Heart className="h-4 w-4" />
                    {profile.favoriteCorarios.includes(selected.id) ? 'Quitar favorito' : 'Guardar favorito'}
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
                  <span className="rounded-2xl border border-white/10 bg-white/5 p-3">Tono {selected.key}</span>
                  <span className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    {selected.tempo ? `${selected.tempo} BPM` : 'Sin tempo'}
                  </span>
                </div>
                <pre className="mt-5 max-h-[62vh] overflow-auto whitespace-pre-wrap rounded-3xl border border-white/10 bg-slate-950/65 p-5 font-mono text-xs leading-6 text-slate-50">
                  {selected.lyrics}
                </pre>
              </>
            ) : (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-6 text-slate-300">
                Elige un corario para leer la letra completa.
              </p>
            )}
          </PremiumCard>
        </aside>
      </div>
    </PremiumScreen>
  );
}

function CorarioCard({
  corario,
  active,
  favorite,
  onOpen,
  onFavorite,
}: {
  key?: Key;
  corario: Corario;
  active: boolean;
  favorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  return (
    <PremiumCard dark={active} className="min-h-44 p-4">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <BrandedIcon icon={Music2} tone={active ? 'gold' : 'navy'} className="h-11 w-11" />
          <span className="rounded-full border border-current/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#B5811F]">
            Tono {corario.key}
          </span>
        </div>
        <p className={`mt-4 text-[10px] font-black uppercase tracking-[0.22em] ${active ? 'text-[#D4AF37]' : 'text-[#B5811F]'}`}>
          {corario.category}
        </p>
        <h3 className={`mt-1 text-base font-black leading-snug ${active ? 'text-white' : 'text-[#0B2545]'}`}>{corario.title}</h3>
        <p className={`mt-3 line-clamp-3 text-xs leading-6 ${active ? 'text-slate-300' : 'text-slate-600'}`}>
          {corario.lyrics.replace(/\s+/g, ' ')}
        </p>
      </button>
      <button
        type="button"
        onClick={onFavorite}
        className={`mt-4 inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 text-xs font-black transition active:scale-95 ${
          favorite ? 'bg-[#D4AF37] text-slate-950' : active ? 'border border-white/10 text-white' : 'border border-slate-200 text-[#0B2545]'
        }`}
      >
        <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
        {favorite ? 'Favorito' : 'Guardar'}
      </button>
    </PremiumCard>
  );
}
