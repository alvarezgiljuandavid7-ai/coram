import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookMarked,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Music2,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react';
import { AuthPanel } from '../components/AuthPanel';
import { CookieConsent } from '../components/CookieConsent';
import { CoramLogo } from '../components/CoramLogo';
import { LegalFooter } from '../components/LegalFooter';
import { useCoramApp } from '../app/CoramAppContext';

export const appNav = [
  { to: '/app/inicio', label: 'Inicio', icon: LayoutDashboard },
  { to: '/app/corarios', label: 'Corarios', icon: Music2 },
  { to: '/app/himnario', label: 'Himnario', icon: BookMarked },
  { to: '/app/academia', label: 'Academia', icon: GraduationCap },
  { to: '/app/recursos', label: 'Recursos', icon: FolderOpen },
  { to: '/app/herramientas', label: 'Herramientas', icon: SlidersHorizontal },
  { to: '/app/perfil', label: 'Perfil', icon: UserRound },
];

export function isImmersiveAppRoute(pathname: string): boolean {
  void pathname;
  return false;
}

export function AppLayout() {
  const { auth } = useCoramApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const immersiveAppRoute = isImmersiveAppRoute(location.pathname);

  return (
    <div className={`min-h-screen bg-[oklch(98%_0.006_90)] text-slate-900 ${immersiveAppRoute ? 'max-md:bg-slate-950' : ''}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-[oklch(99%_0.004_90)] px-4 py-5 shadow-xl shadow-slate-950/5 transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CoramLogo variant="icon" size={46} />
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#0B2545]">CorAM</h1>
              <p className="text-xs font-semibold text-slate-500">Aplicacion ministerial</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {appNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app/inicio'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-[#0B2545] text-slate-50 shadow-md shadow-[#0B2545]/15'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2545]'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-bold">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

      </aside>

      {open && <button type="button" aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className={`${immersiveAppRoute ? 'hidden' : ''} sticky top-0 z-30 border-b border-slate-200 bg-[oklch(99%_0.004_90)]/95 px-4 py-3 backdrop-blur md:px-6`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-[#0B2545] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#B5811F]">CorAM Web</p>
                <h2 className="text-xl font-black tracking-tight text-[#0B2545] md:text-2xl">Aplicacion</h2>
              </div>
            </div>
            <AuthPanel auth={auth} compact />
          </div>
        </header>

        <main className={immersiveAppRoute ? 'p-0' : 'px-4 py-5 md:px-6 md:py-7'}>
          <Outlet />
        </main>
        <div className={immersiveAppRoute ? 'hidden' : ''}>
          <LegalFooter />
        </div>
      </div>
      <CookieConsent />
    </div>
  );
}
