import { describe, expect, it } from 'vitest';
import type { DashboardMetric } from '../../types';
import { applyPremiumSubscriberDelta } from './metrics';

const metrics: DashboardMetric = {
  usersCount: 10,
  activeToday: 5,
  premiumSubscribers: 2,
  conversionRate: 20,
  revenueThisMonth: 40,
};

describe('metrics', () => {
  it('increments premium subscriber count and revenue', () => {
    expect(applyPremiumSubscriberDelta(metrics, 1)).toEqual({
      usersCount: 10,
      activeToday: 5,
      premiumSubscribers: 3,
      conversionRate: 30,
      revenueThisMonth: 60,
    });
  });

  it('decrements premium subscriber count and revenue', () => {
    expect(applyPremiumSubscriberDelta(metrics, -1)).toEqual({
      usersCount: 10,
      activeToday: 5,
      premiumSubscribers: 1,
      conversionRate: 10,
      revenueThisMonth: 20,
    });
  });

  it('does not allow premium subscribers below zero', () => {
    expect(applyPremiumSubscriberDelta({ ...metrics, premiumSubscribers: 0, revenueThisMonth: 0 }, -1)).toEqual({
      usersCount: 10,
      activeToday: 5,
      premiumSubscribers: 0,
      conversionRate: 0,
      revenueThisMonth: 0,
    });
  });
});
