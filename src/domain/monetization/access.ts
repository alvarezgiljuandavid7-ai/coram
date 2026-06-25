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
  void sectionId;
  void settings;
  void profile;
  return false;
}

export function getSectionPrice(sectionId: string, settings: MonetizationToolSetting[]): string {
  void sectionId;
  void settings;
  return 'Gratuito';
}
