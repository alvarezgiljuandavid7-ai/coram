import { Link, Outlet } from 'react-router-dom';
import { CoramLogo } from '../components/CoramLogo';

export function AuthLayout() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[oklch(97.5%_0.008_90)] px-3 py-4 pt-4 text-[#0B2545] sm:px-5 md:items-center md:py-8">
      <section className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[minmax(0,1fr)_430px] md:items-stretch">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#071426] p-5 text-white shadow-2xl shadow-[#0B2545]/20 sm:p-7 md:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgba(212,175,55,0.32),transparent_30%),linear-gradient(135deg,rgba(4,14,28,0.98),rgba(11,37,69,0.92))]" />
          <div className="absolute bottom-0 right-0 h-32 w-2/3 bg-[linear-gradient(120deg,transparent_20%,rgba(212,175,55,0.12)_21%,transparent_26%,transparent_45%,rgba(212,175,55,0.12)_46%,transparent_50%)]" />
          <div className="relative">
            <Link to="/" className="inline-flex rounded-3xl bg-white/5 p-2">
              <CoramLogo variant="full" size={76} />
            </Link>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Acceso seguro</p>
            <h1 className="mt-3 max-w-2xl text-[clamp(2rem,9vw,4rem)] font-black leading-[1.02] tracking-tight">
              Entra a CorAM <span className="text-[#D4AF37]">sin friccion.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base">
              Usa Google o correo y contrasena. Tu rol se valida desde Supabase para abrir la app de usuario o el panel administrador.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-300">
              <span className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3">Correo</span>
              <span className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3">Google</span>
              <span className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3">Roles</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-[oklch(99%_0.004_90)] p-4 shadow-xl shadow-slate-950/8 sm:p-5 md:flex md:items-center">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
