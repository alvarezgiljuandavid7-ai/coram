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
});
