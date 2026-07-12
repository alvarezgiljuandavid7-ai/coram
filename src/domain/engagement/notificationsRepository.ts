import { supabase } from '../../shared/supabase/client';
import type { InternalNotification } from '../../types';

interface NotificationRow {
  id: string;
  title: string;
  body: string | null;
  type: InternalNotification['type'];
  entity_type: string | null;
  entity_id: string | null;
  route: string | null;
  published_at: string | null;
}

function mapNotification(row: NotificationRow): InternalNotification {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    route: row.route,
    publishedAt: row.published_at,
  };
}

export async function fetchInternalNotifications(): Promise<InternalNotification[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('internal_notifications')
    .select('id, title, body, type, entity_type, entity_id, route, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(10);

  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(mapNotification);
}
