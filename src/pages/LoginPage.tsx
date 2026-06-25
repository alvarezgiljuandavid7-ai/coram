import { Navigate, useLocation } from 'react-router-dom';
import { CoramLogo } from '../components/CoramLogo';
import { AuthPanel } from '../components/AuthPanel';
import { useCoramApp } from '../app/CoramAppContext';

export function LoginPage() {
  const { auth } = useCoramApp();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (!auth.loading && auth.user) {
    return <Navigate to={auth.isAdmin ? from || '/admin' : '/app'} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-[oklch(99%_0.004_90)] shadow-xl md:grid-cols-[1fr_420px]">
        <div className="p-8 md:p-10">
          <CoramLogo variant="full" size={84} />
          <p className="mt-8 text-[11px] font-black uppercase tracking-widest text-[#B5811F]">Acceso seguro</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0B2545] md:text-4xl">
            Entra a CorAM con tu cuenta real.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Usa Google para entrar al instante o correo y contrasena cuando el correo de confirmacion este disponible.
            El rol se valida desde Supabase para separar usuarios normales y administradores.
          </p>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 p-5 md:border-l md:border-t-0">
          <AuthPanel auth={auth} />
        </div>
      </section>
    </main>
  );
}
