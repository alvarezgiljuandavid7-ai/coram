import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useCoramApp } from '../../app/CoramAppContext';
import { CookieConsent } from '../../components/CookieConsent';
import { LegalFooter } from '../../components/LegalFooter';
import { CoramTopbar } from './CoramTopbar';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MobileNavigationDrawer } from './MobileNavigationDrawer';
import { PageContainer } from './PageContainer';
import { getActiveNavigationItem, getAppShellMode, getPageContainerMode } from './appNavigation';
import styles from './AppShellV2.module.css';

export function AppShellV2() {
  const { auth, internalNotifications } = useCoramApp();
  const location = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const shellMode = getAppShellMode(location.pathname);

  useEffect(() => {
    if (!navigationOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [navigationOpen]);

  useEffect(() => {
    setNavigationOpen(false);
  }, [location.pathname]);

  if (shellMode === 'immersive') {
    return <Outlet />;
  }

  const activeItem = getActiveNavigationItem(location.pathname);
  const pageTitle = activeItem?.label ?? 'Aplicacion';

  return (
    <div
      data-app-shell="v2"
      className={`${styles.shell} bg-[linear-gradient(180deg,#F7F4EB_0%,#F4EDDF_48%,#FBF8F1_100%)] text-[#0B1F35]`}
    >
      <DesktopNavigation />
      <MobileNavigationDrawer open={navigationOpen} onClose={() => setNavigationOpen(false)} />

      <div className={styles.contentColumn}>
        <CoramTopbar
          pageTitle={pageTitle}
          email={auth.profile?.email}
          avatarUrl={auth.profile?.avatarUrl}
          notificationCount={internalNotifications.length}
          onOpenNavigation={() => setNavigationOpen(true)}
        />
        <main className={styles.main}>
          <PageContainer mode={getPageContainerMode(location.pathname)}>
            <Outlet context={{ openAppNavigation: () => setNavigationOpen(true) }} />
          </PageContainer>
        </main>
        <LegalFooter />
      </div>

      <MobileBottomNavigation />
      <CookieConsent />
    </div>
  );
}
