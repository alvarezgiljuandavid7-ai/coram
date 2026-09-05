import { planFromRevenueCatEntitlements, type PlanId } from '@coram/shared-domain';

export function getRevenueCatConfiguration(input: {
  enabled: boolean;
  platform: 'ios' | 'android' | string;
  iosKey?: string;
  androidKey?: string;
}): { apiKey: string } | null {
  if (!input.enabled) return null;
  const apiKey = input.platform === 'ios' ? input.iosKey : input.platform === 'android' ? input.androidKey : undefined;
  return apiKey ? { apiKey } : null;
}

export function activePlanFromCustomerInfo(entitlements: { active: Record<string, unknown> }): PlanId {
  return planFromRevenueCatEntitlements(Object.keys(entitlements.active));
}
