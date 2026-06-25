import type { CoramPersistedState } from './useCoramAppState';
import type { DashboardMetric, MonetizationToolSetting, UserProfile } from '../types';

export const defaultMonetizationSettings: MonetizationToolSetting[] = [
  { id: 'corarios', name: 'Corarios y Cadenas', isPremium: false, price: 'Gratuito' },
  { id: 'himnarios', name: 'Himnarios Celestiales', isPremium: false, price: 'Gratuito' },
  { id: 'courses', name: 'Cursos y Academia', isPremium: true, price: '$19.99' },
  { id: 'resources', name: 'Recursos / PDF Descargables', isPremium: true, price: '$9.99' },
  { id: 'mentorships', name: 'Mentorias 1-a-1', isPremium: true, price: '$49.99' },
  { id: 'warmups', name: 'Calentamiento Vocal Diario', isPremium: false, price: 'Gratuito' },
  { id: 'tuner_piano', name: 'Afinador y Teclado Piano', isPremium: false, price: 'Gratuito' },
];

const emptyProfile: UserProfile = {
  name: 'Miembro CorAM',
  email: '',
  authProvider: 'Email',
  avatarUrl: '',
  isPremium: false,
  favoriteCorarios: [],
  enrolledCourses: [],
};

const emptyMetrics: DashboardMetric = {
  usersCount: 0,
  activeToday: 0,
  premiumSubscribers: 0,
  conversionRate: 0,
  revenueThisMonth: 0,
};

interface InitialStateOptions {
  useDemoContent: boolean;
}

export function createInitialCoramState({ useDemoContent }: InitialStateOptions): CoramPersistedState {
  return {
    corarios: [],
    courses: [],
    resources: [],
    sponsors: [],
    profile: useDemoContent ? { ...emptyProfile, name: 'Miembro CorAM Demo' } : emptyProfile,
    metrics: emptyMetrics,
    monetizationSettings: defaultMonetizationSettings,
  };
}
