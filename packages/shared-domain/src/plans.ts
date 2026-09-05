export const planIds = ['free', 'pro', 'ministry_starter', 'ministry_pro'] as const;
export type PlanId = (typeof planIds)[number];

export const entitlementIds = ['pro', 'ministry_starter', 'ministry_pro'] as const;
export type EntitlementId = (typeof entitlementIds)[number];

export const planCapabilities = [
  'ad_free',
  'annotations',
  'assignments',
  'availability',
  'basic_history',
  'full_tools',
  'personal_repertoire_unlimited',
  'priority_support',
  'shared_repertoire',
  'team_permissions',
  'transposition',
] as const;
export type PlanCapability = (typeof planCapabilities)[number];

export interface PlanLimits {
  activeServices: number | null;
  organizations: number | null;
  organizationMembers: number | null;
  personalRepertoires: number | null;
  personalSongs: number | null;
}

export interface PlanDefinition {
  id: PlanId;
  label: string;
  referencePricesCop: { monthly: number; yearly: number };
  capabilities: readonly PlanCapability[];
  limits: PlanLimits;
}

const unlimited = null;

export const CORAM_PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    label: 'Free',
    referencePricesCop: { monthly: 0, yearly: 0 },
    capabilities: [],
    limits: {
      activeServices: 2,
      organizations: 1,
      organizationMembers: 5,
      personalRepertoires: 1,
      personalSongs: 25,
    },
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    referencePricesCop: { monthly: 19_900, yearly: 179_900 },
    capabilities: [
      'ad_free',
      'annotations',
      'basic_history',
      'full_tools',
      'personal_repertoire_unlimited',
      'transposition',
    ],
    limits: {
      activeServices: 2,
      organizations: 1,
      organizationMembers: 5,
      personalRepertoires: unlimited,
      personalSongs: unlimited,
    },
  },
  ministry_starter: {
    id: 'ministry_starter',
    label: 'Ministerio Starter',
    referencePricesCop: { monthly: 59_900, yearly: 599_000 },
    capabilities: ['ad_free', 'assignments', 'availability', 'shared_repertoire'],
    limits: {
      activeServices: unlimited,
      organizations: 1,
      organizationMembers: 15,
      personalRepertoires: 1,
      personalSongs: 25,
    },
  },
  ministry_pro: {
    id: 'ministry_pro',
    label: 'Ministerio Pro',
    referencePricesCop: { monthly: 129_900, yearly: 1_299_000 },
    capabilities: [
      'ad_free',
      'assignments',
      'availability',
      'priority_support',
      'shared_repertoire',
      'team_permissions',
    ],
    limits: {
      activeServices: unlimited,
      organizations: 1,
      organizationMembers: 50,
      personalRepertoires: 1,
      personalSongs: 25,
    },
  },
};

const planStrength: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  ministry_starter: 2,
  ministry_pro: 3,
};

export function getPlanLimits(plan: PlanId): PlanLimits {
  return CORAM_PLANS[plan].limits;
}

export function hasCapability(plan: PlanId, capability: PlanCapability): boolean {
  return CORAM_PLANS[plan].capabilities.includes(capability);
}

export function canShowAds(plan: PlanId): boolean {
  return !hasCapability(plan, 'ad_free');
}

export function getOrganizationMemberLimit(plan: PlanId): number | null {
  return getPlanLimits(plan).organizationMembers;
}

function isBelowLimit(current: number, limit: number | null): boolean {
  return limit === null || current < limit;
}

export function canCreateActiveService(plan: PlanId, currentActiveServices: number): boolean {
  return isBelowLimit(currentActiveServices, getPlanLimits(plan).activeServices);
}

export function canCreatePersonalSong(plan: PlanId, currentPersonalSongs: number): boolean {
  return isBelowLimit(currentPersonalSongs, getPlanLimits(plan).personalSongs);
}

export function canCreateOrganization(plan: PlanId, currentOrganizations: number): boolean {
  return isBelowLimit(currentOrganizations, getPlanLimits(plan).organizations);
}

export function canAddOrganizationMember(plan: PlanId, currentMembers: number): boolean {
  return isBelowLimit(currentMembers, getPlanLimits(plan).organizationMembers);
}

export function canCreatePersonalRepertoire(plan: PlanId, currentPersonalRepertoires: number): boolean {
  return isBelowLimit(currentPersonalRepertoires, getPlanLimits(plan).personalRepertoires);
}

export function resolveStrongestPlan(plans: readonly PlanId[]): PlanId {
  return plans.reduce<PlanId>(
    (strongest, candidate) => (planStrength[candidate] > planStrength[strongest] ? candidate : strongest),
    'free',
  );
}
