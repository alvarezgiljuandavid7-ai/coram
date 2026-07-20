export const organizationRoles = ['owner', 'admin', 'leader', 'member'] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export const organizationMemberStatuses = ['invited', 'active', 'suspended', 'left'] as const;
export type OrganizationMemberStatus = (typeof organizationMemberStatuses)[number];

export const assignmentStatuses = ['pending', 'confirmed', 'declined'] as const;
export type AssignmentStatus = (typeof assignmentStatuses)[number];

export function canManageMembers(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageServices(role: OrganizationRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'leader';
}

export function canManageRepertoire(role: OrganizationRole): boolean {
  return canManageServices(role);
}

export function canUpdateAssignment(currentUserId: string, assignmentUserId: string): boolean {
  return currentUserId === assignmentUserId;
}
