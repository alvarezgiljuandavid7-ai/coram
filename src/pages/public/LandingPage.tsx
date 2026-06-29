import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Mic2, Music2, ShieldCheck } from 'lucide-react';

const publicFeatures = [
  { title: 'Corarios', detail: 'Letras y tonos para ministrar con orden.', icon: Music2 },
  { title: 'Himnario', detail: 'Consulta himnos desde cualquier dispositivo.', icon: BookOpen },
  { title: 'Academia', detail: 'Cursos y recursos formativos para voces.', icon: GraduationCap },
  { title: 'Herramientas vocales', detail: 'Afinador, calentamiento y practica guiada.', icon: Mic2 },
];

export function LandingPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">CorAM Web</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0B2545] md:text-6xl">
            Plataforma musical para ministerios de alabanza.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            CorAM organiza corarios, himnos, academia y herramientas vocales en una experiencia web rapida para celulares, tablets y computadores.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-2xl bg-[#0B2545] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0B2545]/15">
              Crear cuenta
            </Link>
            <Link to="/login" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0B2545]">
              Ingresar
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-950/5">
          <div className="rounded-2xl bg-[#0B2545] p-5 text-white">
            <ShieldCheck className="h-8 w-8 text-[#D4AF37]" />
            <h2 className="mt-4 text-2xl font-black">Contenido protegido por roles</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Usuarios y administradores tienen rutas separadas para que cada persona vea solo lo que corresponde.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {publicFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Icon className="h-5 w-5 text-[#B5811F]" />
                  <h3 className="mt-3 text-sm font-black text-[#0B2545]">{feature.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{feature.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
