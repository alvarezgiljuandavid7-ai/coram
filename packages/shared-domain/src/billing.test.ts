import { describe, expect, it } from 'vitest';
import {
  CORAM_REVENUECAT,
  planFromRevenueCatEntitlements,
  planFromRevenueCatProduct,
} from './billing';

describe('RevenueCat plan mapping', () => {
  it('uses the approved offering, products, and entitlements', () => {
    expect(CORAM_REVENUECAT.offering).toBe('default');
    expect(CORAM_REVENUECAT.products).toHaveLength(6);
    expect(CORAM_REVENUECAT.entitlements).toEqual(['pro', 'ministry_starter', 'ministry_pro']);
  });

  it('maps store products without trusting display labels', () => {
    expect(planFromRevenueCatProduct('coram_pro_monthly')).toBe('pro');
    expect(planFromRevenueCatProduct('coram_ministry_pro_yearly')).toBe('ministry_pro');
    expect(planFromRevenueCatProduct('unrecognized_product')).toBeNull();
  });

  it('chooses the strongest active entitlement', () => {
    expect(planFromRevenueCatEntitlements(['pro', 'ministry_starter'])).toBe('ministry_starter');
    expect(planFromRevenueCatEntitlements([])).toBe('free');
  });
});
