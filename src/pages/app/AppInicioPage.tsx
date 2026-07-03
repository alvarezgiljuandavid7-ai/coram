import { useCoramApp } from '../../app/CoramAppContext';
import { PremiumScreen } from '../../components/app-premium/PremiumApp';
import {
  FeaturedCampaignCarousel,
  FeaturedCourses,
  FeaturedTools,
  HomeHeroPremium,
  QuickAccessPremium,
  RecentContentStrip,
  RecentResources,
  UserActivitySummary,
  VideoHighlights,
} from './home/HomeSections';

export function AppInicioPage() {
  const { state, hymns } = useCoramApp();
  const { corarios, courses, resources, profile } = state;
  const favoritesCount = corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id)).length;
  const displayName = profile.name?.trim() || profile.email?.split('@')[0] || 'ministro';

  return (
    <PremiumScreen>
      <HomeHeroPremium displayName={displayName} />
      <FeaturedCampaignCarousel />
      <VideoHighlights />
      <QuickAccessPremium />
      <FeaturedTools />
      <FeaturedCourses courses={courses} />
      <RecentResources resources={resources} />
      <RecentContentStrip corarios={corarios} hymns={hymns} courses={courses} />
      <UserActivitySummary profile={profile} favoritesCount={favoritesCount} hymns={hymns} />
    </PremiumScreen>
  );
}
