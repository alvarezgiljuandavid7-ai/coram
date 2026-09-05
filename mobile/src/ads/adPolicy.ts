import type { PlanId } from '@coram/shared-domain';

export type AdPlacement = 'home' | 'academia' | 'recursos';

export function isAdPlacement(value: string): value is AdPlacement {
  return value === 'home' || value === 'academia' || value === 'recursos';
}

export function canRequestCoramAd(input: {
  plan: PlanId;
  enabled: boolean;
  consent: boolean;
  placement: string;
}): boolean {
  return input.plan === 'free' && input.enabled && input.consent && isAdPlacement(input.placement);
}

export function getAdUnitId(input: { production: boolean; configuredId?: string }): 'TEST_BANNER' | string | null {
  if (!input.production) return 'TEST_BANNER';
  return input.configuredId || null;
}
