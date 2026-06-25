import { describe, expect, it } from 'vitest';
import { humanizeAuthError } from './authErrors';

describe('humanizeAuthError', () => {
  it('explains invalid email/password credentials in Spanish', () => {
    expect(humanizeAuthError(new Error('Invalid login credentials'))).toBe(
      'Correo o contrasena incorrectos. Si entras con Google, usa el boton Google o recupera tu contrasena.',
    );
  });

  it('explains email send rate limits in Spanish', () => {
    expect(humanizeAuthError(new Error('email rate limit exceeded'))).toBe(
      'Supabase alcanzo el limite temporal de correos. Intenta registrarte mas tarde o entra con Google.',
    );
  });

  it('explains invalid email addresses in Spanish', () => {
    expect(humanizeAuthError(new Error('Email address "test@example.com" is invalid'))).toBe(
      'Ese correo no parece valido para Supabase. Usa un correo real o continua con Google.',
    );
  });

  it('keeps useful unknown provider messages when no known mapping exists', () => {
    expect(humanizeAuthError(new Error('Something unexpected'))).toBe('Something unexpected');
  });
});
