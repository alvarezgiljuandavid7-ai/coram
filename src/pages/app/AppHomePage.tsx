import { BookOpen, GraduationCap, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ElementType } from 'react';
import { PhoneSimulator } from '../../components/PhoneSimulator';
import { useCoramApp } from '../../app/CoramAppContext';

export function AppHomePage() {
  const { state, hymns, hymnsLoading, monetizationSettings, mentorships } = useCoramApp();
  const { corarios, courses, resources, sponsors, profile, setProfile } = state;

  return (
    <section className="grid min-h-[calc(100vh-120px)] gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">CorAM App</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-[#0B2545]">Tu aplicacion ministerial</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Accede a corarios, himnarios, academia, recursos, calentamiento vocal, afinador y herramientas para voces.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <HomeShortcut to="/app/corarios" icon={Music2} title="Corarios" detail={`${corarios.length} letras disponibles`} />
          <HomeShortcut
            to="/app/himnario"
            icon={BookOpen}
            title="Himnario Manantial"
            detail={hymnsLoading ? 'Cargando...' : `${hymns.length} himnos`}
          />
          <HomeShortcut to="/app/academia" icon={GraduationCap} title="Academia" detail="Cursos y recursos formativos" />
        </div>
      </aside>

      <div className="flex items-start justify-center rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] px-3 py-6 shadow-sm md:px-6">
        <PhoneSimulator
          corarios={corarios}
          courses={courses}
          resources={resources}
          sponsors={sponsors}
          profile={profile}
          setProfile={setProfile}
          mentorships={mentorships}
          monetizationSettings={monetizationSettings}
        />
      </div>
    </section>
  );
}

interface HomeShortcutProps {
  to: string;
  icon: ElementType;
  title: string;
  detail: string;
}

function HomeShortcut({ to, icon: Icon, title, detail }: HomeShortcutProps) {
  return (
    <Link to={to} className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-4 text-left shadow-sm transition hover:border-[#D4AF37]">
      <Icon className="h-5 w-5 text-[#B5811F]" />
      <p className="mt-3 text-sm font-black text-[#0B2545]">{title}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
    </Link>
  );
}
