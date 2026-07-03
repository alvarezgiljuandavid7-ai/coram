import { supabase } from '../../shared/supabase/client';
import type { Campaign } from '../../types';

interface CampaignRow {
  id: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  status: Campaign['status'];
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    sortOrder: row.sort_order,
  };
}

export async function fetchPublishedCampaigns(): Promise<Campaign[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('campaigns')
    .select('id, title, subtitle, body, image_url, cta_label, cta_url, status, starts_at, ends_at, sort_order')
    .eq('status', 'published')
    .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
    .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as CampaignRow[]).map(mapCampaign);
}
