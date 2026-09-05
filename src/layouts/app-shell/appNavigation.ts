import type { LucideIcon } from 'lucide-react';
import {
  BookMarked,
  Building2,
  FolderHeart,
  FolderOpen,
  GraduationCap,
  Heart,
  Home,
  LayoutDashboard,
  ListMusic,
  Music2,
  PanelsTopLeft,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';

export type AppNavigationMatch = 'exact' | 'prefix';
export type AppShellMode = 'standard' | 'immersive';
export type PageContainerMode = 'standard' | 'wide' | 'edge-to-edge';

export interface AppNavigationItem {
  id: string;
  to: string;
  label: string;
  icon: LucideIcon;
  match: AppNavigationMatch;
  desktop: boolean;
  drawer: boolean;
  bottom: boolean;
  container: PageContainerMode;
}

export const appNavigationItems: AppNavigationItem[] = [
  {
    id: 'app-root',
    to: '/app',
    label: 'Aplicacion',
    icon: LayoutDashboard,
    match: 'exact',
    desktop: false,
    drawer: false,
    bottom: false,
    container: 'wide',
  },
  {
    id: 'inicio',
    to: '/app/inicio',
    label: 'Inicio',
    icon: Home,
    match: 'exact',
    desktop: true,
    drawer: true,
    bottom: true,
    container: 'edge-to-edge',
  },
  {
    id: 'feed',
    to: '/app/feed',
    label: 'Feed',
    icon: PanelsTopLeft,
    match: 'exact',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'corarios',
    to: '/app/corarios',
    label: 'Corarios',
    icon: Music2,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: true,
    container: 'edge-to-edge',
  },
  {
    id: 'himnario',
    to: '/app/himnario',
    label: 'Himnario',
    icon: BookMarked,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: true,
    container: 'edge-to-edge',
  },
  {
    id: 'herramientas',
    to: '/app/herramientas',
    label: 'Herramientas',
    icon: SlidersHorizontal,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'academia',
    to: '/app/academia',
    label: 'Academia',
    icon: GraduationCap,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: true,
    container: 'edge-to-edge',
  },
  {
    id: 'recursos',
    to: '/app/recursos',
    label: 'Recursos',
    icon: FolderOpen,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'colecciones',
    to: '/app/colecciones',
    label: 'Colecciones',
    icon: FolderHeart,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'favoritos',
    to: '/app/favoritos',
    label: 'Favoritos',
    icon: Heart,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'repertorio',
    to: '/app/repertorio',
    label: 'Repertorio',
    icon: ListMusic,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'ministerio',
    to: '/app/ministerio',
    label: 'Ministerio',
    icon: Building2,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: false,
    container: 'edge-to-edge',
  },
  {
    id: 'perfil',
    to: '/app/perfil',
    label: 'Perfil',
    icon: UserRound,
    match: 'prefix',
    desktop: true,
    drawer: true,
    bottom: true,
    container: 'edge-to-edge',
  },
];

export const centralCoramAction = {
  id: 'coram-central-action',
  to: '/app/inicio',
  label: 'CorAM',
} as const;

export function isNavigationItemActive(item: AppNavigationItem, pathname: string): boolean {
  const currentPath = normalizePath(pathname);
  const destination = normalizePath(item.to);

  if (item.match === 'exact') {
    return currentPath === destination;
  }

  return currentPath === destination || currentPath.startsWith(`${destination}/`);
}

export function getAppShellMode(pathname: string): AppShellMode {
  const currentPath = normalizePath(pathname);
  return currentPath.startsWith('/app/ensayo/') || currentPath === '/app/feed' ? 'immersive' : 'standard';
}

export function getActiveNavigationItem(pathname: string): AppNavigationItem | undefined {
  return appNavigationItems.find((item) => isNavigationItemActive(item, pathname));
}

export function getPageContainerMode(pathname: string): PageContainerMode {
  return getActiveNavigationItem(pathname)?.container ?? 'standard';
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
