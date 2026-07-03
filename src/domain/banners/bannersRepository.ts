import { supabase } from '../../shared/supabase/client';
import type { HomeBanner } from '../../types';

interface HomeBannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  placement: string;
  status: HomeBanner['status'];
  sort_order: number;
}

function mapHomeBanner(row: HomeBannerRow): HomeBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    placement: row.placement,
    status: row.status,
    sortOrder: row.sort_order,
  };
}

export async function fetchPublishedHomeBanners(): Promise<HomeBanner[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('home_banners')
    .select('id, title, subtitle, body, image_url, cta_label, cta_url, placement, status, sort_order')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as HomeBannerRow[]).map(mapHomeBanner);
}
