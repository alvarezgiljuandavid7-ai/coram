import { describe, expect, it } from 'vitest';
import { coramColors, coramRadii, coramSpacing } from './index';

describe('@coram/design-tokens', () => {
  it('publishes semantic CorAM colors for web and native adapters', () => {
    expect(coramColors).toMatchObject({
      canvas: '#F8F3E7',
      surface: '#FFFCF5',
      ink: '#082A4A',
      botanical: '#4F8F5B',
      gold: '#C9972B',
      action: '#2563EB',
      success: '#4F8F5B',
    });
  });

  it('uses a compact spacing and radius scale', () => {
    expect(coramSpacing).toEqual({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 });
    expect(coramRadii).toEqual({ sm: 8, md: 14, lg: 20 });
  });
});
