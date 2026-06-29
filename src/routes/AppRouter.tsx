import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminRoute } from './AdminRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteAnalytics } from './RouteAnalytics';

const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const LandingPage = lazy(() => import('../pages/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const AppHomePage = lazy(() => import('../pages/app/AppHomePage').then((m) => ({ default: m.AppHomePage })));
const AppInicioPage = lazy(() => import('../pages/app/AppInicioPage').then((m) => ({ default: m.AppInicioPage })));
const CorariosPage = lazy(() => import('../pages/app/CorariosPage').then((m) => ({ default: m.CorariosPage })));
const HimnarioPage = lazy(() => import('../pages/app/HimnarioPage').then((m) => ({ default: m.HimnarioPage })));
const AcademiaPage = lazy(() => import('../pages/app/AcademiaPage').then((m) => ({ default: m.AcademiaPage })));
const RecursosPage = lazy(() => import('../pages/app/RecursosPage').then((m) => ({ default: m.RecursosPage })));
const ProfilePage = lazy(() => import('../pages/app/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const HerramientasPage = lazy(() => import('../pages/app/tools/HerramientasPage').then((m) => ({ default: m.HerramientasPage })));
const AfinadorPage = lazy(() => import('../pages/app/tools/AfinadorPage').then((m) => ({ default: m.AfinadorPage })));
const PianoPage = lazy(() => import('../pages/app/tools/PianoPage').then((m) => ({ default: m.PianoPage })));
const CalentamientoPage = lazy(() => import('../pages/app/tools/CalentamientoPage').then((m) => ({ default: m.CalentamientoPage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminCoursesPage = lazy(() => import('../pages/admin/AdminCoursesPage').then((m) => ({ default: m.AdminCoursesPage })));
const AdminCorariosPage = lazy(() => import('../pages/admin/AdminCorariosPage').then((m) => ({ default: m.AdminCorariosPage })));
const AdminHymnsPage = lazy(() => import('../pages/admin/AdminHymnsPage').then((m) => ({ default: m.AdminHymnsPage })));
const AdminResourcesPage = lazy(() => import('../pages/admin/AdminResourcesPage').then((m) => ({ default: m.AdminResourcesPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
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
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="legal/privacidad" element={<LegalPage type="privacidad" />} />
            <Route path="legal/terminos" element={<LegalPage type="terminos" />} />
            <Route path="legal/cookies" element={<LegalPage type="cookies" />} />
            <Route path="legal/reembolsos" element={<LegalPage type="reembolsos" />} />
          </Route>

          <Route path="/login" element={<AuthLayout />}>
            <Route index element={<LoginPage />} />
          </Route>
          <Route path="/register" element={<AuthLayout />}>
            <Route index element={<RegisterPage />} />
          </Route>
          <Route path="/forgot-password" element={<AuthLayout />}>
            <Route index element={<ForgotPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AppHomePage />} />
              <Route path="inicio" element={<AppInicioPage />} />
              <Route path="corarios" element={<CorariosPage />} />
              <Route path="himnario" element={<HimnarioPage />} />
              <Route path="academia" element={<AcademiaPage />} />
              <Route path="recursos" element={<RecursosPage />} />
              <Route path="herramientas" element={<HerramientasPage />} />
              <Route path="herramientas/afinador" element={<AfinadorPage />} />
              <Route path="herramientas/piano" element={<PianoPage />} />
              <Route path="herramientas/calentamiento" element={<CalentamientoPage />} />
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
              <Route path="configuracion" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
