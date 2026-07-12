import { AppShellV2 } from './app-shell/AppShellV2';
import { appNavigationItems, getAppShellMode } from './app-shell/appNavigation';

export const appNav = appNavigationItems;

export function isImmersiveAppRoute(pathname: string): boolean {
  return getAppShellMode(pathname) === 'immersive';
}

export function AppLayout() {
  return <AppShellV2 />;
}
