import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminRoute } from './AdminRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteAnalytics } from './RouteAnalytics';

const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const AppHomePage = lazy(() => import('../pages/app/AppHomePage').then((m) => ({ default: m.AppHomePage })));
const AppInicioPage = lazy(() => import('../pages/app/AppInicioPage').then((m) => ({ default: m.AppInicioPage })));
const CorariosPage = lazy(() => import('../pages/app/CorariosPage').then((m) => ({ default: m.CorariosPage })));
const HimnarioPage = lazy(() => import('../pages/app/HimnarioPage').then((m) => ({ default: m.HimnarioPage })));
const AcademiaPage = lazy(() => import('../pages/app/AcademiaPage').then((m) => ({ default: m.AcademiaPage })));
const RecursosPage = lazy(() => import('../pages/app/RecursosPage').then((m) => ({ default: m.RecursosPage })));
const ProfilePage = lazy(() => import('../pages/app/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminCoursesPage = lazy(() => import('../pages/admin/AdminCoursesPage').then((m) => ({ default: m.AdminCoursesPage })));
const AdminCorariosPage = lazy(() => import('../pages/admin/AdminCorariosPage').then((m) => ({ default: m.AdminCorariosPage })));
const AdminHymnsPage = lazy(() => import('../pages/admin/AdminHymnsPage').then((m) => ({ default: m.AdminHymnsPage })));
const AdminMediaPage = lazy(() => import('../pages/admin/AdminMediaPage').then((m) => ({ default: m.AdminMediaPage })));
const AdminResourcesPage = lazy(() => import('../pages/admin/AdminResourcesPage').then((m) => ({ default: m.AdminResourcesPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const LegalPage = lazy(() => import('../pages/legal/LegalPage').then((m) => ({ default: m.LegalPage })));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(98%_0.006_90)] text-[#0B2545]">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteAnalytics />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/legal/privacidad" element={<LegalPage type="privacidad" />} />
          <Route path="/legal/terminos" element={<LegalPage type="terminos" />} />
          <Route path="/legal/cookies" element={<LegalPage type="cookies" />} />
          <Route path="/legal/reembolsos" element={<LegalPage type="reembolsos" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AppHomePage />} />
              <Route path="inicio" element={<AppInicioPage />} />
              <Route path="corarios" element={<CorariosPage />} />
              <Route path="himnario" element={<HimnarioPage />} />
              <Route path="academia" element={<AcademiaPage />} />
              <Route path="recursos" element={<RecursosPage />} />
              <Route path="perfil" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="cursos" element={<AdminCoursesPage />} />
              <Route path="corarios" element={<AdminCorariosPage />} />
              <Route path="himnos" element={<AdminHymnsPage />} />
              <Route path="recursos" element={<AdminResourcesPage />} />
              <Route path="usuarios" element={<AdminUsersPage />} />
              <Route path="media" element={<AdminMediaPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
