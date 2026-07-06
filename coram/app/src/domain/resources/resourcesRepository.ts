import { supabase } from '../../shared/supabase/client';
import type { Resource } from '../../types';

interface ResourceRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  is_premium: boolean;
}

const allowedCategories: Resource['category'][] = ['PDF Acordes', 'Guías Prácticas', 'Pistas / Audio', 'Partituras'];

function mapCategory(category: string | null): Resource['category'] {
  return allowedCategories.includes(category as Resource['category'])
    ? (category as Resource['category'])
    : 'Guías Prácticas';
}

function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    category: mapCategory(row.category),
    description: row.description ?? '',
    fileSize: 'Disponible',
    downloadsCount: 0,
    isPremium: row.is_premium,
  };
}

export async function fetchResources(): Promise<Resource[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('resources')
    .select('id, title, description, category, is_premium')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as ResourceRow[]).map(mapResource);
}
