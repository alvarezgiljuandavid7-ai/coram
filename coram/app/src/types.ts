export interface Corario {
  id: string;
  title: string;
  category: string;
  lyrics: string;
  key: string; // e.g. "Am", "G", "C"
  author?: string;
  tempo?: number; // BPM
  isPremium?: boolean;
  audioUrl?: string | null;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  isPremium: boolean;
  description: string;
  rating: number;
  imageUrl: string;
  syllabus: { id: string; title: string; duration: string; isPreview: boolean }[];
  price?: string;
  offer?: string;
  videoUrl?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: 'PDF Acordes' | 'Guías Prácticas' | 'Pistas / Audio' | 'Partituras';
  description: string;
  fileSize: string;
  downloadsCount: number;
  isPremium: boolean;
}

export interface MentorshipSession {
  id: string;
  title: string;
  coach: string;
  benefits: string[];
  price: string;
  duration: string;
  whatsAppMsg: string;
}

export interface Sponsor {
  id: string;
  name: string;
  category: string;
  logoUrl: string;
  promoText: string;
  websiteUrl?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  sponsorId?: string | null;
  placement: string;
  imageUrl?: string | null;
  targetUrl?: string | null;
  status: 'draft' | 'active' | 'paused' | 'ended';
  viewsCount: number;
  clicksCount: number;
}

export interface AnalyticsEventPayload {
  eventName: string;
  route?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReportPayload {
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  stack?: string;
  route?: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
}

export interface UserProfile {
  name: string;
  email: string;
  authProvider: 'Google' | 'Apple' | 'Email';
  avatarUrl: string;
  isPremium: boolean;
  favoriteCorarios: string[]; // list of Corario IDs
  enrolledCourses: string[]; // list of Course IDs
}

export interface DashboardMetric {
  usersCount: number;
  activeToday: number;
  premiumSubscribers: number;
  conversionRate: number;
  revenueThisMonth: number;
}

export interface MonetizationToolSetting {
  id: string;
  name: string;
  isPremium: boolean;
  price: string;
}
