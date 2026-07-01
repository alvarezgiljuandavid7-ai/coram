import { Link } from 'react-router-dom';
import { Mic2, Music2, Wind } from 'lucide-react';

const tools = [
  {
    title: 'Afinador vocal',
    detail: 'Activa el microfono y compara tu voz contra la nota objetivo.',
    to: '/app/herramientas/afinador',
    icon: Mic2,
  },
  {
    title: 'Piano / teclado',
    detail: 'Escucha notas y acordes de referencia desde el teclado acustico.',
    to: '/app/herramientas/piano',
    icon: Music2,
  },
  {
    title: 'Calentamiento vocal',
    detail: 'Practica respiracion, registros y escalas antes de ministrar.',
    to: '/app/herramientas/calentamiento',
    icon: Wind,
  },
];

export function HerramientasPage() {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">Herramientas</p>
        <h1 className="mt-3 text-[clamp(1.6rem,6vw,2.25rem)] font-black tracking-tight text-[#0B2545]">Entrenamiento vocal y piano</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Usa las herramientas reales de CorAM dentro de la app, sin mockups ni pantallas promocionales.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.to}
              to={tool.to}
              className="rounded-2xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37]/60 hover:shadow-md active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2545] text-slate-50">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-black text-[#0B2545]">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.detail}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
