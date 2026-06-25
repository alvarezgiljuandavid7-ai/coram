import { supabase } from '../../shared/supabase/client';
import type { Advertisement, Sponsor } from '../../types';

interface SponsorRow {
  id: string;
  name: string;
  category: string | null;
  logo_url: string | null;
  promo_text: string | null;
  website_url: string | null;
}

interface AdvertisementRow {
  id: string;
  title: string;
  sponsor_id: string | null;
  placement: string;
  image_url: string | null;
  target_url: string | null;
  status: Advertisement['status'];
  views_count: number;
  clicks_count: number;
}

function mapSponsor(row: SponsorRow): Sponsor {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'Ministerio',
    logoUrl: row.logo_url ?? '',
    promoText: row.promo_text ?? '',
    websiteUrl: row.website_url ?? undefined,
  };
}

function mapAdvertisement(row: AdvertisementRow): Advertisement {
  return {
    id: row.id,
    title: row.title,
    sponsorId: row.sponsor_id,
    placement: row.placement,
    imageUrl: row.image_url,
    targetUrl: row.target_url,
    status: row.status,
    viewsCount: row.views_count,
    clicksCount: row.clicks_count,
  };
}

export async function fetchSponsors(): Promise<Sponsor[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('sponsors')
    .select('id, name, category, logo_url, promo_text, website_url')
    .eq('is_published', true)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as SponsorRow[]).map(mapSponsor);
}

export async function fetchAdvertisements(): Promise<Advertisement[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('advertisements')
    .select('id, title, sponsor_id, placement, image_url, target_url, status, views_count, clicks_count')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as AdvertisementRow[]).map(mapAdvertisement);
}
