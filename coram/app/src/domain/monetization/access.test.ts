import { describe, expect, it } from 'vitest';
import type { MonetizationToolSetting, UserProfile } from '../../types';
import { getSectionPrice, isSectionLocked } from './access';

const settings: MonetizationToolSetting[] = [
  { id: 'corarios', name: 'Corarios', isPremium: false, price: 'Gratuito' },
  { id: 'courses', name: 'Cursos', isPremium: true, price: '$19.99' },
];

const freeProfile: UserProfile = {
  name: 'Diana',
  email: 'diana@example.com',
  authProvider: 'Email',
  avatarUrl: '',
  isPremium: false,
  favoriteCorarios: [],
  enrolledCourses: [],
};

describe('access', () => {
  it('does not lock free sections for free users', () => {
    expect(isSectionLocked('corarios', settings, freeProfile)).toBe(false);
  });

  it('locks premium sections for free users', () => {
    expect(isSectionLocked('courses', settings, freeProfile)).toBe(true);
  });

  it('unlocks premium sections for premium users', () => {
    expect(isSectionLocked('courses', settings, { ...freeProfile, isPremium: true })).toBe(false);
  });

  it('returns configured section price', () => {
    expect(getSectionPrice('courses', settings)).toBe('$19.99');
  });

  it('uses fallback price for unknown sections', () => {
    expect(getSectionPrice('missing', settings)).toBe('$0.00');
  });
});
