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

  it('keeps previously premium sections unlocked during the free launch', () => {
    expect(isSectionLocked('courses', settings, freeProfile)).toBe(false);
  });

  it('keeps sections unlocked for every user role', () => {
    expect(isSectionLocked('courses', settings, { ...freeProfile, isPremium: true })).toBe(false);
  });

  it('returns free pricing during the launch period', () => {
    expect(getSectionPrice('courses', settings)).toBe('Gratuito');
  });

  it('uses fallback price for unknown sections', () => {
    expect(getSectionPrice('missing', settings)).toBe('Gratuito');
  });
});
