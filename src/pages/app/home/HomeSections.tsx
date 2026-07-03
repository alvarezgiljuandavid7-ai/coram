import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { Key, ReactNode } from 'react';
import {
  BookMarked,
  CalendarDays,
  Clock3,
  Film,
  FolderOpen,
  GraduationCap,
  Heart,
  Mic2,
  Music2,
  PlayCircle,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import {
  BrandedIcon,
  EmptyStatePremium,
  PremiumCard,
  PremiumLinkCard,
  SectionHeader,
} from '../../../components/app-premium/PremiumApp';
import type { Advertisement, Campaign, Course, FeaturedVideo, HomeBanner, Resource, UserProfile } from '../../../types';
import type { Hymn } from '../../../domain/hymns/types';
import type { Corario } from '../../../types';

export function HomeHeroPremium({ displayName, banners }: { displayName: string; banners: HomeBanner[] }) {
  const mainBanner = banners[0];

  return (
    <section className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[#071426] px-5 py-6 text-white shadow-2xl shadow-[#0B2545]/20 md:px-8 md:py-9">
      {mainBanner?.imageUrl && <img src={mainBanner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(212,175,55,0.34),transparent_30%),linear-gradient(135deg,rgba(3,10,23,0.98),rgba(11,37,69,0.94))]" />
      <div className="absolute bottom-0 right-0 h-40 w-3/4 bg-[repeating-linear-gradient(0deg,transparent_0_13px,rgba(212,175,55,0.13)_13px_14px)] opacity-80" />
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Bienvenido, {displayName}</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.35rem,11vw,5rem)] font-black leading-[0.95] tracking-tight">
            {mainBanner?.title || 'Tu ministerio musical en un solo lugar.'}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
            {mainBanner?.body || 'Corarios, himnos, academia, recursos, videos y herramientas vocales listos para servir con excelencia.'}
          </p>
          <div className="mt-6 flex flex-col gap-2 min-[430px]:flex-row">
            <SmartLink to={mainBanner?.ctaUrl || '/app/herramientas'} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#D4AF37] px-5 text-sm font-black text-slate-950 shadow-lg shadow-[#D4AF37]/20 active:scale-[0.99]">
              {mainBanner?.ctaLabel || 'Explorar herramientas'}
            </SmartLink>
            <Link to="/app/academia" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-5 text-sm font-black text-white active:scale-[0.99]">
              Ver academia
            </Link>
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">Hoy en CorAM</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniMetric icon={Music2} value="Coros" />
            <MiniMetric icon={Film} value="Videos" />
            <MiniMetric icon={Mic2} value="Voz" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedCampaignCarousel({ campaigns, advertisements }: { campaigns: Campaign[]; advertisements: Advertisement[] }) {
  const items = [
    ...campaigns.map((campaign) => ({
      id: campaign.id,
      label: 'Campana',
      title: campaign.title,
      body: campaign.body || campaign.subtitle || 'Campana publicada por el administrador.',
      imageUrl: campaign.imageUrl,
      cta: campaign.ctaLabel || 'Abrir',
      to: campaign.ctaUrl || '/app/inicio',
    })),
    ...advertisements.map((ad) => ({
      id: ad.id,
      label: 'Publicidad',
      title: ad.title,
      body: ad.placement || 'Anuncio activo.',
      imageUrl: ad.imageUrl,
      cta: 'Abrir',
      to: ad.targetUrl || '/app/inicio',
    })),
  ];

  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Campanas / anuncios" title="Destacados ministeriales" />
      {items.length === 0 ? (
        <EmptyStatePremium icon={Sparkles} title="Sin campanas publicadas" body="Cuando el administrador publique campanas o anuncios activos desde Supabase, apareceran aqui." />
      ) : (
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
        {items.map((campaign) => (
          <motion.article
            key={`${campaign.label}-${campaign.id}`}
            whileTap={{ scale: 0.99 }}
            className="relative min-w-[86%] snap-start overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#071426] p-5 text-white shadow-xl shadow-[#0B2545]/15 sm:min-w-[420px]"
          >
            {campaign.imageUrl && <img src={campaign.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(212,175,55,0.28),transparent_32%)]" />
            <div className="relative">
              <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-black uppercase text-slate-950">{campaign.label}</span>
              <h3 className="mt-5 text-2xl font-black leading-tight">{campaign.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{campaign.body}</p>
              <SmartLink to={campaign.to} className="mt-5 inline-flex min-h-11 items-center rounded-2xl bg-white px-4 text-xs font-black text-[#0B2545]">
                {campaign.cta}
              </SmartLink>
            </div>
          </motion.article>
        ))}
      </div>
      )}
    </section>
  );
}

export function VideoHighlights({ videos }: { videos: FeaturedVideo[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Videos destacados" title="Contenido para crecer" />
      {videos.length === 0 ? (
        <EmptyStatePremium icon={Film} title="Sin videos destacados" body="Publica videos desde el panel administrador para llenar esta seccion." />
      ) : (
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {videos.map((video) => (
          <PremiumCard key={video.title} dark className="min-w-[78%] p-0 md:min-w-0">
            <div className="relative flex min-h-36 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#071426,#0B2545)]">
              {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_20%,rgba(212,175,55,0.24),transparent_30%)]" />
              <PlayCircle className="relative h-12 w-12 text-[#D4AF37]" />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">{video.category || 'Video'}</p>
              <h3 className="mt-2 line-clamp-2 text-lg font-black text-white">{video.title}</h3>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                {video.duration || 'Disponible'}
              </p>
            </div>
          </PremiumCard>
        ))}
      </div>
      )}
    </section>
  );
}

export function QuickAccessPremium() {
  const items = [
    { label: 'Corarios', detail: 'Letras y tonos', to: '/app/corarios', icon: Music2 },
    { label: 'Himnario', detail: 'Inspiracion', to: '/app/himnario', icon: BookMarked },
    { label: 'Academia', detail: 'Formacion', to: '/app/academia', icon: GraduationCap },
    { label: 'Recursos', detail: 'Materiales', to: '/app/recursos', icon: FolderOpen },
    { label: 'Herramientas', detail: 'Voz y piano', to: '/app/herramientas', icon: SlidersHorizontal },
  ];

  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Accesos rapidos" title="Abre lo que necesitas" />
      <div className="grid grid-cols-2 gap-3 min-[430px]:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <PremiumLinkCard key={item.to} to={item.to} dark className="min-h-40 p-4">
            <BrandedIcon icon={item.icon} tone="gold" />
            <h3 className="mt-5 text-base font-black">{item.label}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-300">{item.detail}</p>
          </PremiumLinkCard>
        ))}
      </div>
    </section>
  );
}

