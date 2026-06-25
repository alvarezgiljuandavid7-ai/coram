import { useEffect, useState } from 'react';
import type { AdminDashboardTab } from '../AdminDashboard';

export function useAdminDashboardTabs(initialTab: AdminDashboardTab) {
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return { activeTab, setActiveTab };
}
