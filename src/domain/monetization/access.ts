import type { MonetizationToolSetting, UserProfile } from '../../types';

export function findSectionSetting(
  sectionId: string,
  settings: MonetizationToolSetting[],
): MonetizationToolSetting | undefined {
  return settings.find((setting) => setting.id === sectionId);
}

export function isSectionLocked(
  sectionId: string,
  settings: MonetizationToolSetting[],
  profile: UserProfile,
): boolean {
  const setting = findSectionSetting(sectionId, settings);
  return Boolean(setting?.isPremium && !profile.isPremium);
}

export function getSectionPrice(sectionId: string, settings: MonetizationToolSetting[]): string {
  return findSectionSetting(sectionId, settings)?.price ?? '$0.00';
}
