import { supabase } from '../../shared/supabase/client';

export type FeedMediaType = 'image' | 'video';

export interface FeedPost {
  id: string;
  title: string;
  body: string | null;
  mediaUrl: string | null;
  mediaType: FeedMediaType;
  ctaLabel: string | null;
  ctaUrl: string | null;
  authorName: string;
  publishedAt: string;
}

interface FeedPostRow {
  id: string;
  title: string;
  body: string | null;
  media_url: string | null;
  media_type: FeedMediaType;
  cta_label: string | null;
  cta_url: string | null;
  author_name: string;
  published_at: string;
}

export async function listPublishedFeedPosts(): Promise<FeedPost[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('feed_posts')
    .select('id, title, body, media_url, media_type, cta_label, cta_url, author_name, published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('sort_order')
    .order('published_at', { ascending: false });

  if (error) throw error;

  return (data as FeedPostRow[]).map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    mediaUrl: post.media_url,
    mediaType: post.media_type,
    ctaLabel: post.cta_label,
    ctaUrl: post.cta_url,
    authorName: post.author_name,
    publishedAt: post.published_at,
  }));
}

export function getFeedPostHref(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return value;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
