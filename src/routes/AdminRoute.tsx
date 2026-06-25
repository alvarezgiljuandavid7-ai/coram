import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] px-4">
        <div className="max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-700" />
          <h1 className="mt-4 text-2xl font-black text-[#0B2545]">Acceso no autorizado</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-amber-900">
            Tu cuenta no tiene rol administrador. Puedes continuar usando CorAM desde la aplicacion.
          </p>
          <Navigate to="/app" replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
