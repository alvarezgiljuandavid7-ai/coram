import { describe, expect, it } from 'vitest';
import type { UserProfile } from '../../types';
import { setPremiumStatus, toggleCourseEnrollment, toggleFavoriteCorario } from './profileActions';

const baseProfile: UserProfile = {
  name: 'Diana Ortega',
  email: 'diana@example.com',
  authProvider: 'Email',
  avatarUrl: '',
  isPremium: false,
  favoriteCorarios: [],
  enrolledCourses: [],
};

describe('profileActions', () => {
  it('adds a favorite corario when missing', () => {
    const next = toggleFavoriteCorario(baseProfile, 'cor-1');

    expect(next.favoriteCorarios).toEqual(['cor-1']);
    expect(baseProfile.favoriteCorarios).toEqual([]);
  });

  it('removes a favorite corario when present', () => {
    const next = toggleFavoriteCorario({ ...baseProfile, favoriteCorarios: ['cor-1'] }, 'cor-1');

    expect(next.favoriteCorarios).toEqual([]);
  });

  it('enrolls a user in a course when missing', () => {
    const next = toggleCourseEnrollment(baseProfile, 'course-1');

    expect(next.enrolledCourses).toEqual(['course-1']);
  });

  it('does not duplicate an enrolled course', () => {
    const next = toggleCourseEnrollment({ ...baseProfile, enrolledCourses: ['course-1'] }, 'course-1');

    expect(next.enrolledCourses).toEqual(['course-1']);
  });

  it('sets premium status without mutating the profile', () => {
    const next = setPremiumStatus(baseProfile, true);

    expect(next.isPremium).toBe(true);
    expect(baseProfile.isPremium).toBe(false);
  });
});
