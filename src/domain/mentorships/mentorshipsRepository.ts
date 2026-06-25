import { supabase } from '../../shared/supabase/client';
import type { MentorshipSession } from '../../types';

interface MentorshipRow {
  id: string;
  title: string;
  coach: string | null;
  benefits: string[] | null;
  price: string | null;
  duration: string | null;
  whatsapp_message: string | null;
}

function mapMentorship(row: MentorshipRow): MentorshipSession {
  return {
    id: row.id,
    title: row.title,
    coach: row.coach ?? 'CorAM',
    benefits: row.benefits ?? [],
    price: row.price ?? '',
    duration: row.duration ?? '',
    whatsAppMsg: row.whatsapp_message ?? '',
  };
}

export async function fetchMentorships(): Promise<MentorshipSession[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('mentorships')
    .select('id, title, coach, benefits, price, duration, whatsapp_message')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as MentorshipRow[]).map(mapMentorship);
}
