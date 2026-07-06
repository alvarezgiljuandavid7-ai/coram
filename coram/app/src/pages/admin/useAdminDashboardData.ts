import { useCoramApp } from '../../app/CoramAppContext';

export function useAdminDashboardData() {
  const { state, monetizationSettings, setMonetizationSettings } = useCoramApp();

  return {
    corarios: state.corarios,
    setCorarios: state.setCorarios,
    courses: state.courses,
    setCourses: state.setCourses,
    resources: state.resources,
    sponsors: state.sponsors,
    setSponsors: state.setSponsors,
    metrics: state.metrics,
    setMetrics: state.setMetrics,
    monetizationSettings,
    setMonetizationSettings,
  };
}
