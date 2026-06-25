import { describe, expect, it } from 'vitest';
import { createInitialCoramState } from './initialCoramState';

describe('createInitialCoramState', () => {
  it('does not use demo content as production state', () => {
    const state = createInitialCoramState({ useDemoContent: false });

    expect(state.corarios).toEqual([]);
    expect(state.courses).toEqual([]);
    expect(state.resources).toEqual([]);
    expect(state.sponsors).toEqual([]);
    expect(state.metrics).toEqual({
      usersCount: 0,
      activeToday: 0,
      premiumSubscribers: 0,
      conversionRate: 0,
      revenueThisMonth: 0,
    });
  });

  it('starts every app section as free during the public launch', () => {
    const state = createInitialCoramState({ useDemoContent: false });

    expect(state.monetizationSettings.every((setting) => !setting.isPremium)).toBe(true);
    expect(state.monetizationSettings.every((setting) => setting.price === 'Gratuito')).toBe(true);
  });
});
