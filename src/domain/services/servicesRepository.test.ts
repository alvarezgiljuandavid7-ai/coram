import { describe, expect, it } from 'vitest';
import { createServicesRepository, mapServiceError } from './servicesRepository';

type Call = { kind: string; table?: string; name?: string; values?: unknown; args?: unknown };

function fakeClient(data: unknown = []) {
  const calls: Call[] = [];
  const response = Promise.resolve({ data, error: null });
  const chain = {
    select: (values?: string) => { calls.push({ kind: 'select', values }); return chain; },
    insert: (values: unknown) => { calls.push({ kind: 'insert', values }); return chain; },
    update: (values: unknown) => { calls.push({ kind: 'update', values }); return chain; },
    upsert: (values: unknown) => { calls.push({ kind: 'upsert', values }); return chain; },
    delete: () => { calls.push({ kind: 'delete' }); return chain; },
    eq: (name: string, values: unknown) => { calls.push({ kind: 'eq', name, values }); return chain; },
    in: (name: string, values: unknown) => { calls.push({ kind: 'in', name, values }); return chain; },
    gte: (name: string, values: unknown) => { calls.push({ kind: 'gte', name, values }); return chain; },
    order: (name: string) => { calls.push({ kind: 'order', name }); return chain; },
    single: () => response,
    then: response.then.bind(response),
  };
  return { calls, client: { from(table: string) { calls.push({ kind: 'from', table }); return chain; }, rpc(name: string, args: unknown) { calls.push({ kind: 'rpc', name, args }); return response; } } };
}

describe('servicesRepository', () => {
  it('lists upcoming services inside one explicit organization', async () => {
    const { client, calls } = fakeClient();
    await createServicesRepository(client).listUpcoming('org-1');
    expect(calls).toContainEqual({ kind: 'from', table: 'services' });
    expect(calls).toContainEqual({ kind: 'eq', name: 'organization_id', values: 'org-1' });
    expect(calls).toContainEqual({ kind: 'in', name: 'status', values: ['draft', 'scheduled'] });
  });

  it('creates a service through an authenticated RPC without a creator parameter', async () => {
    const { client, calls } = fakeClient({ id: 'service-1', organization_id: 'org-1', title: 'Domingo', starts_at: '2026-08-01', status: 'scheduled', created_by: 'user-1' });
    await createServicesRepository(client).create({ organizationId: 'org-1', title: 'Domingo', startsAt: '2026-08-01' });
    expect(calls).toContainEqual({ kind: 'rpc', name: 'create_ministry_service', args: { p_organization_id: 'org-1', p_title: 'Domingo', p_starts_at: '2026-08-01', p_description: null, p_location: null, p_status: 'scheduled' } });
  });

  it('responds to an assignment through a user-scoped RPC', async () => {
    const { client, calls } = fakeClient(true);
    await createServicesRepository(client).respondToAssignment('assignment-1', 'confirmed', 'Allí estaré');
    expect(calls).toContainEqual({ kind: 'rpc', name: 'respond_to_service_assignment', args: { p_assignment_id: 'assignment-1', p_status: 'confirmed', p_note: 'Allí estaré' } });
  });

  it('associates ministry songs with the service organization and stable order', async () => {
    const { client, calls } = fakeClient();
    await createServicesRepository(client).replaceSongs('service-1', 'org-1', [{ songId: 'song-a', serviceKey: 'D' }, { songId: 'song-b' }]);
    expect(calls).toContainEqual({ kind: 'delete' });
    expect(calls).toContainEqual({ kind: 'insert', values: [
      { service_id: 'service-1', organization_id: 'org-1', song_id: 'song-a', service_key: 'D', position: 0 },
      { service_id: 'service-1', organization_id: 'org-1', song_id: 'song-b', service_key: null, position: 1 },
    ] });
  });
});

describe('mapServiceError', () => {
  it('maps the server active-service limit', () => {
    expect(mapServiceError({ message: 'active_service_limit_reached' }).code).toBe('ACTIVE_SERVICE_LIMIT');
  });
});
