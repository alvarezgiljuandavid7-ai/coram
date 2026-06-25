import { describe, expect, it } from 'vitest';
import { isImmersiveAppRoute } from './AppLayout';

describe('isImmersiveAppRoute', () => {
  it('uses the immersive mobile experience only on the app root', () => {
    expect(isImmersiveAppRoute('/app')).toBe(true);
    expect(isImmersiveAppRoute('/app/inicio')).toBe(false);
    expect(isImmersiveAppRoute('/app/corarios')).toBe(false);
  });
});
