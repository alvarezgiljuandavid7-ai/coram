import type { CoramAuthProfile } from './authRepository';
import type { UserProfile } from '../../types';

interface LoginRedirectState {
  loading: boolean;
  hasUser: boolean;
  recoveryMode: boolean;
}

export function preserveAccountState(
  previousProfileId: string | null,
  nextProfileId: string,
  currentProfile: UserProfile,
): Pick<UserProfile, 'favoriteCorarios' | 'enrolledCourses'> | undefined {
  if (previousProfileId !== nextProfileId) return undefined;

  return {
    favoriteCorarios: currentProfile.favoriteCorarios,
    enrolledCourses: currentProfile.enrolledCourses,
  };
}

export function shouldRedirectFromLogin({ loading, hasUser, recoveryMode }: LoginRedirectState) {
  return !loading && hasUser && !recoveryMode;
}

export function mapAuthenticatedProfile(
  profile: Pick<CoramAuthProfile, 'email' | 'fullName' | 'avatarUrl' | 'authProvider' | 'role' | 'isPremium'>,
  accountState?: Pick<UserProfile, 'favoriteCorarios' | 'enrolledCourses'>,
): UserProfile {
  return {
    name: profile.fullName || profile.email,
    email: profile.email,
    avatarUrl: profile.avatarUrl || '',
    authProvider: profile.authProvider === 'google' ? 'Google' : profile.authProvider === 'apple' ? 'Apple' : 'Email',
    isPremium: profile.role === 'premium' || profile.isPremium,
    favoriteCorarios: accountState?.favoriteCorarios ?? [],
    enrolledCourses: accountState?.enrolledCourses ?? [],
  };
}

export function createAnonymousProfile(): UserProfile {
  return {
    name: 'Miembro CorAM',
    email: '',
    avatarUrl: '',
    authProvider: 'Email',
    isPremium: false,
    favoriteCorarios: [],
    enrolledCourses: [],
  };
}
