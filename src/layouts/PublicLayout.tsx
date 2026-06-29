import { Link, Outlet } from 'react-router-dom';
import { CookieConsent } from '../components/CookieConsent';
import { CoramLogo } from '../components/CoramLogo';
import { LegalFooter } from '../components/LegalFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[oklch(98%_0.006_90)] text-slate-900">
      <header className="border-b border-slate-200 bg-[oklch(99%_0.004_90)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <CoramLogo variant="icon" size={42} />
            <div>
              <p className="text-lg font-black tracking-tight text-[#0B2545]">CorAM</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5811F]">Ministerio vocal</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <Link to="/login" className="rounded-xl px-3 py-2 text-[#0B2545] hover:bg-slate-100">
              Ingresar
            </Link>
            <Link to="/register" className="rounded-xl bg-[#0B2545] px-3 py-2 text-white hover:bg-slate-900">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <Outlet />
      <LegalFooter />
      <CookieConsent />
    </div>
  );
}
