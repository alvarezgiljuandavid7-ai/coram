import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  getSession: vi.fn(),
  maybeSingle: vi.fn(),
  assign: vi.fn(),
}));

vi.mock('../../shared/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
      getSession: mocks.getSession,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mocks.maybeSingle,
        })),
      })),
    })),
  },
}));

describe('getCurrentCoramSession', () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.maybeSingle.mockReset();
  });

  it('uses the Supabase app metadata admin role when the profile row is not available yet', async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'admin@coram.test',
            app_metadata: { role: 'admin' },
          },
        },
      },
      error: null,
    });
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const { getCurrentCoramSession } = await import('./authRepository');

    await expect(getCurrentCoramSession()).resolves.toMatchObject({
      role: 'admin',
      profile: null,
      user: { id: 'user-1' },
    });
  });
});

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