export function FeaturedTools() {
  const tools = [
    { title: 'Afinador vocal', detail: 'Microfono, piano y luces de afinacion.', to: '/app/herramientas/afinador', icon: Mic2 },
    { title: 'Piano / teclado', detail: 'Notas y acordes de referencia.', to: '/app/herramientas/piano', icon: Music2 },
    { title: 'Calentamiento vocal', detail: 'Respiracion y escalas guiadas.', to: '/app/herramientas/calentamiento', icon: SlidersHorizontal },
  ];

  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Herramientas" title="Entrena antes de ministrar" />
      <div className="grid gap-3 md:grid-cols-3">
        {tools.map((tool) => (
          <ActionCard key={tool.to} {...tool} />
        ))}
      </div>
    </section>
  );
}

export function FeaturedCourses({ courses }: { courses: Course[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Academia destacada" title="Aprende con estructura" />
      {courses.length === 0 ? (
        <EmptyStatePremium icon={GraduationCap} title="Aun no hay cursos publicados" body="Cuando el admin publique cursos desde Supabase, apareceran destacados en esta seccion." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.slice(0, 2).map((course) => (
            <ActionCard key={course.id} title={course.title} detail={course.description || 'Curso disponible en Academia CorAM.'} to="/app/academia" icon={GraduationCap} />
          ))}
        </div>
      )}
    </section>
  );
}

export function RecentResources({ resources }: { resources: Resource[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Recursos recientes" title="Material para tu servicio" />
      {resources.length === 0 ? (
        <EmptyStatePremium icon={FolderOpen} title="Sin recursos publicados" body="Los PDF, guias, pistas o materiales nuevos se mostraran aqui." />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {resources.slice(0, 3).map((resource) => (
            <ActionCard key={resource.id} title={resource.title} detail={resource.description || resource.category} to="/app/recursos" icon={FolderOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

export function UserActivitySummary({
  profile,
  favoritesCount,
  hymns,
}: {
  profile: UserProfile;
  favoritesCount: number;
  hymns: Hymn[];
}) {
  const items = [
    { icon: Heart, label: 'Favoritos', value: `${favoritesCount} guardados` },
    { icon: GraduationCap, label: 'Cursos', value: `${profile.enrolledCourses.length} iniciados` },
    { icon: BookMarked, label: 'Himnario', value: `${hymns.length} disponibles` },
    { icon: CalendarDays, label: 'Rol', value: profile.isPremium ? 'Premium' : 'Miembro' },
  ];

  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Actividad" title="Tu progreso" />
      <PremiumCard className="p-3">
        <div className="grid gap-2 min-[430px]:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3">
              <item.icon className="h-4 w-4 text-[#B5811F]" />
              <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm font-black text-[#0B2545]">{item.value}</p>
            </div>
          ))}
        </div>
      </PremiumCard>
    </section>
  );
}

function ActionCard({ title, detail, to, icon }: { key?: Key; title: string; detail: string; to: string; icon: LucideIcon }) {
  return (
    <PremiumLinkCard to={to} dark className="min-h-36 p-4">
      <BrandedIcon icon={icon} tone="gold" />
      <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{detail}</p>
    </PremiumLinkCard>
  );
}

function MiniMetric({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-[#D4AF37]" />
      <p className="mt-2 text-[11px] font-black text-white">{value}</p>
    </div>
  );
}

function SmartLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const isExternal = /^https?:\/\//i.test(to);

  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export function RecentContentStrip({ corarios, hymns, courses }: { corarios: Corario[]; hymns: Hymn[]; courses: Course[] }) {
  const latest = [
    corarios[0] && { title: corarios[0].title, detail: `Corario / Tono ${corarios[0].key}`, to: '/app/corarios', icon: Music2 },
    hymns[0] && { title: hymns[0].title, detail: `Himno ${hymns[0].number}`, to: '/app/himnario', icon: BookMarked },
    courses[0] && { title: courses[0].title, detail: 'Academia CorAM', to: '/app/academia', icon: GraduationCap },
  ].filter(Boolean) as Array<{ title: string; detail: string; to: string; icon: LucideIcon }>;

  if (latest.length === 0) {
    return <EmptyStatePremium icon={Sparkles} title="Aun no hay contenido publicado" body="Cuando Supabase tenga contenido real, el inicio se llenara automaticamente." />;
  }

  return (
    <section className="space-y-3">
      <SectionHeader eyebrow="Novedades" title="Ultimos contenidos" />
      <div className="grid gap-3 md:grid-cols-3">
        {latest.map((item) => (
          <ActionCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
