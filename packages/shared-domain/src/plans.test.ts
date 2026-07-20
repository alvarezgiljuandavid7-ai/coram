import { describe, expect, it } from 'vitest';
import {
  CORAM_PLANS,
  canCreateActiveService,
  canCreatePersonalSong,
  canShowAds,
  getOrganizationMemberLimit,
  hasCapability,
  resolveStrongestPlan,
} from './plans';

describe('CorAM plans', () => {
  it('keeps commercial reference prices centralized', () => {
    expect(CORAM_PLANS.pro.referencePricesCop).toEqual({ monthly: 19_900, yearly: 179_900 });
    expect(CORAM_PLANS.ministry_starter.referencePricesCop.monthly).toBe(59_900);
    expect(CORAM_PLANS.ministry_pro.referencePricesCop.yearly).toBe(1_299_000);
  });

  it('enforces Free organization and personal repertoire limits', () => {
    expect(getOrganizationMemberLimit('free')).toBe(5);
    expect(canCreateActiveService('free', 1)).toBe(true);
    expect(canCreateActiveService('free', 2)).toBe(false);
    expect(canCreatePersonalSong('free', 24)).toBe(true);
    expect(canCreatePersonalSong('free', 25)).toBe(false);
  });

  it('allows unlimited personal repertoire for Pro', () => {
    expect(canCreatePersonalSong('pro', 50_000)).toBe(true);
    expect(hasCapability('pro', 'personal_repertoire_unlimited')).toBe(true);
  });

  it('applies ministry membership limits and removes ads', () => {
    expect(getOrganizationMemberLimit('ministry_starter')).toBe(15);
    expect(getOrganizationMemberLimit('ministry_pro')).toBe(50);
    expect(canCreateActiveService('ministry_starter', 50_000)).toBe(true);
    expect(canShowAds('free')).toBe(true);
    expect(canShowAds('pro')).toBe(false);
    expect(canShowAds('ministry_starter')).toBe(false);
    expect(canShowAds('ministry_pro')).toBe(false);
  });

  it('resolves the strongest active plan deterministically', () => {
    expect(resolveStrongestPlan(['free', 'pro'])).toBe('pro');
    expect(resolveStrongestPlan(['ministry_starter', 'pro'])).toBe('ministry_starter');
    expect(resolveStrongestPlan(['ministry_pro', 'free'])).toBe('ministry_pro');
    expect(resolveStrongestPlan([])).toBe('free');
  });
});
