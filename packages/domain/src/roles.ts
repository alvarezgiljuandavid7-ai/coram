export const coramRoles = ['admin', 'premium', 'member'] as const;

export type CoramRole = (typeof coramRoles)[number];

export function isCoramRole(value: unknown): value is CoramRole {
  return typeof value === 'string' && coramRoles.includes(value as CoramRole);
}
