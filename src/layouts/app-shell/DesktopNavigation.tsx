import { Link, useLocation } from 'react-router-dom';
import { CoramLogo } from '../../components/CoramLogo';
import { appNavigationItems, isNavigationItemActive } from './appNavigation';
import styles from './DesktopNavigation.module.css';

export function DesktopNavigation() {
  const location = useLocation();
  const items = appNavigationItems.filter((item) => item.desktop);

  return (
    <aside data-shell-desktop-navigation className={styles.navigationRail}>
      <Link to="/app/inicio" className={styles.brand} aria-label="Ir al inicio de CorAM">
        <CoramLogo variant="icon" size={48} className={styles.brandLogo} />
        <div>
          <p className={styles.brandKicker}>Tu espacio</p>
          <p className={styles.brandTitle}>CorAM</p>
          <p className={styles.brandSubtitle}>Música · Alabanza · Formación</p>
        </div>
      </Link>

      <nav className={styles.navigationList} aria-label="Navegación principal">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavigationItemActive(item, location.pathname);

          return (
            <Link
              key={item.id}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`${styles.navigationItem} ${active ? styles.navigationItemActive : ''}`}
            >
              <span className={styles.iconSurface}><Icon className="h-4 w-4 shrink-0" /></span>
              <span>{item.label}</span>
              {active && <span className={styles.activeIndicator} aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.railFooter}>
        <p className={styles.railFooterKicker}>CorAM abierto</p>
        <p className={styles.railFooterText}>Tu biblioteca, academia y herramientas en un solo lugar.</p>
      </div>
    </aside>
  );
}
