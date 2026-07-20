import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  FolderOpen,
  GraduationCap,
  Heart,
  Mic2,
  Music2,
  Sparkles,
  Star,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState, type Key } from 'react';
import { useCoramApp } from '../../../app/CoramAppContext';
import {
  EditorialCard,
  ExperienceCanvas,
  MetricTile,
  SectionHeading,
  StatePanel,
} from '../../../components/experience-v2/ExperienceV2';
import { getGreetingForHour, getInspirationForDate, millisecondsUntilNextHomeContentChange } from './homeTemporalContent';
import styles from './HomeScreenV2.module.css';
import { NextServiceSummary } from '../../../components/home/NextServiceSummary';

const quickAccess = [
  { label: 'Corarios', detail: 'Letras y tonos', to: '/app/corarios', icon: Music2, tone: 'green' as const },
  { label: 'Himnario', detail: 'Inspiracion', to: '/app/himnario', icon: BookOpen, tone: 'gold' as const },
  { label: 'Herramientas', detail: 'Voz y piano', to: '/app/herramientas', icon: Wrench, tone: 'lilac' as const },
  { label: 'Academia', detail: 'Formacion', to: '/app/academia', icon: GraduationCap, tone: 'sky' as const },
  { label: 'Recursos', detail: 'Materiales', to: '/app/recursos', icon: FolderOpen, tone: 'gold' as const },
];

const featuredTools = [
  { title: 'Afinador vocal', body: 'Escucha, compara y encuentra tu nota objetivo.', to: '/app/herramientas/afinador', icon: Mic2 },
  { title: 'Piano y teclado', body: 'Notas y acordes para preparar tu servicio.', to: '/app/herramientas/piano', icon: Music2 },
  { title: 'Calentamiento vocal', body: 'Rutinas guiadas para cuidar tu voz.', to: '/app/herramientas/calentamiento', icon: Sparkles },
];

