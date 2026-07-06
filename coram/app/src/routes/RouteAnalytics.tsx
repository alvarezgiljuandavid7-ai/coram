import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackAnalyticsEvent } from '../domain/observability/observabilityRepository';

export function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    void trackAnalyticsEvent({ eventName: 'route_view', route: location.pathname });
  }, [location.pathname]);

  return null;
}
