import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCoramApp } from '../app/CoramAppContext';

export function ProtectedRoute() {
  const { auth } = useCoramApp();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] text-[#0B2545]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
