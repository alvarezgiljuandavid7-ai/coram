import { Link, Outlet } from 'react-router-dom';
import { CoramLogo } from '../components/CoramLogo';

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[oklch(98%_0.006_90)] px-3 py-4 pt-4 sm:items-center sm:px-4 sm:py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[1.35rem] border border-slate-200 bg-[oklch(99%_0.004_90)] shadow-xl md:grid-cols-[1fr_420px] md:rounded-3xl">
        <div className="p-5 sm:p-6 md:p-10">
          <Link to="/" className="inline-flex">
            <CoramLogo variant="full" size={72} />
          </Link>
          <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-[#B5811F] md:mt-8">Acceso seguro</p>
          <h1 className="mt-2 text-[clamp(1.85rem,7vw,2.65rem)] font-black tracking-tight text-[#0B2545] md:text-[clamp(2.25rem,4vw,3.5rem)]">
            Entra a CorAM con tu cuenta real.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 md:mt-4">
            Usa Google o correo y contrasena para entrar. El rol se valida desde Supabase para separar usuarios y administradores.
          </p>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 md:border-l md:border-t-0">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
