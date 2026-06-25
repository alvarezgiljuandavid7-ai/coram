import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAdminShortcutLabel, getInitialPhoneScreen } from './PhoneSimulator';

describe('PhoneSimulator launch copy', () => {
  const source = readFileSync(join(process.cwd(), 'src/components/PhoneSimulator.tsx'), 'utf8');

  it('opens authenticated users directly into the app home', () => {
    expect(getInitialPhoneScreen()).toBe('home');
  });

  it('shows an admin shortcut only for administrators', () => {
    expect(getAdminShortcutLabel(true)).toBe('Panel administrador');
    expect(getAdminShortcutLabel(false)).toBeNull();
  });

  it('does not expose broken Apple, premium, pro, or payment entry points in the user app', () => {
    expect(source).not.toContain('Continuar con Apple');
    expect(source).not.toMatch(/\bPRO\b/);
    expect(source).not.toContain('ACCESO PREMIUM');
    expect(source).not.toContain('Únete a CorAM Premium');
    expect(source).not.toContain('Premium ⭐');
    expect(source).not.toMatch(/Carrito de Pago|Pasarela CorAM|SER PREMIUM/i);
  });
});
