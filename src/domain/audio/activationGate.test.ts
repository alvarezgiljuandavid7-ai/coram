import { describe, expect, it } from 'vitest';
import { createActivationGate } from './activationGate';

describe('activation gate', () => {
  it('allows only one pending microphone activation', () => {
    const gate = createActivationGate();

    expect(gate.tryAcquire()).toBe(true);
    expect(gate.tryAcquire()).toBe(false);
    gate.release();
    expect(gate.tryAcquire()).toBe(true);
  });
});
