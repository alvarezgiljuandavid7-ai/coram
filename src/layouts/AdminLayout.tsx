import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookMarked, FolderOpen, GraduationCap, Images, LayoutDashboard, Menu, Music2, UsersRound, X } from 'lucide-react';
import { AuthPanel } from '../components/AuthPanel';
import { CoramLogo } from '../components/CoramLogo';
import { LegalFooter } from '../components/LegalFooter';
import { useCoramApp } from '../app/CoramAppContext';

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/cursos', label: 'Cursos', icon: GraduationCap },
  { to: '/admin/corarios', label: 'Corarios', icon: Music2 },
  { to: '/admin/himnos', label: 'Himnos', icon: BookMarked },
  { to: '/admin/recursos', label: 'Recursos', icon: FolderOpen },
  { to: '/admin/media', label: 'Campañas', icon: Images },
  { to: '/admin/usuarios', label: 'Usuarios', icon: UsersRound },
];

export function AdminLayout() {
  const { auth } = useCoramApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 px-4 py-5 shadow-xl transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CoramLogo variant="icon" size={46} />
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#D4AF37]">CorAM Admin</h1>
              <p className="text-xs font-semibold text-slate-400">Panel protegido</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-[#D4AF37] text-slate-950'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-slate-50'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-bold">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <NavLink
          to="/app"
          className="mt-8 block rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm font-black text-slate-100"
        >
          Volver a la app
        </NavLink>
      </aside>

      {open && <button type="button" aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-100 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">Administracion</p>
                <h2 className="text-xl font-black tracking-tight text-slate-50 md:text-2xl">Panel CorAM</h2>
              </div>
            </div>
            <AuthPanel auth={auth} compact />
          </div>
        </header>

        <main className="px-4 py-5 md:px-6 md:py-7">
          <Outlet />
        </main>
        <LegalFooter />
      </div>
    </div>
  );
}
