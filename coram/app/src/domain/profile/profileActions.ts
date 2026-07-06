import type { UserProfile } from '../../types';

export function toggleFavoriteCorario(profile: UserProfile, corarioId: string): UserProfile {
  const favoriteCorarios = profile.favoriteCorarios.includes(corarioId)
    ? profile.favoriteCorarios.filter((id) => id !== corarioId)
    : [...profile.favoriteCorarios, corarioId];

  return { ...profile, favoriteCorarios };
}

export function toggleCourseEnrollment(profile: UserProfile, courseId: string): UserProfile {
  if (profile.enrolledCourses.includes(courseId)) {
    return profile;
  }

  return { ...profile, enrolledCourses: [...profile.enrolledCourses, courseId] };
}

export function setPremiumStatus(profile: UserProfile, isPremium: boolean): UserProfile {
  return { ...profile, isPremium };
}
