import { describe, expect, it } from 'vitest';
import { getGreetingForHour, getInspirationForDate } from './homeTemporalContent';

describe('home temporal content', () => {
  it('uses a Spanish greeting appropriate to the local hour', () => {
    expect(getGreetingForHour(8)).toBe('Buenos días');
    expect(getGreetingForHour(14)).toBe('Buenas tardes');
    expect(getGreetingForHour(21)).toBe('Buenas noches');
  });

  it('changes the selected inspiration at noon while keeping it stable within each half-day', () => {
    const morning = new Date(2026, 6, 15, 9, 0, 0);
    const lateMorning = new Date(2026, 6, 15, 11, 59, 0);
    const afternoon = new Date(2026, 6, 15, 12, 0, 0);

    expect(getInspirationForDate(morning)).toEqual(getInspirationForDate(lateMorning));
    expect(getInspirationForDate(afternoon)).not.toEqual(getInspirationForDate(morning));
  });
});
