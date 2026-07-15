import { Navigate, useLocation } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { useCoramApp } from '../app/CoramAppContext';
import { getPostLoginRedirect } from '../domain/auth/postLoginRedirect';
import { shouldRedirectFromLogin } from '../domain/auth/authSessionState';

export function LoginPage() {
  const { auth } = useCoramApp();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (shouldRedirectFromLogin({ loading: auth.loading, hasUser: Boolean(auth.user), recoveryMode: auth.recoveryMode })) {
    return <Navigate to={getPostLoginRedirect(auth.role, from)} replace />;
  }

  return <AuthPanel auth={auth} initialMode="signin" />;
}
