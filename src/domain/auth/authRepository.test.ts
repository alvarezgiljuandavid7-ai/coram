import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  assign: vi.fn(),
}));

vi.mock('../../shared/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
    },
  },
}));

describe('authRepository', () => {
  beforeEach(() => {
    mocks.signInWithOAuth.mockReset();
    mocks.signInWithPassword.mockReset();
    mocks.signUp.mockReset();
    mocks.signOut.mockReset();
    mocks.assign.mockReset();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          origin: 'http://localhost:3000',
          assign: mocks.assign,
        },
      },
    });
  });

  it('requests the Supabase OAuth URL and navigates explicitly', async () => {
    mocks.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=coram' },
      error: null,
    });

    const { signInWithGoogle } = await import('./authRepository');

    await signInWithGoogle();

    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/login',
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    expect(mocks.assign).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth?client_id=coram');
  });

  it('requests the Supabase Apple OAuth URL only when Apple is configured', async () => {
    mocks.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://appleid.apple.com/auth/authorize?client_id=coram' },
      error: null,
    });

    const { signInWithApple } = await import('./authRepository');

    await signInWithApple();

    expect(mocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'apple',
      options: {
        redirectTo: 'http://localhost:3000/login',
        skipBrowserRedirect: true,
      },
    });
    expect(mocks.assign).toHaveBeenCalledWith('https://appleid.apple.com/auth/authorize?client_id=coram');
  });

  it('builds auth redirect URLs from a configured public app URL', async () => {
    const { buildAuthRedirectUrl } = await import('./authRepository');

    expect(buildAuthRedirectUrl('/login', 'http://localhost:3000', 'https://coram-two.vercel.app/')).toBe(
      'https://coram-two.vercel.app/login',
    );
  });

  it('trims email before password sign in', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const { signInWithEmail } = await import('./authRepository');

    await signInWithEmail('  admin@example.com  ', 'password');

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'password' });
  });

  it('allows valid iCloud addresses through email sign up without frontend domain blocking', async () => {
    mocks.signUp.mockResolvedValue({ error: null });
    const { signUpWithEmail } = await import('./authRepository');

    await signUpWithEmail('  coram.test@icloud.com  ', 'password123', 'Usuario iCloud');

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'coram.test@icloud.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Usuario iCloud',
        },
        emailRedirectTo: 'http://localhost:3000/login',
      },
    });
  });

  it('signs out all Supabase sessions for a clean account switch', async () => {
    mocks.signOut.mockResolvedValue({ error: null });
    const { signOut } = await import('./authRepository');

    await signOut();

    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'global' });
  });
});
