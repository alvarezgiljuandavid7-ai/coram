import { describe, expect, it, vi } from 'vitest';
import { buildMediaObjectPath } from './mediaAssets';

describe('buildMediaObjectPath', () => {
  it('creates stable safe storage paths from user filenames', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('11111111-2222-4333-8444-555555555555');

    expect(buildMediaObjectPath('Técnica Vocal Intro 01.MP4', 'video', 'User 123')).toBe(
      'user-123/video/tecnica-vocal-intro-01-11111111-2222-4333-8444-555555555555.MP4',
    );
  });
});
