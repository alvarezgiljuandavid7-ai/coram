import { Bell, Menu, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CoramLogo } from '../../components/CoramLogo';

interface CoramTopbarProps {
  pageTitle: string;
  email?: string | null;
  avatarUrl?: string | null;
  notificationCount: number;
  onOpenNavigation: () => void;
}

export function CoramTopbar({ pageTitle, email, avatarUrl, notificationCount, onOpenNavigation }: CoramTopbarProps) {
  return (
    <header data-shell-topbar className="sticky top-0 z-30 border-b border-[#0B2545]/8 bg-[#fffdf8] lg:bg-[#fffdf8]/92 lg:backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.5rem] max-w-[100rem] items-center justify-between gap-3 px-3 py-2 min-[390px]:px-4 md:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenNavigation}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#0B2545]/10 bg-white text-[#0B2545] shadow-sm transition hover:bg-[#f6f1e7] active:scale-95 lg:hidden"
            aria-label="Abrir menu de CorAM"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/app/inicio" className="hidden shrink-0 items-center gap-2 sm:flex lg:hidden" aria-label="Ir al inicio de CorAM">
            <CoramLogo variant="icon" size={40} className="rounded-xl" />
            <span className="font-serif text-2xl leading-none text-[#0B2545]">CorAM</span>
          </Link>
          <div className="min-w-0 border-l border-[#0B2545]/10 pl-3 sm:ml-1 lg:border-l-0 lg:pl-0">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#B5811F]">CorAM</p>
            <h1 className="truncate text-lg font-black tracking-tight text-[#0B2545] md:text-xl">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <Link to="/app/inicio" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-[#0B2545] transition hover:bg-[#0B2545]/5 active:scale-95" aria-label="Ver novedades">
            <Bell className="h-5 w-5 stroke-[1.8]" />
            {notificationCount > 0 && (
              <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#F6BB18] px-1 text-[9px] font-black text-[#0B2545]">
                {Math.min(notificationCount, 99)}
              </span>
            )}
          </Link>
          <Link to="/app/perfil" className="flex min-w-0 items-center gap-2 rounded-2xl p-1 transition hover:bg-[#0B2545]/5" aria-label="Abrir mi perfil">
            <span className="hidden max-w-44 truncate text-xs font-bold text-[#405069] xl:block">{email}</span>
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#e4c57e] shadow-sm">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5 text-[#0B2545]" />}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
