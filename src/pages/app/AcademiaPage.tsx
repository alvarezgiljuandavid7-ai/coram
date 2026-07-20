import { BookOpenCheck, Clock3, GraduationCap, Heart, PlayCircle, Search, Sparkles, X } from 'lucide-react';
import { type Key, useEffect, useMemo, useState } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import { EditorialCard, EditorialHeading, EditorialHero, ExperienceCanvas, FilterChip, MetricTile, SearchField, SectionHeading, StatePanel } from '../../components/experience-v2/ExperienceV2';
import type { Course } from '../../types';
import { PartnerCourseHighlights } from '../../components/home/PartnerCourseHighlights';

type CourseFilter = 'todos' | 'inscritos' | 'favoritos';

export function AcademiaPage() {
  const { state, isFavorite, toggleFavorite, recordRecentActivity } = useCoramApp();
  const { courses, profile, setProfile } = state;
  const [selected, setSelected] = useState<Course | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CourseFilter>('todos');
  const filtered = useMemo(() => courses.filter((course) => {
    const term = query.trim().toLocaleLowerCase('es');
    const matchesTerm = !term || [course.title, course.instructor, course.description].some((value) => value?.toLocaleLowerCase('es').includes(term));
    const matchesFilter = filter === 'todos' || (filter === 'inscritos' && profile.enrolledCourses.includes(course.id)) || (filter === 'favoritos' && isFavorite('course', course.id));
    return matchesTerm && matchesFilter;
  }), [courses, filter, isFavorite, profile.enrolledCourses, query]);

  useEffect(() => {
    if (!selected) return undefined;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [selected]);

  function openCourse(course: Course) {
    setSelected(course);
    void recordRecentActivity({ entityType: 'course', entityId: course.id, title: course.title, route: '/app/academia', metadata: { instructor: course.instructor } });
  }

  function toggleEnrollment(courseId: string) {
    setProfile((current) => ({ ...current, enrolledCourses: current.enrolledCourses.includes(courseId) ? current.enrolledCourses.filter((id) => id !== courseId) : [...current.enrolledCourses, courseId] }));
  }

  const favorites = courses.filter((course) => isFavorite('course', course.id)).length;
  return <ExperienceCanvas>
    <EditorialHeading eyebrow="Formación ministerial" title="Academia" body="Cursos publicados para voces, músicos, directores y equipos que quieren crecer con estructura." icon={GraduationCap} />
    <EditorialHero badge="Aprendizaje continuo" title="Forma tu talento para servir mejor" body="Retoma tus cursos, revisa cada módulo y construye una práctica constante desde cualquier dispositivo." icon={Sparkles} imageUrl={courses[0]?.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1500&q=82'} />
    <PartnerCourseHighlights />
    <section className="grid gap-3 sm:grid-cols-3"><MetricTile label="Cursos" value={courses.length} detail="Publicados" icon={GraduationCap} /><MetricTile label="En progreso" value={profile.enrolledCourses.length} detail="Inscritos" icon={PlayCircle} tone="gold" /><MetricTile label="Favoritos" value={favorites} detail="Guardados" icon={Heart} tone="lilac" /></section>
    <section className="space-y-4"><SectionHeading eyebrow="Explorar" title="Encuentra tu siguiente clase" /><SearchField value={query} onChange={setQuery} placeholder="Buscar por título, instructor o tema..." /><div className="flex gap-2 overflow-x-auto pb-1">{([['todos','Todos'],['inscritos','En progreso'],['favoritos','Favoritos']] as const).map(([value,label]) => <FilterChip key={value} active={filter === value} label={label} onClick={() => setFilter(value)} />)}</div></section>
    <section className="space-y-4"><SectionHeading eyebrow="Cursos publicados" title="Aprende a tu ritmo" />{courses.length === 0 ? <StatePanel icon={BookOpenCheck} title="Aún no hay cursos publicados" body="Los cursos aparecerán aquí cuando el administrador los publique desde Supabase." /> : filtered.length === 0 ? <StatePanel icon={Search} title="No encontramos cursos" body="Prueba con otro término o filtro." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((course) => <CourseTile key={course.id} course={course} enrolled={profile.enrolledCourses.includes(course.id)} favorite={isFavorite('course', course.id)} onOpen={() => openCourse(course)} onEnroll={() => toggleEnrollment(course.id)} onFavorite={() => void toggleFavorite('course', course.id)} />)}</div>}</section>
    {selected && <CourseDialog course={selected} enrolled={profile.enrolledCourses.includes(selected.id)} onClose={() => setSelected(null)} onEnroll={() => toggleEnrollment(selected.id)} />}
  </ExperienceCanvas>;
}

function CourseTile({ course, enrolled, favorite, onOpen, onEnroll, onFavorite }: { key?: Key; course: Course; enrolled: boolean; favorite: boolean; onOpen: () => void; onEnroll: () => void; onFavorite: () => void }) {
  return <EditorialCard interactive className="overflow-hidden"><button type="button" onClick={onOpen} className="block w-full text-left"><div className="relative aspect-[16/9] bg-[linear-gradient(135deg,#17305a,#4a8a55)]">{course.imageUrl && <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />}<span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase text-[#0B2545]">{course.syllabus.length} lecciones</span></div><div className="p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">{course.instructor || 'Academia CorAM'}</p><h3 className="mt-2 font-serif text-2xl leading-none">{course.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#596576]">{course.description}</p><p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#4a8a55]"><Clock3 className="h-4 w-4" />{course.duration || 'Duración por confirmar'}</p></div></button><div className="grid grid-cols-[1fr_auto] gap-2 border-t border-[#0B2545]/8 p-4"><button type="button" onClick={onEnroll} className={`min-h-11 rounded-full px-4 text-sm font-bold ${enrolled ? 'bg-[#e7f1e3] text-[#3d7146]' : 'bg-[#0B2545] text-white'}`}>{enrolled ? 'Inscrito' : 'Comenzar curso'}</button><button type="button" onClick={onFavorite} className={`grid h-11 w-11 place-items-center rounded-full border ${favorite ? 'border-[#4a8a55] text-[#4a8a55]' : 'border-[#0B2545]/10'}`} aria-label="Cambiar favorito"><Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} /></button></div></EditorialCard>;
}

function CourseDialog({ course, enrolled, onClose, onEnroll }: { course: Course; enrolled: boolean; onClose: () => void; onEnroll: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end bg-[#0B2545]/60 p-3 pt-16 md:items-center md:justify-center" role="dialog" aria-modal="true" aria-label={`Curso ${course.title}`}><button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar curso" /><section className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.7rem] bg-[#fffdf8] shadow-2xl"><header className="flex items-start justify-between gap-4 border-b border-[#0B2545]/8 p-5"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a56b09]">Contenido del curso</p><h2 className="mt-2 font-serif text-3xl leading-none">{course.title}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2ecdf]" aria-label="Cerrar"><X className="h-5 w-5" /></button></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><p className="text-sm leading-7 text-[#596576]">{course.description}</p><div className="mt-5 space-y-2">{course.syllabus.length === 0 ? <StatePanel icon={BookOpenCheck} title="Sin lecciones todavía" body="El administrador aún no ha cargado módulos para este curso." /> : course.syllabus.map((lesson, index) => <div key={lesson.id} className="flex items-center gap-3 rounded-2xl border border-[#0B2545]/8 bg-white p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf3e8] text-sm font-black text-[#4a8a55]">{index + 1}</span><div className="min-w-0 flex-1"><p className="font-bold">{lesson.title}</p><p className="text-xs text-[#596576]">{lesson.duration}</p></div><PlayCircle className="h-5 w-5 text-[#b5811f]" /></div>)}</div></div><footer className="border-t border-[#0B2545]/8 p-4"><button type="button" onClick={onEnroll} className="min-h-12 w-full rounded-full bg-[#4a8a55] text-sm font-bold text-white">{enrolled ? 'Quitar de mis cursos' : 'Inscribirme'}</button></footer></section></div>;
}
