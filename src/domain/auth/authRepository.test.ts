import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  assign: vi.fn(),
}));

vi.mock('../../shared/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
    },
  },
}));

describe('signInWithGoogle', () => {
  beforeEach(() => {
    mocks.signInWithOAuth.mockReset();
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
        redirectTo: 'http://localhost:3000/app',
        skipBrowserRedirect: true,
      },
    });
    expect(mocks.assign).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth?client_id=coram');
  });
});
