import { GraduationCap, Heart, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ElementType } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import {
  AppHero,
  BrandedIcon,
  EmptyStatePremium,
  PremiumCard,
  PremiumScreen,
  SectionHeader,
  StatCard,
} from '../../components/app-premium/PremiumApp';

export function ProfilePage() {
  const { state, auth } = useCoramApp();
  const { corarios, courses, profile } = state;
  const favorites = corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id));
  const enrolled = courses.filter((course) => profile.enrolledCourses.includes(course.id));
  const initials = (profile.name || profile.email || 'CA').slice(0, 2).toUpperCase();

  return (
    <PremiumScreen>
      <AppHero
        eyebrow="Perfil CorAM"
        title={
          <>
            Tu espacio para <span className="text-[#D4AF37]">seguir creciendo.</span>
          </>
        }
        body="Consulta tu rol, favoritos y avance dentro de CorAM desde una vista limpia y preparada para PWA."
      />

      <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
        <PremiumCard dark className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#8A5B12] text-2xl font-black text-white shadow-lg shadow-[#D4AF37]/25">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Miembro</p>
              <h3 className="mt-1 truncate text-xl font-black text-white">{profile.name || 'Usuario CorAM'}</h3>
              <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-slate-300">
                <Mail className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                <span className="truncate">{profile.email}</span>
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <BrandedIcon icon={ShieldCheck} tone="gold" className="h-11 w-11" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Rol actual</p>
                <p className="text-lg font-black capitalize text-white">{auth.role}</p>
              </div>
            </div>
          </div>
        </PremiumCard>

        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="Favoritos" value={favorites.length.toString()} detail="Corarios guardados" icon={Heart} />
          <StatCard label="Cursos" value={enrolled.length.toString()} detail="Inscritos" icon={GraduationCap} />
          <StatCard label="Acceso" value={auth.role} detail="Validado en Supabase" icon={UserRound} />
        </div>
      </div>

      <section className="space-y-3">
        <SectionHeader eyebrow="Actividad" title="Tu contenido guardado" />
        <div className="grid gap-4 lg:grid-cols-2">
          <ProfilePanel
            title="Favoritos"
            icon={Heart}
            to="/app/corarios"
            items={favorites.map((item) => item.title)}
            empty="Todavia no tienes favoritos."
          />
          <ProfilePanel
            title="Cursos inscritos"
            icon={GraduationCap}
            to="/app/academia"
            items={enrolled.map((item) => item.title)}
            empty="Todavia no tienes cursos inscritos."
          />
        </div>
      </section>
    </PremiumScreen>
  );
}

function ProfilePanel({
  title,
  icon: Icon,
  to,
  items,
  empty,
}: {
  title: string;
  icon: ElementType;
  to: string;
  items: string[];
  empty: string;
}) {
  return (
    <PremiumCard dark className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BrandedIcon icon={Icon} tone="gold" className="h-11 w-11" />
          <h3 className="font-black text-white">{title}</h3>
        </div>
        <Link to={to} className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-[#D4AF37] transition hover:bg-white/10">
          Abrir
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {items.length ? (
          items.map((item) => (
            <p key={item} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-slate-200">
              {item}
            </p>
          ))
        ) : (
          <EmptyStatePremium icon={Icon} title={empty} body="Cuando guardes contenido o te inscribas, aparecera aqui." />
        )}
      </div>
    </PremiumCard>
  );
}
