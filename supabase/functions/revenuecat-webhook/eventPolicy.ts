type PaidPlan = 'pro' | 'ministry_starter' | 'ministry_pro';

export type RevenueCatEventStatus = 'active' | 'grace_period' | 'expired' | 'revoked';

export type RevenueCatEvent = {
  id?: unknown;
  type?: unknown;
  app_user_id?: unknown;
  product_id?: unknown;
  entitlement_ids?: unknown;
  expiration_at_ms?: unknown;
  environment?: unknown;
};

export type NormalizedRevenueCatEvent = {
  eventId: string;
  eventType: string;
  userId: string;
  productId: string;
  planId: PaidPlan;
  status: RevenueCatEventStatus;
  expiresAt: string | null;
  environment: 'SANDBOX' | 'PRODUCTION';
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRODUCT_PLANS: Record<string, PaidPlan> = {
  coram_pro_monthly: 'pro',
  coram_pro_yearly: 'pro',
  coram_ministry_starter_monthly: 'ministry_starter',
  coram_ministry_starter_yearly: 'ministry_starter',
  coram_ministry_pro_monthly: 'ministry_pro',
  coram_ministry_pro_yearly: 'ministry_pro',
};

function statusForType(type: string): RevenueCatEventStatus | null {
  if (['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'CANCELLATION'].includes(type)) return 'active';
  if (type === 'BILLING_ISSUE') return 'grace_period';
  if (type === 'EXPIRATION') return 'expired';
  if (type === 'REFUND') return 'revoked';
  return null;
}

export function normalizeRevenueCatEvent(event: RevenueCatEvent): NormalizedRevenueCatEvent | null {
  if (typeof event.id !== 'string' || typeof event.type !== 'string') return null;
  if (typeof event.app_user_id !== 'string' || !UUID.test(event.app_user_id)) return null;
  if (typeof event.product_id !== 'string') return null;
  const planId = PRODUCT_PLANS[event.product_id] ?? null;
  const status = statusForType(event.type);
  if (!planId || !status) return null;
  const environment = event.environment === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX';
  const expiresAt = typeof event.expiration_at_ms === 'number'
    ? new Date(event.expiration_at_ms).toISOString()
    : null;
  return {
    eventId: event.id,
    eventType: event.type,
    userId: event.app_user_id,
    productId: event.product_id,
    planId,
    status,
    expiresAt,
    environment,
  };
}
