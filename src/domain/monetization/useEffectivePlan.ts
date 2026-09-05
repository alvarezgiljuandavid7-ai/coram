import { useEffect, useState } from 'react';
import type { PlanId } from '@coram/shared-domain';
import { useCoramApp } from '../../app/CoramAppContext';
import { supabase } from '../../shared/supabase/client';

const PLAN_IDS: readonly string[] = ['free', 'pro', 'ministry_starter', 'ministry_pro'];

/**
 * Single web source of truth for the active plan.
 * Resolves through the `resolve_effective_entitlement` RPC (server-side
 * strength/expiry rules) instead of reading `user_entitlements` directly,
 * so every consumer shares the same tie-break behavior. Falls back to
 * `free` when Supabase is unconfigured, the user is anonymous, or the RPC fails.
 */
export function useEffectivePlan(): { plan: PlanId; loading: boolean } {
  const { auth } = useCoramApp();
  const userId = auth.user?.id ?? auth.profile?.id ?? null;
  const [plan, setPlan] = useState<PlanId>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !userId) {
      setPlan('free');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    supabase.rpc('resolve_effective_entitlement', { p_user_id: userId }).then(
      ({ data, error }) => {
        if (!active) return;
        if (!error && PLAN_IDS.includes(String(data))) {
          setPlan(data as PlanId);
        }
        setLoading(false);
      },
      () => {
        if (!active) return;
        setPlan('free');
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [userId]);

  return { plan, loading };
}
