import { BookOpenCheck, GraduationCap, Layers, Mic2, Piano, PlayCircle, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import {
  AppHero,
  BrandedIcon,
  CourseCard,
  EmptyStatePremium,
  BackButton,
  PremiumCard,
  PremiumScreen,
  SectionHeader,
} from '../../components/app-premium/PremiumApp';
import type { Course } from '../../types';

const categories = [
  { label: 'Voz', icon: Mic2 },
  { label: 'Piano', icon: Piano },
  { label: 'Direccion', icon: GraduationCap },
  { label: 'Coros', icon: UsersRound },
  { label: 'Liderazgo', icon: Layers },
];

export function AcademiaPage() {
  const { state } = useCoramApp();
  const { courses, profile, setProfile } = state;
  const [selected, setSelected] = useState<Course | null>(null);

  const toggleCourse = (courseId: string) => {
    setProfile((current) => ({
      ...current,
      enrolledCourses: current.enrolledCourses.includes(courseId)
        ? current.enrolledCourses.filter((id) => id !== courseId)
        : [...current.enrolledCourses, courseId],
    }));
  };

  const closeCourseDetail = () => setSelected(null);

  return (
    <PremiumScreen>
      <AppHero
        eyebrow="Academia CorAM"
        title={
          <>
            Formacion para <span className="text-[#D4AF37]">crecer y servir.</span>
          </>
        }
        body="Cursos para voces, directores, musicos y equipos de alabanza, organizados para estudiar desde el celular."
      />

      <section className="space-y-3">
        <SectionHeader eyebrow="Categorias" title="Aprende por enfoque" />
        <div className="grid grid-cols-2 gap-3 min-[430px]:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <PremiumCard key={category.label} dark className="min-h-28 p-4">
              <BrandedIcon icon={category.icon} tone="gold" className="h-11 w-11" />
              <h3 className="mt-4 text-sm font-black text-white">{category.label}</h3>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader eyebrow="Cursos" title="Cursos destacados" />
        {courses.length === 0 ? (
          <EmptyStatePremium
            icon={BookOpenCheck}
            title="Aun no hay cursos publicados"
            body="Cuando el administrador publique cursos desde Supabase, apareceran aqui con imagen, descripcion y acceso desde la app."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={profile.enrolledCourses.includes(course.id)}
                onDetails={() => setSelected(course)}
                onToggle={() => toggleCourse(course.id)}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <PremiumCard className="p-5">
          <div className="mb-4">
            <BackButton fallbackTo="/app/academia" label="Volver a academia" onBeforeNavigate={closeCourseDetail} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#B5811F]">Contenido del curso</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-[#0B2545]">{selected.title}</h3>
          {selected.syllabus.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
              Este curso aun no tiene lecciones cargadas en Supabase.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {selected.syllabus.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3">
                  <BrandedIcon icon={PlayCircle} tone="gold" className="h-10 w-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-[#0B2545]">{lesson.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{lesson.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      )}
    </PremiumScreen>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#B5811F]">CorAM</p>
      <h1 className="mt-1 text-[clamp(1.45rem,5vw,2rem)] font-black tracking-tight text-[#0B2545]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
    </div>
  );
}
