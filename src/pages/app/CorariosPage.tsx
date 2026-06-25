import { useMemo, useState } from 'react';
import { Heart, Search } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import type { Corario } from '../../types';

export function CorariosPage() {
  const { state } = useCoramApp();
  const { corarios, profile, setProfile } = state;
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Corario | null>(null);

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

  return (
    <section className="space-y-5">
      <LibraryHeader
        title="Biblioteca de Corarios"
        subtitle="Busca letras, acordes, categorias y favoritos."
        value={query}
        onChange={setQuery}
        placeholder="Buscar por titulo, categoria, autor o letra"
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((corario) => (
            <button
              key={corario.id}
              type="button"
              onClick={() => setSelected(corario)}
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                selected?.id === corario.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-slate-200 bg-[oklch(99%_0.004_90)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">{corario.category}</p>
                  <h3 className="mt-1 text-base font-black leading-snug text-[#0B2545]">{corario.title}</h3>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-600">{corario.lyrics.replace(/\s+/g, ' ')}</p>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Tono {corario.key}</span>
                <span>{corario.tempo ? `${corario.tempo} BPM` : 'Sin tempo'}</span>
              </div>
            </button>
          ))}
        </div>

        <aside className="sticky top-28 h-fit rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">
            {selected?.category ?? `${filtered.length} resultados`}
          </p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-[#0B2545]">{selected?.title ?? 'Selecciona un corario'}</h3>
          {selected ? (
            <>
              <button
                type="button"
                onClick={() => toggleFavorite(selected.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B2545] px-3 py-2 text-xs font-black text-slate-50"
              >
                <Heart className="h-4 w-4" />
                {profile.favoriteCorarios.includes(selected.id) ? 'Quitar favorito' : 'Guardar favorito'}
              </button>
              <pre className="mt-5 max-h-[58vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-50">
                {selected.lyrics}
              </pre>
            </>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
              Elige un corario para leer la letra completa.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

export function LibraryHeader({
  title,
  subtitle,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">CorAM</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0B2545]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
      </div>
      <label className="relative w-full xl:w-[420px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/15"
        />
      </label>
    </div>
  );
}
