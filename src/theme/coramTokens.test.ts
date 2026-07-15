import { describe, expect, it } from 'vitest';
import { coramActionColors } from './coramTokens';

describe('CorAM action palette', () => {
  it('uses blue tokens for primary, hover, active and focus-visible action states', () => {
    expect(coramActionColors).toEqual({
      primary: '#2563EB',
      hover: '#1D4ED8',
      active: '#1E40AF',
      soft: '#EFF6FF',
      focusRing: 'rgba(37, 99, 235, 0.42)',
    });
  });
});
