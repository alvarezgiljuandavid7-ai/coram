import { PlayCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { useCoramApp } from '../../app/CoramAppContext';
import type { Course } from '../../types';

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

  return (
    <section className="space-y-5">
      <PageHeading title="Academia CorAM" subtitle="Cursos para voces, directores, musicos y equipos de alabanza." />
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {courses.map((course) => (
          <article key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] shadow-sm">
            <img src={course.imageUrl} alt="" className="h-44 w-full object-cover" />
            <div className="space-y-4 p-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">{course.instructor}</p>
                <h3 className="mt-1 text-lg font-black text-[#0B2545]">{course.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                  {course.rating}
                </span>
                <span>{course.duration}</span>
                <span>Gratis</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelected(course)} className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-[#0B2545]">
                  Ver detalles
                </button>
                <button type="button" onClick={() => toggleCourse(course.id)} className="flex-1 rounded-xl bg-[#0B2545] px-3 py-2 text-xs font-black text-slate-50">
                  {profile.enrolledCourses.includes(course.id) ? 'Inscrito' : 'Inscribirme'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <div className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">Contenido del curso</p>
          <h3 className="mt-1 text-xl font-black text-[#0B2545]">{selected.title}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selected.syllabus.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <PlayCircle className="h-5 w-5 text-[#B5811F]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[#0B2545]">{lesson.title}</p>
                  <p className="text-xs font-semibold text-slate-500">{lesson.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">CorAM</p>
      <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0B2545]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
    </div>
  );
}
