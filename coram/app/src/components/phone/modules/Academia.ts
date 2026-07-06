import { useEffect, useState } from 'react';

export const academiaScreens = ['academy', 'course-detail'] as const;

interface UseAcademiaModuleOptions {
  activeLessonId: string | null;
  isLessonPlaying: boolean;
  playbackSpeed: number;
}

export function useAcademiaModule({ activeLessonId, isLessonPlaying, playbackSpeed }: UseAcademiaModuleOptions) {
  const [lessonProgress, setLessonProgress] = useState<number>(0);

  useEffect(() => {
    if (!activeLessonId) {
      setLessonProgress(0);
      return;
    }

    if (!isLessonPlaying) return;

    const timer = window.setInterval(() => {
      setLessonProgress((current) => {
        const next = current + playbackSpeed;
        if (next >= 210) {
          return 210;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeLessonId, isLessonPlaying, playbackSpeed]);

  return { lessonProgress, setLessonProgress };
}
