export type MobileAuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type MobileAuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; userId: string };

type SessionLike = { user: { id: string } } | null;

export function toAuthState(session: SessionLike): MobileAuthState {
  return session
    ? { status: 'signedIn', userId: session.user.id }
    : { status: 'signedOut' };
}

export function resolveAuthRoute(
  status: MobileAuthStatus,
  isProtectedRoute: boolean,
): '/(auth)' | '/(app)' | null {
  if (status === 'loading') return null;
  if (status === 'signedOut' && isProtectedRoute) return '/(auth)';
  if (status === 'signedIn' && !isProtectedRoute) return '/(app)';
  return null;
}
