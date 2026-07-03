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
  const { advertisements, campaigns, corarios, courses, featuredVideos, homeBanners, resources, profile } = state;
  const favoritesCount = corarios.filter((corario) => profile.favoriteCorarios.includes(corario.id)).length;
  const displayName = profile.name?.trim() || profile.email?.split('@')[0] || 'ministro';

  return (
    <PremiumScreen>
      <HomeHeroPremium displayName={displayName} banners={homeBanners} />
      <FeaturedCampaignCarousel campaigns={campaigns} advertisements={advertisements} />
      <VideoHighlights videos={featuredVideos} />
      <QuickAccessPremium />
      <FeaturedTools />
      <FeaturedCourses courses={courses} />
      <RecentResources resources={resources} />
      <RecentContentStrip corarios={corarios} hymns={hymns} courses={courses} />
      <UserActivitySummary profile={profile} favoritesCount={favoritesCount} hymns={hymns} />
    </PremiumScreen>
  );
}
