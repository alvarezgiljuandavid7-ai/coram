import { supabase } from '../../shared/supabase/client';

export type ServiceStatus = 'draft' | 'scheduled' | 'completed' | 'cancelled';
export type ConfirmationStatus = 'pending' | 'confirmed' | 'declined';

export interface MinistryService {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  startsAt: string;
  location: string | null;
  status: ServiceStatus;
  createdBy: string;
}

export interface ServiceAssignment {
  id: string;
  serviceId: string;
  organizationId: string;
  userId: string;
  assignmentRole: string;
  instrument: string | null;
  vocalPart: string | null;
  confirmationStatus: ConfirmationStatus;
  responseNote: string | null;
}

type ClientLike = { from: (table: string) => any; rpc: (name: string, args?: Record<string, unknown>) => any };

export interface ServiceRepositoryError extends Error {
  code: 'ACTIVE_SERVICE_LIMIT' | 'FORBIDDEN' | 'UNKNOWN';
}

export function mapServiceError(error: { message?: string; code?: string }): ServiceRepositoryError {
  const message = error.message ?? 'No fue posible completar la operación.';
  let code: ServiceRepositoryError['code'] = 'UNKNOWN';
  if (message.includes('active_service_limit_reached')) code = 'ACTIVE_SERVICE_LIMIT';
  if (error.code === '42501' || message.includes('forbidden')) code = 'FORBIDDEN';
  return Object.assign(new Error(message), { code });
}

function requireClient(client: ClientLike | null): asserts client is ClientLike {
  if (!client) throw mapServiceError({ message: 'Supabase no está configurado.' });
}

const serviceSelect = 'id, organization_id, title, description, starts_at, location, status, created_by';
const assignmentSelect = 'id, service_id, organization_id, user_id, assignment_role, instrument, vocal_part, confirmation_status, response_note';

function mapService(row: any): MinistryService {
  return { id: row.id, organizationId: row.organization_id, title: row.title, description: row.description, startsAt: row.starts_at, location: row.location, status: row.status, createdBy: row.created_by };
}

function mapAssignment(row: any): ServiceAssignment {
  return { id: row.id, serviceId: row.service_id, organizationId: row.organization_id, userId: row.user_id, assignmentRole: row.assignment_role, instrument: row.instrument, vocalPart: row.vocal_part, confirmationStatus: row.confirmation_status, responseNote: row.response_note };
}

export function createServicesRepository(client: ClientLike | null) {
  return {
    async listUpcoming(organizationId: string): Promise<MinistryService[]> {
      requireClient(client);
      const { data, error } = await client.from('services').select(serviceSelect)
        .eq('organization_id', organizationId).in('status', ['draft', 'scheduled'])
        .gte('starts_at', new Date().toISOString()).order('starts_at');
      if (error) throw mapServiceError(error);
      return (data ?? []).map(mapService);
    },

    async get(serviceId: string, organizationId: string): Promise<MinistryService> {
      requireClient(client);
      const { data, error } = await client.from('services').select(serviceSelect)
        .eq('id', serviceId).eq('organization_id', organizationId).single();
      if (error) throw mapServiceError(error);
      return mapService(data);
    },

    async create(input: { organizationId: string; title: string; startsAt: string; description?: string; location?: string; status?: ServiceStatus }): Promise<MinistryService> {
      requireClient(client);
      const { data, error } = await client.rpc('create_ministry_service', {
        p_organization_id: input.organizationId,
        p_title: input.title,
        p_starts_at: input.startsAt,
        p_description: input.description ?? null,
        p_location: input.location ?? null,
        p_status: input.status ?? 'scheduled',
      });
      if (error) throw mapServiceError(error);
      return mapService(data);
    },

    async update(serviceId: string, organizationId: string, input: Partial<Pick<MinistryService, 'title' | 'description' | 'startsAt' | 'location' | 'status'>>): Promise<void> {
      requireClient(client);
      const values = {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.startsAt !== undefined ? { starts_at: input.startsAt } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      };
      const { error } = await client.from('services').update(values).eq('id', serviceId).eq('organization_id', organizationId);
      if (error) throw mapServiceError(error);
    },

    async cancel(serviceId: string, organizationId: string): Promise<void> {
      await this.update(serviceId, organizationId, { status: 'cancelled' });
    },

    async listAssignments(serviceId: string, organizationId: string): Promise<ServiceAssignment[]> {
      requireClient(client);
      const { data, error } = await client.from('service_assignments').select(assignmentSelect)
        .eq('service_id', serviceId).eq('organization_id', organizationId).order('created_at');
      if (error) throw mapServiceError(error);
      return (data ?? []).map(mapAssignment);
    },

    async assign(input: { serviceId: string; organizationId: string; userId: string; assignmentRole: string; instrument?: string; vocalPart?: string }): Promise<void> {
      requireClient(client);
      const { error } = await client.from('service_assignments').upsert({
        service_id: input.serviceId, organization_id: input.organizationId, user_id: input.userId,
        assignment_role: input.assignmentRole, instrument: input.instrument ?? null, vocal_part: input.vocalPart ?? null,
      });
      if (error) throw mapServiceError(error);
    },

    async respondToAssignment(assignmentId: string, status: Exclude<ConfirmationStatus, 'pending'>, note = ''): Promise<void> {
      requireClient(client);
      const { error } = await client.rpc('respond_to_service_assignment', { p_assignment_id: assignmentId, p_status: status, p_note: note || null });
      if (error) throw mapServiceError(error);
    },

    async replaceSongs(serviceId: string, organizationId: string, songs: Array<{ songId: string; serviceKey?: string }>): Promise<void> {
      requireClient(client);
      const { error: deleteError } = await client.from('service_songs').delete().eq('service_id', serviceId).eq('organization_id', organizationId);
      if (deleteError) throw mapServiceError(deleteError);
      if (!songs.length) return;
      const { error } = await client.from('service_songs').insert(songs.map((song, position) => ({
        service_id: serviceId, organization_id: organizationId, song_id: song.songId,
        service_key: song.serviceKey ?? null, position,
      })));
      if (error) throw mapServiceError(error);
    },
  };
}

export const servicesRepository = createServicesRepository(supabase);
