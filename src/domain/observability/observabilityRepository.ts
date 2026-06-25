import { supabase } from '../../shared/supabase/client';
import type { AnalyticsEventPayload, ErrorReportPayload } from '../../types';

function sessionId() {
  const key = 'coram_session_id';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(key, next);
  return next;
}

export async function trackAnalyticsEvent(payload: AnalyticsEventPayload) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  await supabase.from('analytics_events').insert({
    user_id: data.user?.id ?? null,
    session_id: sessionId(),
    event_name: payload.eventName,
    route: payload.route ?? window.location.pathname,
    metadata: payload.metadata ?? {},
  });
}

export async function reportError(payload: ErrorReportPayload) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  await supabase.from('error_reports').insert({
    user_id: data.user?.id ?? null,
    severity: payload.severity,
    message: payload.message,
    stack: payload.stack,
    route: payload.route ?? window.location.pathname,
    component_stack: payload.componentStack,
    metadata: payload.metadata ?? {},
  });
}

export async function auditAdminAction(action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  await supabase.from('admin_audit_logs').insert({
    actor_id: data.user?.id ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata ?? {},
  });
}

export async function logAdminAccess(route: string, granted: boolean, metadata?: Record<string, unknown>) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  await supabase.from('admin_access_logs').insert({
    actor_id: data.user?.id ?? null,
    route,
    granted,
    metadata: metadata ?? {},
  });
}
