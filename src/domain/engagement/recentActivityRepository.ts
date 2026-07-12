import { supabase } from '../../shared/supabase/client';
import type { RecentActivityItem, RecentEntityType } from '../../types';

interface RecentActivityRow {
  id: string;
  user_id: string;
  entity_type: RecentEntityType;
  entity_id: string;
  title: string;
  route: string;
  metadata: Record<string, unknown> | null;
  last_seen_at: string;
}

export interface RecordRecentActivityInput {
  userId: string;
  entityType: RecentEntityType;
  entityId: string;
  title: string;
  route: string;
  metadata?: Record<string, unknown>;
}

function mapRecent(row: RecentActivityRow): RecentActivityItem {
  return {
    id: row.id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    title: row.title,
    route: row.route,
    metadata: row.metadata ?? undefined,
    lastSeenAt: row.last_seen_at,
  };
}

export async function fetchRecentActivity(userId: string): Promise<RecentActivityItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('recent_activity')
    .select('id, user_id, entity_type, entity_id, title, route, metadata, last_seen_at')
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return ((data ?? []) as RecentActivityRow[]).map(mapRecent);
}

export async function recordRecentActivity(input: RecordRecentActivityInput): Promise<RecentActivityItem> {
  if (!supabase) {
    throw new Error('Supabase no esta configurado.');
  }

  const { data, error } = await supabase
    .from('recent_activity')
    .upsert(
      {
        user_id: input.userId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        title: input.title,
        route: input.route,
        metadata: input.metadata ?? {},
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,entity_type,entity_id' },
    )
    .select('id, user_id, entity_type, entity_id, title, route, metadata, last_seen_at')
    .single();

  if (error) throw error;
  return mapRecent(data as RecentActivityRow);
}
