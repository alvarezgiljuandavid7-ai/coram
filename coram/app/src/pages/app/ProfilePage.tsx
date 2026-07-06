import { GraduationCap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ElementType } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import { PageHeading } from './AcademiaPage';

export function ProfilePage() {
  const { state, auth } = useCoramApp();
  const { corarios, courses, profile } = state;
  const favorites = corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id));
  const enrolled = courses.filter((course) => profile.enrolledCourses.includes(course.id));

  return (
    <section className="space-y-5">
      <PageHeading title="Perfil" subtitle="Tu informacion, favoritos y progreso dentro de CorAM." />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-6 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B2545] text-lg font-black text-slate-50">
            {(profile.name || profile.email || 'CA').slice(0, 2).toUpperCase()}
          </div>
          <h3 className="mt-4 text-xl font-black text-[#0B2545]">{profile.name}</h3>
          <p className="truncate text-sm font-semibold text-slate-500">{profile.email}</p>
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Rol</p>
            <p className="mt-1 text-lg font-black text-[#0B2545]">{auth.role}</p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <ProfilePanel title="Favoritos" icon={Heart} to="/app/corarios" items={favorites.map((item) => item.title)} empty="Todavia no tienes favoritos." />
          <ProfilePanel title="Cursos inscritos" icon={GraduationCap} to="/app/academia" items={enrolled.map((item) => item.title)} empty="Todavia no tienes cursos inscritos." />
        </div>
      </div>
    </section>
  );
}

function ProfilePanel({ title, icon: Icon, to, items, empty }: { title: string; icon: ElementType; to: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-[#B5811F]" />
          <h3 className="font-black text-[#0B2545]">{title}</h3>
        </div>
        <Link to={to} className="text-xs font-black text-[#B5811F]">Abrir</Link>
      </div>
      <div className="mt-4 space-y-2">
        {items.length ? items.map((item) => <p key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">{item}</p>) : <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">{empty}</p>}
      </div>
    </div>
  );
}
