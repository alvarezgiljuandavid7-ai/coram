import { supabase } from '../../shared/supabase/client';
import type { FavoriteEntityType, FavoriteItem } from '../../types';

interface FavoriteRow {
  id: string;
  user_id: string;
  entity_type: FavoriteEntityType;
  entity_id: string;
  created_at: string;
}

function mapFavorite(row: FavoriteRow): FavoriteItem {
  return {
    id: row.id,
    userId: row.user_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    createdAt: row.created_at,
  };
}

export async function fetchFavorites(userId: string): Promise<FavoriteItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('id, user_id, entity_type, entity_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as FavoriteRow[]).map(mapFavorite);
}

export async function addFavorite(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<FavoriteItem> {
  if (!supabase) {
    throw new Error('Supabase no esta configurado.');
  }

  const { data, error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: userId, entity_type: entityType, entity_id: entityId },
      { onConflict: 'user_id,entity_type,entity_id' },
    )
    .select('id, user_id, entity_type, entity_id, created_at')
    .single();

  if (error) throw error;
  return mapFavorite(data as FavoriteRow);
}

export async function removeFavorite(userId: string, entityType: FavoriteEntityType, entityId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) throw error;
}
