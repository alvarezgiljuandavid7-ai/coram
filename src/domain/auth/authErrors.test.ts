import { describe, expect, it } from 'vitest';
import { humanizeAuthError } from './authErrors';

describe('humanizeAuthError', () => {
  it('explains invalid email/password credentials in Spanish', () => {
    expect(humanizeAuthError(new Error('Invalid login credentials'))).toBe(
      'Correo o contrasena incorrectos. Si entras con Google, usa el boton Google o recupera tu contrasena.',
    );
  });

  it('keeps useful unknown provider messages when no known mapping exists', () => {
    expect(humanizeAuthError(new Error('Something unexpected'))).toBe('Something unexpected');
  });
});
