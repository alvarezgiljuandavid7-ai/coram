import { useEffect, useRef } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCoramApp } from '../../app/CoramAppContext';
import { CoramLogo } from '../../components/CoramLogo';
import { appNavigationItems, isNavigationItemActive, type AppNavigationItem } from './appNavigation';
import styles from './MobileNavigationDrawer.module.css';

const principalIds = new Set(['inicio', 'corarios', 'himnario', 'herramientas', 'academia', 'recursos']);
const libraryIds = new Set(['colecciones', 'favoritos']);
const accountIds = new Set(['perfil']);

export function MobileNavigationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const { auth } = useCoramApp();
  const drawerRef = useRef<HTMLElement>(null);
  const drawerItems = appNavigationItems.filter((item) => item.drawer);
  const principalItems = drawerItems.filter((item) => principalIds.has(item.id));
  const libraryItems = drawerItems.filter((item) => libraryIds.has(item.id));
  const accountItems = drawerItems.filter((item) => accountIds.has(item.id));
  const membershipLabel = auth.role === 'premium' ? 'Membresia premium' : auth.role === 'member' ? 'Miembro' : null;

  useEffect(() => {
    if (!open) return undefined;

    const drawer = drawerRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = (): HTMLElement[] => drawer ? Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector)) : [];
    const firstElement = focusable()[0];
    firstElement?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Cerrar menu de CorAM"
          aria-hidden={!open}
          tabIndex={open ? 0 : -1}
          onClick={onClose}
          className={`${styles.overlay} fixed inset-0 z-50 transition-opacity lg:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        />
      )}
      <aside
        ref={drawerRef}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal de CorAM"
        aria-hidden={!open}
        className={`${styles.drawerSurface} fixed inset-y-0 left-0 z-[60] flex w-[min(88vw,22rem)] flex-col overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] transition-transform duration-200 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full pointer-events-none'}`}
      >
        <div className={styles.drawerHeader}>
          <Link to="/app/inicio" onClick={onClose} className="flex min-w-0 items-center gap-3" aria-label="Ir al inicio de CorAM">
            <CoramLogo variant="icon" size={48} className="rounded-2xl" />
            <div className="min-w-0">
              <p className={styles.drawerKicker}>Tu espacio</p>
              <p className={styles.drawerTitle}>CorAM</p>
              <p className={styles.drawerSubtitle}>Música · Alabanza · Formación</p>
            </div>
          </Link>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Cerrar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-7 space-y-6" aria-label="Menu completo de CorAM">
          <DrawerNavigationSection title="Principal" items={principalItems} pathname={location.pathname} onClose={onClose} />
          <DrawerNavigationSection title="Biblioteca personal" items={libraryItems} pathname={location.pathname} onClose={onClose} />
          <DrawerNavigationSection title="Cuenta" items={accountItems} pathname={location.pathname} onClose={onClose} />
        </nav>

        <div className={styles.drawerFooter}>
          {membershipLabel && <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3d7146]">{membershipLabel}</p>}
          <Link to="/app/perfil" onClick={onClose} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#17305a] underline decoration-[#d7a934] decoration-2 underline-offset-4">
            Ver mi perfil
          </Link>
        </div>
      </aside>
    </>
  );
}

function DrawerNavigationSection({
  title,
  items,
  pathname,
  onClose,
}: {
  title: string;
  items: AppNavigationItem[];
  pathname: string;
  onClose: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-label={title}>
      <p className={styles.sectionTitle}>{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <DrawerNavigationItem key={item.id} item={item} active={isNavigationItemActive(item, pathname)} onClose={onClose} />
        ))}
      </div>
    </section>
  );
}

function DrawerNavigationItem({ item, active, onClose }: { key?: string; item: AppNavigationItem; active: boolean; onClose: () => void }) {
  const Icon = item.icon as LucideIcon;

  return (
    <Link
      to={item.to}
      onClick={onClose}
      aria-current={active ? 'page' : undefined}
      className={`${styles.navigationItem} ${active ? styles.navigationItemActive : ''}`}
    >
      <span className={styles.iconSurface}><Icon className="h-5 w-5 shrink-0" /></span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {active && <span className={styles.activeIndicator} aria-hidden="true" />}
    </Link>
  );
}
