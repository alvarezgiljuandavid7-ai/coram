import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] px-4 py-10 text-slate-900">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] p-6 text-center shadow-xl"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545] text-[#D4AF37]">
          <SearchX className="h-7 w-7" />
        </span>
        <p className="mt-5 text-[11px] font-black uppercase tracking-widest text-[#B5811F]">Ruta no encontrada</p>
        <h1 className="mt-2 text-[clamp(1.6rem,6vw,2.25rem)] font-black tracking-tight text-[#0B2545]">
          Esta pagina no existe en CorAM.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Puede que el enlace haya cambiado o que la seccion aun no este publicada.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B2545] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-slate-900 active:scale-[0.99]"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </motion.section>
    </main>
  );
}
