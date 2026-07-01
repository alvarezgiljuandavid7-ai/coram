import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('experience separation', () => {
  it('defines independent public, auth, app, and admin layouts in the router', () => {
    const router = source('src/routes/AppRouter.tsx');

    expect(router).toContain("import { PublicLayout } from '../layouts/PublicLayout'");
    expect(router).toContain("import { AuthLayout } from '../layouts/AuthLayout'");
    expect(router).toContain('path="/" element={<PublicLayout />}');
    expect(router).toContain('path="/login" element={<AuthLayout />}');
    expect(router).toContain('path="/register" element={<AuthLayout />}');
    expect(router).toContain('path="/forgot-password" element={<AuthLayout />}');
    expect(router).toContain('path="/app" element={<AppLayout />}');
    expect(router).toContain('path="/admin" element={<AdminLayout />}');
    expect(router).not.toContain('path="/" element={<Navigate to="/app" replace />}');
  });

  it('keeps the landing independent from app and admin internals', () => {
    expect(existsSync(join(process.cwd(), 'src/layouts/PublicLayout.tsx'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'src/pages/public/LandingPage.tsx'))).toBe(true);

    const landing = source('src/pages/public/LandingPage.tsx');
    expect(landing).not.toContain('PhoneSimulator');
    expect(landing).not.toContain('AdminDashboard');
    expect(landing).not.toContain('useCoramApp');
  });

  it('keeps the user app menu scoped to member navigation only', () => {
    const appLayout = source('src/layouts/AppLayout.tsx');

    expect(appLayout).toContain("label: 'Inicio'");
    expect(appLayout).toContain("label: 'Corarios'");
    expect(appLayout).toContain("label: 'Himnario'");
    expect(appLayout).toContain("label: 'Academia'");
    expect(appLayout).toContain("label: 'Recursos'");
    expect(appLayout).toContain("label: 'Herramientas'");
    expect(appLayout).toContain("label: 'Perfil'");
    expect(appLayout).not.toContain("label: 'Aplicacion'");
    expect(appLayout).not.toContain('Ir al panel administrador');
  });

  it('keeps the admin menu scoped to administrator navigation only', () => {
    const adminLayout = source('src/layouts/AdminLayout.tsx');

    expect(adminLayout).toContain("label: 'Dashboard'");
    expect(adminLayout).toContain("label: 'Cursos'");
    expect(adminLayout).toContain("label: 'Corarios'");
    expect(adminLayout).toContain("label: 'Himnos'");
    expect(adminLayout).toContain("label: 'Recursos'");
    expect(adminLayout).toContain("label: 'Usuarios'");
    expect(adminLayout).toContain("label: 'Configuracion'");
    expect(adminLayout).not.toContain("label: 'Campañas'");
  });

  it('does not render the phone mockup or commercial hero from /app', () => {
    const appHome = source('src/pages/app/AppHomePage.tsx');

    expect(appHome).not.toContain('PhoneSimulator');
    expect(appHome).not.toContain('Tu aplicacion ministerial');
    expect(appHome).not.toContain('rounded-3xl border border-slate-200');
  });

  it('keeps admin resources and hymns on dedicated pages instead of unrelated dashboard tabs', () => {
    expect(source('src/pages/admin/AdminResourcesPage.tsx')).not.toContain('monetize');
    expect(source('src/pages/admin/AdminHymnsPage.tsx')).not.toContain('corarios');
  });

  it('mounts vocal tools as normal user app routes', () => {
    const router = source('src/routes/AppRouter.tsx');

    expect(router).toContain('path="herramientas" element={<HerramientasPage />}');
    expect(router).toContain('path="herramientas/afinador" element={<AfinadorPage />}');
    expect(router).toContain('path="herramientas/piano" element={<PianoPage />}');
    expect(router).toContain('path="herramientas/calentamiento" element={<CalentamientoPage />}');
  });

  it('reuses the existing vocal tools engine without exposing the old phone home in tool routes', () => {
    const toolsShell = source('src/pages/app/tools/VocalToolsShell.tsx');
    const phoneSimulator = source('src/components/PhoneSimulator.tsx');

    expect(toolsShell).toContain('PhoneSimulator');
    expect(toolsShell).toContain('initialScreen');
    expect(toolsShell).toContain('toolOnly');
    expect(phoneSimulator).toContain('initialScreen = getInitialPhoneScreen()');
    expect(phoneSimulator).toContain('toolOnly = false');
    expect(phoneSimulator).toContain("navigate('/app/herramientas')");
    expect(phoneSimulator).toContain("academy: '/app/academia'");
    expect(phoneSimulator).toContain("'corarios-list': '/app/corarios'");
    expect(phoneSimulator).toContain("himnarios: '/app/himnario'");
    expect(phoneSimulator).toContain('Antes de activar el afinador, tu navegador te pedira permiso para usar el microfono.');
  });

  it('keeps Apple sign in behind an explicit provider flag', () => {
    const authPanel = source('src/components/AuthPanel.tsx');
    const authRepository = source('src/domain/auth/authRepository.ts');

    expect(authPanel).toContain('auth.appleOAuthEnabled');
    expect(authPanel).toContain('Continuar con Apple');
    expect(authRepository).toContain("provider: 'apple'");
  });

  it('keeps mobile auth and app headers compact after polish', () => {
    const authLayout = source('src/layouts/AuthLayout.tsx');
    const appLayout = source('src/layouts/AppLayout.tsx');

    expect(authLayout).toContain('items-start');
    expect(authLayout).toContain('pt-4');
    expect(authLayout).toContain('clamp(');
    expect(appLayout).toContain('py-2 md:py-3');
    expect(appLayout).toContain('text-lg md:text-2xl');
  });
});
