import { supabase } from '../../shared/supabase/client';
import type { FeaturedVideo } from '../../types';

interface FeaturedVideoRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration: string | null;
  status: FeaturedVideo['status'];
  is_featured: boolean;
  sort_order: number;
}

function mapFeaturedVideo(row: FeaturedVideoRow): FeaturedVideo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    duration: row.duration,
    status: row.status,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
  };
}

export async function fetchPublishedFeaturedVideos(): Promise<FeaturedVideo[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('featured_videos')
    .select('id, title, description, category, thumbnail_url, video_url, duration, status, is_featured, sort_order')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as FeaturedVideoRow[]).map(mapFeaturedVideo);
}
