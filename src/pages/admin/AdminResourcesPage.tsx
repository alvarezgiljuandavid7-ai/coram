import { FileText } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';

export function AdminResourcesPage() {
  const { state } = useCoramApp();

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">Recursos</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-50">Biblioteca de recursos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Administra materiales descargables para ensayos, clases y preparacion ministerial.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/70">
        {state.resources.length === 0 ? (
          <div className="p-6 text-sm font-semibold text-slate-400">No hay recursos cargados todavia.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {state.resources.map((resource) => (
              <article key={resource.id} className="flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-[#D4AF37]">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black text-slate-50">{resource.title}</h2>
                    <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {resource.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{resource.description}</p>
                  <p className="mt-3 text-xs font-bold text-slate-500">
                    {resource.fileSize} · {resource.downloadsCount} descargas
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
