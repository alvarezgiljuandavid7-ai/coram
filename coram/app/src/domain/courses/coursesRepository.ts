import { supabase } from '../../shared/supabase/client';
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

const DEFAULT_COURSE_IMAGE_URL =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop';

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    title: row.title,
    instructor: row.instructor ?? 'CorAM',
    duration: 'Disponible',
    isPremium: row.is_premium,
    description: row.description || 'Contenido formativo disponible próximamente.',
    rating: 5,
    imageUrl: row.image_url || DEFAULT_COURSE_IMAGE_URL,
    videoUrl: row.video_url ?? undefined,
    syllabus: [{ id: `${row.id}-intro`, title: 'Introducción al curso', duration: 'Disponible', isPreview: true }],
  };
}

export async function fetchCourses(): Promise<Course[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, instructor, image_url, video_url, is_premium')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as CourseRow[]).map(mapCourse);
}
