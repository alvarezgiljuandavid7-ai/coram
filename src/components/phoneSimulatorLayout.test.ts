import { describe, expect, it } from 'vitest';
import { getPhoneSimulatorLayout } from './PhoneSimulator';

describe('getPhoneSimulatorLayout', () => {
  it('removes the drawn device frame in immersive mode', () => {
    const layout = getPhoneSimulatorLayout(true);

    expect(layout.rootClassName).toContain('h-[100dvh]');
    expect(layout.rootClassName).not.toContain('max-w-[370px]');
    expect(layout.rootClassName).not.toContain('rounded-[48px]');
    expect(layout.showDeviceChrome).toBe(false);
    expect(layout.screenClassName).not.toContain('rounded-[36px]');
  });

  it('keeps the drawn device frame for desktop previews', () => {
    const layout = getPhoneSimulatorLayout(false);

    expect(layout.rootClassName).toContain('max-w-[370px]');
    expect(layout.rootClassName).toContain('rounded-[48px]');
    expect(layout.showDeviceChrome).toBe(true);
  });
});
