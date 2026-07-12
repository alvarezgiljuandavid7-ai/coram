import { Clock3, FolderHeart, GraduationCap, Heart, LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCoramApp } from '../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, ExperienceCanvas, MetricTile, SectionHeading, StatePanel } from '../../components/experience-v2/ExperienceV2';

export function ProfilePage() {
  const { state, auth, collections, favorites, recentActivity } = useCoramApp();
  const { courses, profile } = state;
  const enrolled = courses.filter((course) => profile.enrolledCourses.includes(course.id));
  const initials = (profile.name || profile.email || 'CA').slice(0, 2).toUpperCase();
  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Cuenta personal" title="Mi perfil" body="Tu identidad, rol y actividad real dentro de CorAM, sin información inventada." icon={UserRound} />
    <section className="grid gap-5 xl:grid-cols-[minmax(0,25rem)_1fr]">
      <EditorialCard className="overflow-hidden"><div className="bg-[linear-gradient(135deg,#0B2545,#284e58)] p-6 text-white"><div className="flex items-center gap-4">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/10" /> : <span className="grid h-20 w-20 place-items-center rounded-3xl bg-[#e4ba56] text-2xl font-black text-[#0B2545]">{initials}</span>}<div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e4ba56]">{auth.role}</p><h2 className="mt-2 truncate font-serif text-3xl leading-none">{profile.name || 'Usuario CorAM'}</h2><p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-slate-200"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">{profile.email}</span></p></div></div><div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><ShieldCheck className="h-5 w-5 text-[#e4ba56]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Rol validado</p><p className="font-bold capitalize">{auth.role}</p></div></div></div><div className="p-4"><button type="button" onClick={() => void auth.signOut()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 text-sm font-bold text-rose-700"><LogOut className="h-4 w-4" /> Cerrar sesión</button></div></EditorialCard>
      <div className="grid content-start gap-3 sm:grid-cols-3"><MetricTile label="Favoritos" value={favorites.length} detail="Guardados" icon={Heart} /><MetricTile label="Colecciones" value={collections.length} detail="Repertorios" icon={FolderHeart} tone="gold" /><MetricTile label="Cursos" value={enrolled.length} detail="Inscritos" icon={GraduationCap} tone="lilac" /></div>
    </section>
    <section className="space-y-4"><SectionHeading eyebrow="Actividad" title="Continúa donde ibas" />{recentActivity.length === 0 ? <StatePanel icon={Clock3} title="Aún no hay actividad reciente" body="Los contenidos que abras aparecerán aquí para retomarlos rápidamente." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{recentActivity.slice(0,6).map((item) => <Link key={item.id} to={item.route}><EditorialCard interactive className="h-full p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">{activityLabel(item.entityType)}</p><h3 className="mt-2 font-serif text-2xl leading-none">{item.title}</h3><p className="mt-4 text-sm font-bold text-[#4a8a55]">Retomar</p></EditorialCard></Link>)}</div>}</section>
    <section className="space-y-4"><SectionHeading eyebrow="Biblioteca personal" title="Tus accesos" /><div className="grid gap-4 md:grid-cols-3"><ProfileLink to="/app/favoritos" icon={Heart} title="Favoritos" detail={`${favorites.length} contenidos guardados`} /><ProfileLink to="/app/colecciones" icon={FolderHeart} title="Colecciones" detail={`${collections.length} repertorios`} /><ProfileLink to="/app/academia" icon={GraduationCap} title="Mis cursos" detail={`${enrolled.length} cursos inscritos`} /></div></section>
  </ExperienceCanvas>;
}

function ProfileLink({ to, icon: Icon, title, detail }: { to: string; icon: typeof Heart; title: string; detail: string }) {
  return <Link to={to}><EditorialCard interactive className="h-full p-5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf3e8] text-[#4a8a55]"><Icon className="h-5 w-5" /></span><h3 className="mt-5 font-serif text-2xl">{title}</h3><p className="mt-2 text-sm text-[#596576]">{detail}</p></EditorialCard></Link>;
}

function activityLabel(type: string) {
  return ({ corario: 'Corario reciente', hymn: 'Himno reciente', course: 'Curso reciente', resource: 'Recurso reciente', tool: 'Herramienta reciente' } as Record<string,string>)[type] ?? 'Actividad reciente';
}
