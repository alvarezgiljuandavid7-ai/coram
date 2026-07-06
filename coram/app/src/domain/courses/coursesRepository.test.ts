import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  order: vi.fn(),
}));

vi.mock('../../shared/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: mocks.order,
        })),
      })),
    })),
  },
}));

describe('fetchCourses', () => {
  beforeEach(() => {
    mocks.order.mockReset();
  });

  it('maps incomplete Supabase course rows to renderable course cards', async () => {
    mocks.order.mockResolvedValue({
      data: [
        {
          id: 'course-1',
          title: 'Dirección coral',
          description: null,
          instructor: null,
          image_url: null,
          video_url: null,
          is_premium: false,
        },
      ],
      error: null,
    });

    const { fetchCourses } = await import('./coursesRepository');

    await expect(fetchCourses()).resolves.toEqual([
      expect.objectContaining({
        id: 'course-1',
        instructor: 'CorAM',
        duration: 'Disponible',
        description: 'Contenido formativo disponible próximamente.',
        imageUrl: expect.stringContaining('images.unsplash.com'),
        syllabus: [expect.objectContaining({ title: 'Introducción al curso' })],
      }),
    ]);
  });
});
