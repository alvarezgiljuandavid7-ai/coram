import { Link } from 'react-router-dom';
import { BookMarked, FolderOpen, GraduationCap, Heart, Mic2, Music2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useCoramApp } from '../../app/CoramAppContext';
import {
  AppHero,
  BrandedIcon,
  EmptyStatePremium,
  PremiumCard,
  PremiumLinkCard,
  PremiumScreen,
  SectionHeader,
  StatCard,
} from '../../components/app-premium/PremiumApp';

export function AppInicioPage() {
  const { state, hymns, hymnsLoading } = useCoramApp();
  const { corarios, courses, resources, profile } = state;
  const favorites = corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id));
  const displayName = profile.name?.trim() || profile.email?.split('@')[0] || 'ministro';
  const latestCorario = corarios[0];
  const latestHymn = hymns[0];
  const latestCourse = courses[0];

  const quickLinks = [
    { label: 'Corarios', detail: 'Letras y tonos', to: '/app/corarios', icon: Music2 },
    { label: 'Himnario', detail: 'Inspiracion', to: '/app/himnario', icon: BookMarked },
    { label: 'Academia', detail: 'Formacion', to: '/app/academia', icon: GraduationCap },
    { label: 'Recursos', detail: 'Materiales', to: '/app/recursos', icon: FolderOpen },
    { label: 'Herramientas', detail: 'Voz y piano', to: '/app/herramientas', icon: SlidersHorizontal },
  ];

  return (
    <PremiumScreen>
      <AppHero
        eyebrow="CorAM ministerial"
        title={
          <>
            Adora. <span className="text-[#D4AF37]">Aprende.</span> Sirve.
          </>
        }
        body={`Bienvenido, ${displayName}. Tu biblioteca, academia y herramientas vocales estan listas para acompanar tu llamado.`}
        cta={{ label: 'Explorar contenido', to: '/app/corarios' }}
      />

      <div className="grid gap-3 min-[430px]:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Corarios" value={corarios.length.toString()} detail="Letras disponibles" icon={Music2} />
        <StatCard label="Himnos" value={hymnsLoading ? '...' : hymns.length.toString()} detail="En el himnario" icon={BookMarked} />
        <StatCard label="Cursos" value={courses.length.toString()} detail="En formacion" icon={GraduationCap} />
        <StatCard label="Favoritos" value={favorites.length.toString()} detail="Guardados" icon={Heart} />
      </div>

      <section className="space-y-3">
        <SectionHeader eyebrow="Accesos rapidos" title="Tu ministerio en un toque" />
        <div className="grid grid-cols-2 gap-3 min-[430px]:grid-cols-3 lg:grid-cols-5">
          {quickLinks.map((item) => (
            <PremiumLinkCard key={item.to} to={item.to} dark className="min-h-36 p-4">
              <BrandedIcon icon={item.icon} tone="gold" />
              <h3 className="mt-4 text-sm font-black">{item.label}</h3>
              <p className="mt-1 text-[11px] font-semibold text-slate-300">{item.detail}</p>
            </PremiumLinkCard>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          <SectionHeader eyebrow="Continua" title="Continua tu ministerio" />
          <PremiumCard className="p-3">
            <div className="space-y-2">
              <ContinueRow icon={Music2} label="Ultimo corario" title={latestCorario?.title ?? 'Explora tu primer corario'} to="/app/corarios" />
              <ContinueRow icon={BookMarked} label="Himno reciente" title={latestHymn ? `${latestHymn.number}. ${latestHymn.title}` : 'Abre el himnario'} to="/app/himnario" />
              <ContinueRow icon={Mic2} label="Herramienta destacada" title="Afinador vocal" to="/app/herramientas/afinador" />
            </div>
          </PremiumCard>
        </section>

        <section className="space-y-3">
          <SectionHeader eyebrow="Proximos pasos" title="Sigue avanzando" />
          <PremiumCard dark className="p-4">
            <div className="space-y-3">
              <NextStep icon={GraduationCap} title={latestCourse?.title ?? 'Explora academia'} to="/app/academia" />
              <NextStep icon={Heart} title="Agrega favoritos" to="/app/corarios" />
              <NextStep icon={FolderOpen} title={resources[0]?.title ?? 'Revisa recursos'} to="/app/recursos" />
            </div>
          </PremiumCard>
        </section>
      </div>

      <section className="space-y-3">
        <SectionHeader eyebrow="Recientes" title="Ultimos contenidos" />
        {corarios.length === 0 && hymns.length === 0 && courses.length === 0 ? (
          <EmptyStatePremium
            icon={Sparkles}
            title="Aun no hay contenido publicado"
            body="Cuando Supabase tenga corarios, himnos o cursos publicados, apareceran aqui con esta misma experiencia premium."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {latestCorario && <RecentCard icon={Music2} title={latestCorario.title} detail={`Corario · Tono ${latestCorario.key}`} to="/app/corarios" />}
            {latestHymn && <RecentCard icon={BookMarked} title={latestHymn.title} detail={`Himno ${latestHymn.number}`} to="/app/himnario" />}
            {latestCourse && <RecentCard icon={GraduationCap} title={latestCourse.title} detail="Academia CorAM" to="/app/academia" />}
          </div>
        )}
      </section>
    </PremiumScreen>
  );
}

function ContinueRow({ icon: Icon, label, title, to }: { icon: typeof Music2; label: string; title: string; to: string }) {
  return (
    <Link to={to} className="flex min-h-16 items-center gap-3 rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 transition hover:border-[#D4AF37]/50 hover:bg-white active:scale-[0.99]">
      <BrandedIcon icon={Icon} tone="gold" className="h-10 w-10" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>
        <span className="block truncate text-sm font-black text-[#0B2545]">{title}</span>
      </span>
    </Link>
  );
}

function NextStep({ icon: Icon, title, to }: { icon: typeof Music2; title: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10 active:scale-[0.99]">
      <BrandedIcon icon={Icon} tone="gold" className="h-10 w-10" />
      <span className="text-sm font-black text-white">{title}</span>
    </Link>
  );
}

function RecentCard({ icon: Icon, title, detail, to }: { icon: typeof Music2; title: string; detail: string; to: string }) {
  return (
    <PremiumLinkCard to={to} className="min-h-24 p-4">
      <div className="flex items-center gap-3">
        <BrandedIcon icon={Icon} tone="violet" className="h-11 w-11" />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-[#0B2545]">{title}</h3>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{detail}</p>
        </div>
      </div>
    </PremiumLinkCard>
  );
}
