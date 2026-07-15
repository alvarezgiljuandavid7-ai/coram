import { describe, expect, it } from 'vitest';
import { getCorariosHeroSlideIndex } from './corariosHero';

describe('getCorariosHeroSlideIndex', () => {
  it('moves through the available slides and wraps at both ends', () => {
    expect(getCorariosHeroSlideIndex(0, 1, 3)).toBe(1);
    expect(getCorariosHeroSlideIndex(2, 1, 3)).toBe(0);
    expect(getCorariosHeroSlideIndex(0, -1, 3)).toBe(2);
  });
});
