import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCoramApp } from '../app/CoramAppContext';
import { logAdminAccess } from '../domain/observability/observabilityRepository';

export function AdminRoute() {
  const { auth } = useCoramApp();
  const location = useLocation();

  useEffect(() => {
    if (!auth.loading) {
      void logAdminAccess(location.pathname, Boolean(auth.isAdmin));
    }
  }, [auth.loading, auth.isAdmin, location.pathname]);

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] text-[#0B2545]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  }

  if (!auth.isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
