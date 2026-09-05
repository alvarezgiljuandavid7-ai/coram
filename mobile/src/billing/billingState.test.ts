import { describe, expect, it } from 'vitest';
import { activePlanFromCustomerInfo, getRevenueCatConfiguration } from './billingState';

describe('mobile billing state', () => {
  it('uses platform-specific public keys only when the feature is enabled', () => {
    expect(getRevenueCatConfiguration({ enabled: false, platform: 'ios', iosKey: 'ios-key' })).toBeNull();
    expect(getRevenueCatConfiguration({ enabled: true, platform: 'ios', iosKey: 'ios-key' })).toEqual({ apiKey: 'ios-key' });
    expect(getRevenueCatConfiguration({ enabled: true, platform: 'android', androidKey: '' })).toBeNull();
  });

  it('derives the strongest plan from active entitlement identifiers', () => {
    expect(activePlanFromCustomerInfo({ active: { pro: {}, ministry_pro: {} } })).toBe('ministry_pro');
    expect(activePlanFromCustomerInfo({ active: {} })).toBe('free');
  });
});
