import { Link, useLocation } from 'react-router-dom';
import { CoramLogo } from '../../components/CoramLogo';
import { appNavigationItems, isNavigationItemActive } from './appNavigation';
import styles from './AppShellV2.module.css';

export function DesktopNavigation() {
  const location = useLocation();
  const items = appNavigationItems.filter((item) => item.desktop);

  return (
    <aside data-shell-desktop-navigation className={`${styles.desktopNavigation} fixed inset-y-0 left-0 z-40 w-[17rem] flex-col overflow-y-auto border-r border-white/10 bg-[#061326] px-4 py-5 text-white shadow-2xl shadow-slate-950/20`}>
      <Link to="/app/inicio" className="flex items-center gap-3 px-1" aria-label="Ir al inicio de CorAM">
        <CoramLogo variant="icon" size={48} />
        <div>
          <p className="font-serif text-2xl leading-none text-[#E4BA56]">CorAM</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Musica · Alabanza</p>
        </div>
      </Link>

      <nav className="mt-8 space-y-1" aria-label="Navegacion principal">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavigationItemActive(item, location.pathname);
          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition active:scale-[0.99] ${active ? 'bg-gradient-to-r from-[#E4BA56] to-[#B5811F] text-[#061326] shadow-lg shadow-[#D4AF37]/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E4BA56]">CorAM abierto</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">Tu biblioteca, academia y herramientas en un solo lugar.</p>
      </div>
    </aside>
  );
}
