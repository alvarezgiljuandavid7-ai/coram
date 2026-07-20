import { describe, expect, it } from 'vitest';
import {
  appNavigationItems,
  centralCoramAction,
  getAppShellMode,
  getPageContainerMode,
  isNavigationItemActive,
} from './appNavigation';

describe('AppShellV2 navigation', () => {
  it('does not leave the /app root active on descendant routes', () => {
    const appRoot = appNavigationItems.find((item) => item.to === '/app');

    expect(appRoot).toBeDefined();
    expect(appRoot && isNavigationItemActive(appRoot, '/app')).toBe(true);
    expect(appRoot && isNavigationItemActive(appRoot, '/app/')).toBe(true);
    expect(appRoot && isNavigationItemActive(appRoot, '/app/inicio')).toBe(false);
  });

  it('uses exact matching for inicio and prefix matching for feature routes', () => {
    const inicio = appNavigationItems.find((item) => item.to === '/app/inicio');
    const corarios = appNavigationItems.find((item) => item.to === '/app/corarios');

    expect(inicio && isNavigationItemActive(inicio, '/app/inicio')).toBe(true);
    expect(inicio && isNavigationItemActive(inicio, '/app/inicio/otra')).toBe(false);
    expect(corarios && isNavigationItemActive(corarios, '/app/corarios')).toBe(true);
    expect(corarios && isNavigationItemActive(corarios, '/app/corarios/detalle')).toBe(true);
    expect(corarios && isNavigationItemActive(corarios, '/app/corarios-extra')).toBe(false);
  });

  it('bypasses the shared shell for rehearsal routes only', () => {
    expect(getAppShellMode('/app/ensayo/corario/123')).toBe('immersive');
    expect(getAppShellMode('/app/ensayo/himno/456')).toBe('immersive');
    expect(getAppShellMode('/app/corarios')).toBe('standard');
  });

  it('keeps the central CorAM action outside the visual item array', () => {
    expect(centralCoramAction.to).toBe('/app/inicio');
    expect(appNavigationItems.every((item) => item.id !== centralCoramAction.id)).toBe(true);
  });

  it('gives every V2 user experience the edge-to-edge canvas', () => {
    for (const path of ['/app/corarios', '/app/himnario', '/app/herramientas', '/app/herramientas/afinador', '/app/academia', '/app/recursos', '/app/colecciones', '/app/favoritos', '/app/ministerio', '/app/perfil']) {
      expect(getPageContainerMode(path)).toBe('edge-to-edge');
    }
  });

  it('covers every primary user destination in one typed source', () => {
    expect(appNavigationItems.map((item) => item.to)).toEqual([
      '/app',
      '/app/inicio',
      '/app/corarios',
      '/app/himnario',
      '/app/herramientas',
      '/app/academia',
      '/app/recursos',
      '/app/colecciones',
      '/app/favoritos',
      '/app/ministerio',
      '/app/perfil',
    ]);
  });
});
