import { describe, expect, it } from 'vitest';
import { createChunkedStorage, type AsyncKeyValueStore } from '../auth/chunkedStorage';
import { resolveAuthRoute } from '../auth/authState';
import { activePlanFromCustomerInfo } from '../billing/billingState';
import { canRequestCoramAd } from '../ads/adPolicy';

function memoryStore(): AsyncKeyValueStore {
  const values = new Map<string, string>();
  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => void values.set(key, value),
    removeItem: async (key) => void values.delete(key),
  };
}

describe('mobile MVP integration', () => {
  it('protects native routes until session restoration completes', () => {
    expect(resolveAuthRoute('loading', true)).toBeNull();
    expect(resolveAuthRoute('signedOut', true)).toBe('/(auth)');
    expect(resolveAuthRoute('signedIn', false)).toBe('/(app)');
  });

  it('removes persisted session state during account switching', async () => {
    const storage = createChunkedStorage(memoryStore(), 8);
    await storage.setItem('supabase.auth.token', 'user-a-session-token');
    await storage.removeItem('supabase.auth.token');
    await expect(storage.getItem('supabase.auth.token')).resolves.toBeNull();
  });

  it('prevents an entitlement from leaking ads after restore or account change', () => {
    const paidPlan = activePlanFromCustomerInfo({ active: { pro: {} } });
    expect(canRequestCoramAd({ plan: paidPlan, enabled: true, consent: true, placement: 'home' })).toBe(false);
    expect(canRequestCoramAd({ plan: 'free', enabled: true, consent: true, placement: 'herramientas' })).toBe(false);
  });
});
