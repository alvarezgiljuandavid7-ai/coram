import { AdminDashboard, type AdminDashboardTab } from '../../components/AdminDashboard';
import { useAdminDashboardData } from './useAdminDashboardData';

interface AdminDashboardRouteProps {
  initialTab: AdminDashboardTab;
}

export function AdminDashboardRoute({ initialTab }: AdminDashboardRouteProps) {
  const dashboardData = useAdminDashboardData();
  return <AdminDashboard initialTab={initialTab} {...dashboardData} />;
}
