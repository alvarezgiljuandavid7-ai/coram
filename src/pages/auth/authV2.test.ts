import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('CorAM Auth V2', () => {
  it('uses the shared editorial AuthLayoutV2 without changing public auth routes', () => {
    expect(existsSync(join(process.cwd(), 'src/pages/auth/AuthLayoutV2.tsx'))).toBe(true);
    expect(existsSync(join(process.cwd(), 'src/pages/auth/AuthLayoutV2.module.css'))).toBe(true);

    expect(source('src/layouts/AuthLayout.tsx')).toContain('AuthLayoutV2');
    const router = source('src/routes/AppRouter.tsx');
    expect(router).toContain('path="/login" element={<AuthLayout />}');
    expect(router).toContain('path="/register" element={<AuthLayout />}');
    expect(router).toContain('path="/forgot-password" element={<AuthLayout />}');
  });

  it('keeps the auth form accessible and ready for real credential entry', () => {
    const panel = source('src/components/AuthPanel.tsx');

    expect(panel).toContain('autoComplete="email"');
    expect(panel).toContain('const passwordAutocomplete');
    expect(panel).toContain("'new-password'");
    expect(panel).toContain("'current-password'");
    expect(panel).toContain('aria-live="polite"');
    expect(panel).toContain('Mostrar contrasena');
    expect(panel).toContain('Continuar con Google');
    expect(panel).toContain('auth.signInWithGoogle()');
    expect(panel).toContain('auth.signInWithEmail(email, password)');
  });
});
