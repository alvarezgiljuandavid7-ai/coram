import { supabase } from '../../shared/supabase/client';
import { getRenderableMediaUrl } from '../media/mediaAssets';
import type { Course } from '../../types';

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  instructor: string | null;
  image_url: string | null;
  video_url: string | null;
  is_premium: boolean;
}

async function mapCourse(row: CourseRow): Promise<Course> {
  return {
    id: row.id,
    title: row.title,
    instructor: row.instructor ?? 'CorAM',
    duration: 'Disponible',
    isPremium: row.is_premium,
    description: row.description ?? '',
    rating: 5,
    imageUrl: (await getRenderableMediaUrl(row.image_url)) ?? '',
    videoUrl: await getRenderableMediaUrl(row.video_url),
    syllabus: [],
  };
}

export async function fetchCourses(): Promise<Course[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, instructor, image_url, video_url, is_premium')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Promise.all(((data ?? []) as CourseRow[]).map(mapCourse));
}
