import { Navigate, useLocation } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { useCoramApp } from '../app/CoramAppContext';

export function RegisterPage() {
  const { auth } = useCoramApp();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (!auth.loading && auth.user) {
    return <Navigate to={auth.isAdmin ? from || '/admin' : '/app'} replace />;
  }

  return <AuthPanel auth={auth} initialMode="signup" />;
}
