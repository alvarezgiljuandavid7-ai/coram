import type { DashboardMetric } from '../../types';

const MONTHLY_PREMIUM_VALUE = 20;

export function applyPremiumSubscriberDelta(metrics: DashboardMetric, delta: 1 | -1): DashboardMetric {
  const premiumSubscribers = Math.max(0, metrics.premiumSubscribers + delta);
  const conversionRate = metrics.usersCount > 0 ? Math.round((premiumSubscribers / metrics.usersCount) * 100) : 0;

  return {
    ...metrics,
    premiumSubscribers,
    conversionRate,
    revenueThisMonth: premiumSubscribers * MONTHLY_PREMIUM_VALUE,
  };
}
