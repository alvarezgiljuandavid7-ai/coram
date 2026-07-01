import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
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
import { BrandedIcon, PremiumBottomNav, PremiumSidebar, PremiumTopBar } from '../components/app-premium/PremiumApp';
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

const bottomNav = appNav.filter((item) =>
  ['/app/inicio', '/app/corarios', '/app/himnario', '/app/herramientas', '/app/perfil'].includes(item.to),
);

export function isImmersiveAppRoute(pathname: string): boolean {
  void pathname;
  return false;
}

export function AppLayout() {
  const { auth } = useCoramApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const immersiveAppRoute = isImmersiveAppRoute(location.pathname);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={`min-h-screen bg-[oklch(97.5%_0.008_90)] text-slate-900 ${immersiveAppRoute ? 'max-md:bg-slate-950' : ''}`}>
      <PremiumSidebar open={open}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CoramLogo variant="icon" size={46} />
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#D4AF37]">CorAM</h1>
              <p className="text-xs font-semibold text-slate-300">Aplicacion ministerial</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-200 transition hover:bg-white/10 active:scale-95 lg:hidden">
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
                  `flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition active:scale-[0.99] ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#9F6B18] text-slate-950 shadow-lg shadow-[#D4AF37]/20'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-bold">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">Plan actual</p>
          <p className="mt-2 text-sm font-black">CorAM abierto</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">Herramientas, corarios y recursos listos para ministrar.</p>
        </div>
      </PremiumSidebar>

      {open && (
        <motion.button
          type="button"
          aria-label="Cerrar menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <PremiumTopBar immersive={immersiveAppRoute} className="py-2 md:py-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-2xl border border-slate-200 bg-white p-2 text-[#0B2545] shadow-sm transition hover:-translate-y-0.5 active:scale-95 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden lg:block">
                <BrandedIcon icon={LayoutDashboard} tone="gold" className="h-10 w-10" />
              </div>
              <div>
                <p className="hidden text-[10px] font-black uppercase tracking-widest text-[#B5811F] sm:block">CorAM Web</p>
                <h2 className="text-lg md:text-2xl font-black tracking-tight text-[#0B2545]">Aplicacion</h2>
              </div>
            </div>
            <div className="max-w-full overflow-hidden">
              <AuthPanel auth={auth} compact />
            </div>
          </div>
        </PremiumTopBar>

        <main className={immersiveAppRoute ? 'p-0' : 'px-3 py-4 pb-28 min-[390px]:px-4 md:px-6 md:py-7 md:pb-7'}>
          <Outlet />
        </main>
        <div className={immersiveAppRoute ? 'hidden' : ''}>
          <LegalFooter />
        </div>
      </div>
      <PremiumBottomNav items={bottomNav} />
      <CookieConsent />
    </div>
  );
}
