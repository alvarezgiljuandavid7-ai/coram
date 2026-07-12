import { supabase } from '../../shared/supabase/client';
import type { ReadingPreferences } from '../../types';

interface ReadingPreferencesRow {
  user_id: string;
  font_size: number;
  line_height: number;
  theme: 'light' | 'dark';
  updated_at: string;
}

export const defaultReadingPreferences: Omit<ReadingPreferences, 'userId' | 'updatedAt'> = {
  fontSize: 20,
  lineHeight: 1.7,
  theme: 'light',
};

function mapPreferences(row: ReadingPreferencesRow): ReadingPreferences {
  return {
    userId: row.user_id,
    fontSize: row.font_size,
    lineHeight: Number(row.line_height),
    theme: row.theme,
    updatedAt: row.updated_at,
  };
}

export async function fetchReadingPreferences(userId: string): Promise<ReadingPreferences> {
  if (!supabase) {
    return { userId, ...defaultReadingPreferences, updatedAt: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('user_reading_preferences')
    .select('user_id, font_size, line_height, theme, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return { userId, ...defaultReadingPreferences, updatedAt: new Date().toISOString() };
  }

  return mapPreferences(data as ReadingPreferencesRow);
}

export async function saveReadingPreferences(input: ReadingPreferences): Promise<ReadingPreferences> {
  if (!supabase) return input;

  const { data, error } = await supabase
    .from('user_reading_preferences')
    .upsert(
      {
        user_id: input.userId,
        font_size: input.fontSize,
        line_height: input.lineHeight,
        theme: input.theme,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('user_id, font_size, line_height, theme, updated_at')
    .single();

  if (error) throw error;
  return mapPreferences(data as ReadingPreferencesRow);
}
