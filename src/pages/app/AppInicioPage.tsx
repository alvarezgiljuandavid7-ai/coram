import { Link } from 'react-router-dom';
import { BookMarked, CheckCircle2, GraduationCap, Music2 } from 'lucide-react';
import type { ElementType } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';

export function AppInicioPage() {
  const { state, hymns, hymnsLoading } = useCoramApp();
  const { corarios, courses, profile } = state;
  const favorites = corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id));

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-6 shadow-sm">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-700">
          Plataforma activa
        </span>
        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-[#0B2545]">
          CorAM centraliza corarios, himnarios, cursos y recursos para el ministerio.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Entra al contenido, guarda favoritos, consulta letras y usa herramientas vocales desde una experiencia real.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Corarios" value={corarios.length.toString()} detail="letras disponibles" />
        <Stat label="Himnario" value={hymnsLoading ? '...' : hymns.length.toString()} detail="Manantial" />
        <Stat label="Cursos" value={courses.length.toString()} detail="formacion" />
        <Stat label="Favoritos" value={favorites.length.toString()} detail="guardados" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <QuickPanel title="Corarios recientes" icon={Music2} to="/app/corarios" items={corarios.slice(0, 4).map((item) => item.title)} />
        <QuickPanel title="Himnario Manantial" icon={BookMarked} to="/app/himnario" items={hymns.slice(0, 4).map((item) => `${item.number}. ${item.title}`)} />
        <QuickPanel title="Academia" icon={GraduationCap} to="/app/academia" items={courses.slice(0, 4).map((item) => item.title)} />
      </div>
    </section>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-[#0B2545]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
    </div>
  );
}

function QuickPanel({ title, icon: Icon, to, items }: { title: string; icon: ElementType; to: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B2545] text-slate-50">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="font-black text-[#0B2545]">{title}</h3>
        </div>
        <Link to={to} className="text-xs font-black text-[#B5811F]">Abrir</Link>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="truncate">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
