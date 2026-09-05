import { describe, expect, it } from 'vitest';
import { canManageMembers, canManageRepertoire, canManageServices, canUpdateAssignment } from './roles';

describe('organization permissions', () => {
  it('restricts membership administration to owner and admin', () => {
    expect(canManageMembers('owner')).toBe(true);
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('leader')).toBe(false);
    expect(canManageMembers('member')).toBe(false);
  });

  it('allows leaders to manage services and ministry repertoire', () => {
    expect(canManageServices('leader')).toBe(true);
    expect(canManageRepertoire('leader')).toBe(true);
    expect(canManageServices('member')).toBe(false);
    expect(canManageRepertoire('member')).toBe(false);
  });

  it('allows a member to update only their own assignment', () => {
    expect(canUpdateAssignment('user-a', 'user-a')).toBe(true);
    expect(canUpdateAssignment('user-a', 'user-b')).toBe(false);
  });
});
