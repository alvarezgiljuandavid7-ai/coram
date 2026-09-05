import { describe, expect, it } from 'vitest';

import { createOrganizationsRepository, mapOrganizationError } from './organizationsRepository';

type Call = { kind: string; table?: string; values?: unknown; name?: string; args?: unknown };

function createClient(result: { data?: unknown; error?: { message: string; code?: string } | null } = {}) {
  const calls: Call[] = [];
  const response = Promise.resolve({ data: result.data ?? null, error: result.error ?? null });

  const chain = {
    select: (values?: string) => { calls.push({ kind: 'select', values }); return chain; },
    insert: (values: unknown) => { calls.push({ kind: 'insert', values }); return chain; },
    update: (values: unknown) => { calls.push({ kind: 'update', values }); return chain; },
    delete: () => { calls.push({ kind: 'delete' }); return chain; },
    eq: (name: string, values: unknown) => { calls.push({ kind: 'eq', name, values }); return chain; },
    order: (name: string) => { calls.push({ kind: 'order', name }); return chain; },
    single: () => response,
    then: response.then.bind(response),
  };

  return {
    calls,
    client: {
      from(table: string) { calls.push({ kind: 'from', table }); return chain; },
      rpc(name: string, args: unknown) { calls.push({ kind: 'rpc', name, args }); return response; },
    },
  };
}

describe('organizationsRepository', () => {
  it('creates an organization owned by the authenticated user', async () => {
    const { client, calls } = createClient({ data: { id: 'org-1', name: 'CorAM Central', slug: 'coram-central', plan_id: 'free', status: 'active' } });
    const repository = createOrganizationsRepository(client);

    await repository.create({ name: 'CorAM Central', slug: 'coram-central', ownerUserId: 'user-1' });

    expect(calls).toContainEqual({ kind: 'from', table: 'organizations' });
    expect(calls).toContainEqual({
      kind: 'insert',
      values: { name: 'CorAM Central', slug: 'coram-central', owner_user_id: 'user-1' },
    });
  });

  it('creates invitations through the server RPC without storing raw tokens', async () => {
    const { client, calls } = createClient({ data: { token: 'raw-once', invitation_id: 'invite-1' } });
    const repository = createOrganizationsRepository(client);

    const invitation = await repository.invite({
      organizationId: 'org-1', email: 'voz@coram.test', role: 'member', instrument: 'Piano', vocalPart: 'Alto',
    });

    expect(invitation.token).toBe('raw-once');
    expect(calls).toContainEqual({
      kind: 'rpc',
      name: 'create_organization_invitation',
      args: {
        p_organization_id: 'org-1', p_email: 'voz@coram.test', p_role: 'member',
        p_instrument: 'Piano', p_vocal_part: 'Alto',
      },
    });
  });

  it('updates member ministry fields within an explicit organization scope', async () => {
    const { client, calls } = createClient();
    const repository = createOrganizationsRepository(client);

    await repository.updateMember('org-1', 'member-1', { role: 'leader', instrument: 'Guitarra', vocalPart: 'Tenor' });

    expect(calls).toContainEqual({ kind: 'from', table: 'organization_members' });
    expect(calls).toContainEqual({ kind: 'eq', name: 'organization_id', values: 'org-1' });
    expect(calls).toContainEqual({ kind: 'eq', name: 'user_id', values: 'member-1' });
  });
});

describe('mapOrganizationError', () => {
  it('maps hard server limits to stable application codes', () => {
    expect(mapOrganizationError({ message: 'organization_limit_reached' }).code).toBe('ORGANIZATION_LIMIT');
    expect(mapOrganizationError({ message: 'organization_member_limit_reached' }).code).toBe('MEMBER_LIMIT');
    expect(mapOrganizationError({ message: 'personal_song_limit_reached' }).code).toBe('SONG_LIMIT');
    expect(mapOrganizationError({ message: 'active_service_limit_reached' }).code).toBe('SERVICE_LIMIT');
    expect(mapOrganizationError({ message: 'anything else' }).code).toBe('UNKNOWN');
  });
});
