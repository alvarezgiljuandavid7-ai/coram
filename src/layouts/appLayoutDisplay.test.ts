import { describe, expect, it } from 'vitest';
import { isImmersiveAppRoute } from './AppLayout';

describe('isImmersiveAppRoute', () => {
  it('keeps every app route in the normal user layout', () => {
    expect(isImmersiveAppRoute('/app')).toBe(false);
    expect(isImmersiveAppRoute('/app/inicio')).toBe(false);
    expect(isImmersiveAppRoute('/app/corarios')).toBe(false);
  });
});
