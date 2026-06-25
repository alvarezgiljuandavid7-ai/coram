import type { AdminDashboardTab } from '../../components/AdminDashboard';
import { AdminDashboardRoute } from './AdminDashboardRoute';

interface AdminHomePageProps {
  initialTab?: AdminDashboardTab;
}

export function AdminHomePage({ initialTab = 'overview' }: AdminHomePageProps) {
  return <AdminDashboardRoute initialTab={initialTab} />;
}
