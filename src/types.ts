import type { ContentStatus as SharedContentStatus } from '@coram/domain';

export type ContentStatus = SharedContentStatus;

export interface Corario {
  id: string;
  title: string;
  category: string;
  lyrics: string;
  key: string; // e.g. "Am", "G", "C"
  author?: string;
  tempo?: number; // BPM
  isPremium?: boolean;
  isPublished?: boolean;
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
  fileUrl?: string;
}

export type FavoriteEntityType = 'corario' | 'hymn' | 'resource' | 'course';
export type RecentEntityType = FavoriteEntityType | 'tool';

export interface FavoriteItem {
  id: string;
  userId: string;
  entityType: FavoriteEntityType;
  entityId: string;
  createdAt: string;
}

export interface RecentActivityItem {
  id: string;
  userId: string;
  entityType: RecentEntityType;
  entityId: string;
  title: string;
  route: string;
  metadata?: Record<string, unknown>;
  lastSeenAt: string;
}

export interface InternalNotification {
  id: string;
  title: string;
  body?: string | null;
  type: 'course' | 'resource' | 'campaign' | 'video' | 'system';
  entityType?: string | null;
  entityId?: string | null;
  route?: string | null;
  publishedAt?: string | null;
}

export interface UserCollectionItem {
  id: string;
  collectionId: string;
  entityType: 'corario' | 'hymn';
  entityId: string;
  sortOrder: number;
  createdAt: string;
}

export interface UserCollection {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'shared';
  createdAt: string;
  updatedAt: string;
  items: UserCollectionItem[];
}

export interface ReadingPreferences {
  userId: string;
  fontSize: number;
  lineHeight: number;
  theme: 'light' | 'dark';
  updatedAt: string;
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

export interface Campaign {
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  status: ContentStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  sortOrder: number;
}

export interface FeaturedVideo {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  duration?: string | null;
  status: ContentStatus;
  isFeatured: boolean;
  sortOrder: number;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  placement: string;
  status: ContentStatus;
  sortOrder: number;
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
