import { describe, expect, it } from 'vitest';
import { normalizeRevenueCatEvent } from './eventPolicy';

const base = {
  id: 'event-1',
  app_user_id: '3317d788-d2b9-4f73-a86f-e21bdc9371a0',
  product_id: 'coram_pro_monthly',
  entitlement_ids: ['pro'],
  expiration_at_ms: 2_000_000_000_000,
  environment: 'SANDBOX',
};

describe('RevenueCat webhook policy', () => {
  it('normalizes active and grace-period lifecycle events', () => {
    expect(normalizeRevenueCatEvent({ ...base, type: 'INITIAL_PURCHASE' })?.status).toBe('active');
    expect(normalizeRevenueCatEvent({ ...base, type: 'BILLING_ISSUE' })?.status).toBe('grace_period');
  });

  it('expires access without deleting ministry data', () => {
    expect(normalizeRevenueCatEvent({ ...base, type: 'EXPIRATION' })?.status).toBe('expired');
  });

  it('rejects unknown products and invalid app user IDs', () => {
    expect(normalizeRevenueCatEvent({ ...base, product_id: 'fake', type: 'RENEWAL' })).toBeNull();
    expect(normalizeRevenueCatEvent({ ...base, app_user_id: 'email@example.com', type: 'RENEWAL' })).toBeNull();
  });
});
