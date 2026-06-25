import { Download, Lock } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import { PageHeading } from './AcademiaPage';

export function RecursosPage() {
  const { state } = useCoramApp();

  return (
    <section className="space-y-5">
      <PageHeading title="Recursos" subtitle="Material descargable para ensayos, clases y preparacion ministerial." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.resources.map((resource) => (
          <article key={resource.id} className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">{resource.category}</p>
                <h3 className="mt-1 text-lg font-black text-[#0B2545]">{resource.title}</h3>
              </div>
              {resource.isPremium ? <Lock className="h-5 w-5 text-[#B5811F]" /> : <Download className="h-5 w-5 text-emerald-600" />}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{resource.description}</p>
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{resource.fileSize}</span>
              <span>{resource.downloadsCount} descargas</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
