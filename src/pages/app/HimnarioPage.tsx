import { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import type { Hymn } from '../../domain/hymns/types';
import { LibraryHeader } from './CorariosPage';

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

  return (
    <section className="space-y-5">
      <LibraryHeader
        title="Himnario Manantial de Inspiracion"
        subtitle="Himnos cargados desde Supabase como lista real de consulta."
        value={query}
        onChange={setQuery}
        placeholder="Buscar por numero, titulo o letra"
      />
      {hymnsError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{hymnsError}</div>}
      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)]">
          {hymnsLoading ? (
            <div className="p-6 text-sm font-bold text-slate-500">Cargando himnario...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((hymn) => (
                <button
                  key={hymn.id}
                  type="button"
                  onClick={() => setSelected(hymn)}
                  className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    selected?.id === hymn.id ? 'bg-[#D4AF37]/10' : ''
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-sm font-black text-slate-50">
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
          )}
        </div>

        <aside className="sticky top-28 h-fit rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">
            {selected ? `Himno ${selected.number}` : `${filtered.length} himnos`}
          </p>
          <h3 className="mt-1 text-xl font-black tracking-tight text-[#0B2545]">{selected?.title ?? 'Selecciona un himno'}</h3>
          {selected ? (
            <pre className="mt-5 max-h-[66vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-50">
              {selected.lyrics}
            </pre>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
              Elige un himno para ver la letra completa.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
