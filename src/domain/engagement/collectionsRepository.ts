import { supabase } from '../../shared/supabase/client';
import type { UserCollection, UserCollectionItem } from '../../types';

interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: 'private' | 'shared';
  created_at: string;
  updated_at: string;
  collection_items: CollectionItemRow[] | null;
}

interface CollectionItemRow {
  id: string;
  collection_id: string;
  entity_type: 'corario' | 'hymn';
  entity_id: string;
  sort_order: number;
  created_at: string;
}

function mapItem(row: CollectionItemRow): UserCollectionItem {
  return {
    id: row.id,
    collectionId: row.collection_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapCollection(row: CollectionRow): UserCollection {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.collection_items ?? []).map(mapItem).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export async function fetchCollections(userId: string): Promise<UserCollection[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('collections')
    .select(
      `
      id,
      user_id,
      name,
      description,
      visibility,
      created_at,
      updated_at,
      collection_items (
        id,
        collection_id,
        entity_type,
        entity_id,
        sort_order,
        created_at
      )
    `,
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as CollectionRow[]).map(mapCollection);
}

export async function createCollection(userId: string, name: string, description = ''): Promise<UserCollection> {
  if (!supabase) throw new Error('Supabase no esta configurado.');

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: userId, name, description, visibility: 'private' })
    .select('id, user_id, name, description, visibility, created_at, updated_at, collection_items (*)')
    .single();

  if (error) throw error;
  return mapCollection(data as unknown as CollectionRow);
}

export async function updateCollection(collectionId: string, name: string, description = ''): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('collections')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', collectionId);

  if (error) throw error;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('collections').delete().eq('id', collectionId);
  if (error) throw error;
}

export async function addCollectionItem(
  collection: UserCollection,
  entityType: 'corario' | 'hymn',
  entityId: string,
): Promise<void> {
  if (!supabase) return;

  const nextOrder = collection.items.length
    ? Math.max(...collection.items.map((item) => item.sortOrder)) + 1
    : 0;

  const { error } = await supabase
    .from('collection_items')
    .upsert(
      {
        collection_id: collection.id,
        entity_type: entityType,
        entity_id: entityId,
        sort_order: nextOrder,
      },
      { onConflict: 'collection_id,entity_type,entity_id' },
    );

  if (error) throw error;
}

export async function removeCollectionItem(itemId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('collection_items').delete().eq('id', itemId);
  if (error) throw error;
}

export async function reorderCollectionItems(items: UserCollectionItem[]): Promise<void> {
  if (!supabase) return;

  const updates = items.map((item, index) =>
    supabase.from('collection_items').update({ sort_order: index }).eq('id', item.id),
  );

  const results = await Promise.all(updates);
  const error = results.find((result) => result.error)?.error;
  if (error) throw error;
}
