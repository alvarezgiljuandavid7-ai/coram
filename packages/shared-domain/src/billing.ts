import { resolveStrongestPlan, type EntitlementId, type PlanId } from './plans';

export const CORAM_REVENUECAT = {
  offering: 'default',
  entitlements: ['pro', 'ministry_starter', 'ministry_pro'] as const,
  products: [
    'coram_pro_monthly',
    'coram_pro_yearly',
    'coram_ministry_starter_monthly',
    'coram_ministry_starter_yearly',
    'coram_ministry_pro_monthly',
    'coram_ministry_pro_yearly',
  ] as const,
};

const productPlans: Record<(typeof CORAM_REVENUECAT.products)[number], Exclude<PlanId, 'free'>> = {
  coram_pro_monthly: 'pro',
  coram_pro_yearly: 'pro',
  coram_ministry_starter_monthly: 'ministry_starter',
  coram_ministry_starter_yearly: 'ministry_starter',
  coram_ministry_pro_monthly: 'ministry_pro',
  coram_ministry_pro_yearly: 'ministry_pro',
};

export function planFromRevenueCatProduct(productId: string): Exclude<PlanId, 'free'> | null {
  return productPlans[productId as keyof typeof productPlans] ?? null;
}

export function planFromRevenueCatEntitlements(entitlements: readonly string[]): PlanId {
  const recognized = entitlements.filter((value): value is EntitlementId =>
    CORAM_REVENUECAT.entitlements.includes(value as EntitlementId),
  );
  return resolveStrongestPlan(recognized);
}
