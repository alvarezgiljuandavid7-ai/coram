import { Link, useLocation } from 'react-router-dom';
import { CoramLogo } from '../../components/CoramLogo';
import { appNavigationItems, centralCoramAction, isNavigationItemActive } from './appNavigation';
import styles from './AppShellV2.module.css';

export function MobileBottomNavigation() {
  const location = useLocation();
  const primaryItems = appNavigationItems.filter((item) => item.bottom);
  const leftItems = primaryItems.slice(0, 2);
  const rightItems = primaryItems.slice(2);

  return (
    <nav data-shell-mobile-navigation className={`${styles.mobileBottomNavigation} fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 rounded-[1.7rem] border border-white/70 bg-[#fffdf8] px-1.5 py-2 md:hidden`} aria-label="Navegacion rapida de CorAM">
      <div className="grid grid-cols-6 gap-0.5">
        {leftItems.map((item) => <BottomNavigationItem key={item.id} item={item} pathname={location.pathname} />)}
        <Link to={centralCoramAction.to} className="mx-[-0.25rem] -mt-6 flex h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-full bg-[#4A8A55] px-1 text-[9px] font-black text-white shadow-xl shadow-[#4A8A55]/30 active:scale-95" aria-label={centralCoramAction.label}>
          <CoramLogo variant="icon" size={40} className="rounded-full border-0 bg-transparent shadow-none" />
          <span>{centralCoramAction.label}</span>
        </Link>
        {rightItems.map((item) => <BottomNavigationItem key={item.id} item={item} pathname={location.pathname} />)}
      </div>
    </nav>
  );
}

function BottomNavigationItem({ item, pathname }: { key?: string; item: (typeof appNavigationItems)[number]; pathname: string }) {
  const Icon = item.icon;
  const active = isNavigationItemActive(item, pathname);
  return (
    <Link
      to={item.to}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 text-[9px] font-black transition active:scale-95 ${active ? 'text-[#3D7A47]' : 'text-[#0B2545]'}`}
    >
      <Icon className={`h-5 w-5 ${active ? 'stroke-[2.6]' : ''}`} />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}
