import { createClient } from 'npm:@supabase/supabase-js@2';
import { normalizeRevenueCatEvent } from './eventPolicy.ts';

function authorized(request: Request, expected: string): boolean {
  const actual = request.headers.get('authorization') ?? '';
  if (actual.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < actual.length; index += 1) {
    mismatch |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_AUTHORIZATION');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }
  if (!authorized(request, webhookSecret)) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let payload: { event?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const event = normalizeRevenueCatEvent((payload.event ?? {}) as Record<string, unknown>);
  if (!event) return Response.json({ error: 'Unsupported or invalid event.' }, { status: 400 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc('process_revenuecat_event', {
    p_event_id: event.eventId,
    p_event_type: event.eventType,
    p_user_id: event.userId,
    p_product_id: event.productId,
    p_plan_id: event.planId,
    p_status: event.status,
    p_expires_at: event.expiresAt,
    p_environment: event.environment,
  });
  if (error) return Response.json({ error: 'Event processing failed.' }, { status: 500 });
  return Response.json({ accepted: true, processed: Boolean(data) });
});
