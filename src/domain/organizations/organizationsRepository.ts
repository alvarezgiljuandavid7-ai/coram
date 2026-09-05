import { supabase } from '../../shared/supabase/client';

export type OrganizationRole = 'owner' | 'admin' | 'leader' | 'member';

export interface Organization {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  planId: 'free' | 'ministry_starter' | 'ministry_pro';
  status: 'active' | 'archived';
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  instrument: string | null;
  vocalPart: string | null;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export interface OrganizationRepositoryError extends Error {
  code: 'ORGANIZATION_LIMIT' | 'MEMBER_LIMIT' | 'SONG_LIMIT' | 'SERVICE_LIMIT' | 'FORBIDDEN' | 'UNKNOWN';
}

type ClientLike = {
  from: (table: string) => any;
  rpc: (name: string, args?: Record<string, unknown>) => any;
};

const organizationSelect = 'id, owner_user_id, name, slug, plan_id, status, created_at';
const memberSelect = 'id, organization_id, user_id, role, instrument, vocal_part, status, joined_at';

function mapOrganization(row: any): Organization {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    slug: row.slug,
    planId: row.plan_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapMember(row: any): OrganizationMember {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    instrument: row.instrument,
    vocalPart: row.vocal_part,
    status: row.status,
    joinedAt: row.joined_at,
  };
}

export function mapOrganizationError(error: { message?: string; code?: string }): OrganizationRepositoryError {
  const message = error.message ?? 'No fue posible completar la operación.';
  let code: OrganizationRepositoryError['code'] = 'UNKNOWN';
  if (message.includes('organization_limit_reached')) code = 'ORGANIZATION_LIMIT';
  if (message.includes('organization_member_limit_reached')) code = 'MEMBER_LIMIT';
  if (message.includes('personal_song_limit_reached')) code = 'SONG_LIMIT';
  if (message.includes('active_service_limit_reached')) code = 'SERVICE_LIMIT';
  if (error.code === '42501' || message.includes('permission')) code = 'FORBIDDEN';
  return Object.assign(new Error(message), { code });
}

function assertConfigured(client: ClientLike | null): asserts client is ClientLike {
  if (!client) throw Object.assign(new Error('Supabase no está configurado.'), { code: 'UNKNOWN' });
}

export function createOrganizationsRepository(client: ClientLike | null) {
  return {
    async list(): Promise<Organization[]> {
      assertConfigured(client);
      const { data, error } = await client.from('organizations').select(organizationSelect).order('created_at');
      if (error) throw mapOrganizationError(error);
      return (data ?? []).map(mapOrganization);
    },

    async create(input: { name: string; slug: string; ownerUserId: string }): Promise<Organization> {
      assertConfigured(client);
      const { data, error } = await client
        .from('organizations')
        .insert({ name: input.name, slug: input.slug, owner_user_id: input.ownerUserId })
        .select(organizationSelect)
        .single();
      if (error) throw mapOrganizationError(error);
      return mapOrganization(data);
    },

    async update(organizationId: string, input: { name: string; slug: string }): Promise<void> {
      assertConfigured(client);
      const { error } = await client.from('organizations').update(input).eq('id', organizationId);
      if (error) throw mapOrganizationError(error);
    },

    async listMembers(organizationId: string): Promise<OrganizationMember[]> {
      assertConfigured(client);
      const { data, error } = await client
        .from('organization_members')
        .select(memberSelect)
        .eq('organization_id', organizationId)
        .order('joined_at');
      if (error) throw mapOrganizationError(error);
      return (data ?? []).map(mapMember);
    },

    async invite(input: {
      organizationId: string;
      email: string;
      role: Exclude<OrganizationRole, 'owner'>;
      instrument?: string;
      vocalPart?: string;
    }): Promise<{ invitationId: string; token: string }> {
      assertConfigured(client);
      const { data, error } = await client.rpc('create_organization_invitation', {
        p_organization_id: input.organizationId,
        p_email: input.email,
        p_role: input.role,
        p_instrument: input.instrument ?? null,
        p_vocal_part: input.vocalPart ?? null,
      });
      if (error) throw mapOrganizationError(error);
      return { invitationId: data.invitation_id, token: data.token };
    },

    async acceptInvitation(token: string): Promise<string> {
      assertConfigured(client);
      const { data, error } = await client.rpc('accept_organization_invitation', { p_token: token });
      if (error) throw mapOrganizationError(error);
      return String(data);
    },

    async updateMember(
      organizationId: string,
      userId: string,
      input: { role: OrganizationRole; instrument?: string; vocalPart?: string; status?: 'active' | 'inactive' },
    ): Promise<void> {
      assertConfigured(client);
      const { error } = await client
        .from('organization_members')
        .update({
          role: input.role,
          instrument: input.instrument ?? null,
          vocal_part: input.vocalPart ?? null,
          ...(input.status ? { status: input.status } : {}),
        })
        .eq('organization_id', organizationId)
        .eq('user_id', userId);
      if (error) throw mapOrganizationError(error);
    },

    async removeMember(organizationId: string, userId: string): Promise<void> {
      assertConfigured(client);
      const { error } = await client
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);
      if (error) throw mapOrganizationError(error);
    },
  };
}

export const organizationsRepository = createOrganizationsRepository(supabase);