export function HomeScreenV2() {
  const { state, hymns, favorites, recentActivity, collections } = useCoramApp();
  const { homeBanners, campaigns, corarios, courses, resources, profile } = state;
  const displayName = profile.name?.trim() || profile.email?.split('@')[0] || 'ministro';
  const firstName = displayName.split(/\s+/)[0] || 'ministro';
  const heroContent = homeBanners[0] ?? campaigns[0];
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setTimeout(() => setNow(new Date()), millisecondsUntilNextHomeContentChange(now) + 1000);
    return () => window.clearTimeout(timer);
  }, [now]);

  const greeting = getGreetingForHour(now.getHours());
  const inspiration = getInspirationForDate(now);

  return (
    <ExperienceCanvas className={`${styles.screen} home-screen-v2`}>
      <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(330px,0.96fr)] xl:gap-6">
        <HomeGreetingHero firstName={firstName} greeting={greeting} />
        <HomeCampaignCard content={heroContent} />
      </section>

      <NextServiceSummary />

      <section>
        <SectionHeading eyebrow="Continua donde ibas" title="Tu ministerio reciente" action={<Link to="/app/favoritos" className="text-sm font-bold text-[#3d7146]">Ver guardados</Link>} />
        {recentActivity.length === 0 ? (
          <div className="mt-4"><StatePanel icon={Sparkles} title="Tu recorrido empieza aqui" body="Abre contenido, herramientas o recursos y podras retomarlos desde este espacio." /></div>
        ) : (
          <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {recentActivity.slice(0, 6).map((item) => (
              <HomeLinkCard key={item.id} to={item.route} title={item.title} detail="Abierto recientemente" icon={Sparkles} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading eyebrow="Biblioteca viva" title="Encuentra lo que necesitas" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {quickAccess.map((item) => (
            <Link key={item.to} to={item.to} className="group min-w-0 rounded-[1.45rem] border border-white bg-white p-4 shadow-[0_10px_26px_rgba(24,45,71,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(24,45,71,0.11)] active:scale-[0.98]">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${item.tone === 'green' ? 'bg-[#e5f0df] text-[#4a8a55]' : item.tone === 'gold' ? 'bg-[#fff0d1] text-[#b5811f]' : item.tone === 'lilac' ? 'bg-[#f0eaf8] text-[#9063aa]' : 'bg-[#e8f4f5] text-[#3b7e86]'}`}><item.icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-base font-bold text-[#0B2545]">{item.label}</h3>
              <p className="mt-1 text-xs text-[#596576]">{item.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Tu biblioteca" title="Corarios e himnos para servir" action={<Link to="/app/corarios" className="text-sm font-bold text-[#3d7146]">Explorar biblioteca</Link>} />
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <HomeLibraryGatewayCard title="Corarios" count={corarios.length} detail="Letras y tonos publicados" to="/app/corarios" icon={Music2} items={corarios.slice(0, 3).map((item) => item.title)} />
          <HomeLibraryGatewayCard title="Himnario" count={hymns.length} detail="Himnos disponibles" to="/app/himnario" icon={BookOpen} items={hymns.slice(0, 3).map((item) => item.title)} />
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Preparacion vocal" title="Herramientas para tu voz" action={<Link to="/app/herramientas" className="text-sm font-bold text-[#3d7146]">Ver todas</Link>} />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredTools.map((tool) => <HomeToolCard key={tool.to} title={tool.title} detail={tool.body} to={tool.to} icon={tool.icon} />)}
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHeading eyebrow="Academia" title="Sigue aprendiendo" action={<Link to="/app/academia" className="text-sm font-bold text-[#3d7146]">Ver academia</Link>} />
          {courses.length === 0 ? <div className="mt-4"><StatePanel icon={GraduationCap} title="Academia en preparacion" body="Los cursos publicados por el administrador apareceran aqui." /></div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{courses.slice(0, 2).map((course) => <HomeAcademyCard key={course.id} to="/app/academia" title={course.title} detail={course.instructor || 'Curso disponible'} icon={GraduationCap} />)}</div>}
        </div>
        <div>
          <SectionHeading eyebrow="Recursos" title="Material reciente" action={<Link to="/app/recursos" className="text-sm font-bold text-[#3d7146]">Ver recursos</Link>} />
          {resources.length === 0 ? <div className="mt-4"><StatePanel icon={FolderOpen} title="Sin recursos nuevos" body="Los materiales publicados estaran disponibles en esta seccion." /></div> : <div className="mt-4 grid gap-3">{resources.slice(0, 2).map((resource) => <HomeLinkCard key={resource.id} to="/app/recursos" title={resource.title} detail={resource.category} icon={FolderOpen} />)}</div>}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Tu actividad" title="Un vistazo a tu camino" />
        <div className="mt-4 grid gap-3 min-[430px]:grid-cols-2 xl:grid-cols-4">
          <MetricTile icon={Heart} label="Favoritos" value={favorites.length} detail="Guardados para ti" tone="gold" />
          <MetricTile icon={Star} label="Colecciones" value={collections.length} detail="Ensayos organizados" tone="green" />
          <MetricTile icon={Music2} label="Corarios" value={corarios.length} detail="En tu biblioteca" tone="sky" />
          <MetricTile icon={BookOpen} label="Himnos" value={hymns.length} detail="Disponibles ahora" tone="lilac" />
        </div>
      </section>

      <HomeInspirationCard text={inspiration.text} reference={inspiration.reference} />
    </ExperienceCanvas>
  );
}

function HomeGreetingHero({ firstName, greeting }: { firstName: string; greeting: string }) {
  return <div className="min-w-0 rounded-[1.8rem] border border-white/90 bg-[linear-gradient(135deg,#fffdf8_0%,#f8f1df_55%,#edf3e8_100%)] p-5 shadow-[0_16px_38px_rgba(24,45,71,0.08)] sm:p-8 md:p-10"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#a56b09]">CorAM · musica, alabanza y formacion</p><h1 className="mt-3 max-w-3xl break-words font-serif text-[clamp(2.25rem,9vw,5.6rem)] leading-[0.92] text-[#0B2545]">{greeting}, <span className="text-[#4a8a55]">{firstName}</span>.</h1><p className="mt-4 max-w-xl text-[clamp(0.98rem,2.2vw,1.2rem)] leading-6 text-[#46546a]">Todo lo que necesitas para preparar, servir y crecer con tu ministerio.</p><div className="mt-6 flex flex-col gap-3 min-[430px]:flex-row"><Link to="/app/herramientas" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4a8a55] px-5 text-sm font-bold text-white shadow-lg shadow-[#4a8a55]/20 transition hover:bg-[#3d7146] active:scale-[0.98]">Explorar herramientas <ArrowRight className="h-4 w-4" /></Link><Link to="/app/academia" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#0B2545]/12 bg-white/75 px-5 text-sm font-bold text-[#17305a] transition hover:bg-white active:scale-[0.98]">Ver academia</Link></div></div>;
}

function HomeCampaignCard({ content }: { content: { title: string; body?: string; subtitle?: string; ctaUrl?: string; ctaLabel?: string; imageUrl?: string } | undefined }) {
  return <EditorialCard className="relative min-w-0 overflow-hidden bg-[#f9f4e9] p-0 shadow-[0_16px_38px_rgba(24,45,71,0.08)]">{content?.imageUrl && <img src={content.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />}<div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,253,248,0.95),rgba(255,253,248,0.72)_58%,rgba(221,235,216,0.76))]" /><div className="relative flex h-full min-h-72 flex-col justify-end p-6 sm:p-8"><span className="w-fit rounded-full bg-[#e5f0df] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#3d7146]">Editorial CorAM</span><h2 className="mt-4 max-w-md break-words font-serif text-[clamp(2rem,5vw,3.35rem)] leading-[0.95] text-[#17305a]">{content?.title || 'Tu espacio para preparar el proximo servicio.'}</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#46546a]">{content?.body || content?.subtitle || 'Las campanas y novedades publicadas por el equipo apareceran aqui.'}</p>{content && <Link to={content.ctaUrl || '/app/inicio'} className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#3d7146] underline decoration-[#d7a934] decoration-2 underline-offset-4">{content.ctaLabel || 'Descubrir ahora'} <ArrowRight className="h-4 w-4" /></Link>}</div></EditorialCard>;
}

function HomeToolCard(props: { key?: Key; title: string; detail: string; to: string; icon: LucideIcon }) { return <HomeLinkCard {...props} />; }
function HomeAcademyCard(props: { key?: Key; title: string; detail: string; to: string; icon: LucideIcon }) { return <HomeLinkCard {...props} />; }
function HomeInspirationCard({ text, reference }: { text: string; reference: string }) { return <EditorialCard className="overflow-hidden bg-[linear-gradient(135deg,#eef4ea,#fffaf0)] p-5 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a56b09]">Inspiracion</p><p className="mt-3 max-w-3xl font-serif text-[clamp(1.45rem,4vw,3rem)] leading-[1.16] text-[#17305a]">&quot;{text}&quot;</p><p className="mt-3 text-sm font-bold text-[#4a8a55]">{reference}</p></EditorialCard>; }

function HomeLinkCard({ title, detail, to, icon: Icon }: { key?: Key; title: string; detail: string; to: string; icon: LucideIcon }) {
  return (
    <motion.div whileTap={{ scale: 0.985 }}>
      <Link to={to} className="block min-w-[78vw] rounded-[1.45rem] border border-white bg-white p-5 shadow-[0_10px_26px_rgba(24,45,71,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(24,45,71,0.11)] md:min-w-0">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e5f0df] text-[#4a8a55]"><Icon className="h-5 w-5" /></span>
        <h3 className="mt-5 break-words text-lg font-bold leading-tight text-[#0B2545]">{title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#596576]">{detail}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#3d7146]">Abrir <ArrowRight className="h-3.5 w-3.5" /></span>
      </Link>
    </motion.div>
  );
}

function HomeLibraryGatewayCard({ title, count, detail, to, icon: Icon, items }: { key?: Key; title: string; count: number; detail: string; to: string; icon: LucideIcon; items: string[] }) {
  return (
    <EditorialCard className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0d1] text-[#b5811f]"><Icon className="h-6 w-6" /></span><Link to={to} className="rounded-full bg-[#edf3e8] px-3 py-2 text-xs font-bold text-[#3d7146]">Ver todo</Link></div>
      <h3 className="mt-5 font-serif text-3xl text-[#17305a]">{title}</h3>
      <p className="mt-1 text-sm text-[#596576]"><strong className="text-[#0B2545]">{count}</strong> {detail.toLowerCase()}</p>
      {items.length === 0 ? <p className="mt-6 text-sm leading-6 text-[#596576]">Aun no hay contenido publicado.</p> : <div className="mt-5 space-y-2">{items.map((item) => <p key={item} className="truncate rounded-xl bg-[#f8faf5] px-3 py-2 text-sm font-medium text-[#233653]">{item}</p>)}</div>}
    </EditorialCard>
  );
}
