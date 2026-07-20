import { useEffect, useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { CORAM_PLANS, getPlanLimits, type PlanId } from '@coram/shared-domain';
import { useCoramApp } from '../../app/CoramAppContext';
import { EditorialCard } from '../../components/experience-v2/ExperienceV2';
import { supabase } from '../../shared/supabase/client';

export function CurrentPlanCard() {
  const { auth } = useCoramApp();
  const [plan, setPlan] = useState<PlanId>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !auth.user?.id) {
      setPlan('free');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void supabase.rpc('resolve_effective_entitlement', { p_user_id: auth.user.id }).then(({ data, error }) => {
      if (!active) return;
      if (!error && ['free', 'pro', 'ministry_starter', 'ministry_pro'].includes(String(data))) {
        setPlan(data as PlanId);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [auth.user?.id]);

  const limits = getPlanLimits(plan);
  return (
    <EditorialCard className="p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf3e8] text-[#4a8a55]"><BadgeCheck className="h-5 w-5" /></span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a56b09]">Plan activo</p>
          <h2 className="mt-1 font-serif text-2xl text-[#0B2545]">{loading ? 'Consultando…' : CORAM_PLANS[plan].label}</h2>
          <p className="mt-2 text-sm text-[#596576]">
            {limits.personalSongs === null ? 'Repertorio personal ilimitado' : `${limits.personalSongs} canciones personales`}
            {' · '}{limits.organizationMembers === null ? 'Miembros ilimitados' : `${limits.organizationMembers} miembros por ministerio`}
          </p>
          <p className="mt-3 text-xs text-[#75808e]">Las compras se realizan únicamente desde la app móvil.</p>
        </div>
      </div>
    </EditorialCard>
  );
}
