import { describe, expect, it } from 'vitest';
import { canRequestCoramAd, getAdUnitId, isAdPlacement } from './adPolicy';

describe('mobile ad policy', () => {
  it('allows ads only for Free users with consent and the feature enabled', () => {
    expect(canRequestCoramAd({ plan: 'free', enabled: true, consent: true, placement: 'home' })).toBe(true);
    for (const plan of ['pro', 'ministry_starter', 'ministry_pro'] as const) {
      expect(canRequestCoramAd({ plan, enabled: true, consent: true, placement: 'home' })).toBe(false);
    }
    expect(canRequestCoramAd({ plan: 'free', enabled: false, consent: true, placement: 'home' })).toBe(false);
    expect(canRequestCoramAd({ plan: 'free', enabled: true, consent: false, placement: 'home' })).toBe(false);
  });

  it('limits ads to approved, non-sensitive placements', () => {
    for (const placement of ['home', 'academia', 'recursos']) expect(isAdPlacement(placement)).toBe(true);
    for (const placement of ['login', 'plans', 'herramientas', 'servicios', 'ensayo']) expect(isAdPlacement(placement)).toBe(false);
  });

  it('always returns Google test units outside production', () => {
    expect(getAdUnitId({ production: false, configuredId: 'real-id' })).toBe('TEST_BANNER');
    expect(getAdUnitId({ production: true, configuredId: '' })).toBeNull();
  });
});
