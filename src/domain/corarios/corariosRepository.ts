import { supabase } from '../../shared/supabase/client';
import type { Corario } from '../../types';

interface CorarioRow {
  id: string;
  titulo: string;
  categoria: string | null;
  tono: string | null;
  letra: string;
  premium: boolean | null;
  audio_url: string | null;
}

function mapCorario(row: CorarioRow): Corario {
  return {
    id: row.id,
    title: row.titulo,
    category: row.categoria ?? 'Corarios',
    lyrics: row.letra,
    key: row.tono || 'C',
    isPremium: row.premium ?? false,
    audioUrl: row.audio_url,
  };
}

export async function fetchCorarios(): Promise<Corario[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('corarios')
    .select('id, titulo, categoria, tono, letra, premium, audio_url')
    .order('titulo', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as CorarioRow[]).map(mapCorario);
}
