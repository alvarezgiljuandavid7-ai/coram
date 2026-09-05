import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PlanId } from '@coram/shared-domain';
import { useEffectivePlan } from '../../domain/monetization/useEffectivePlan';
import { canRenderSponsor } from './sponsorPolicy';
type SponsorContextValue={plan:PlanId;canShow:boolean;sessionHash:string};
const SponsorContext=createContext<SponsorContextValue>({plan:'free',canShow:false,sessionHash:''});
async function sessionHash(){let id=sessionStorage.getItem('coram_sponsor_session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('coram_sponsor_session',id);}const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));return Array.from(new Uint8Array(bytes)).map((value)=>value.toString(16).padStart(2,'0')).join('');}
export const SPONSOR_CONSENT_EVENT = 'coram:consent-changed';

function readConsent(): boolean {
  try {
    return localStorage.getItem('coram_cookie_consent') === 'accepted';
  } catch {
    return false;
  }
}

export function SponsorProvider({ children }: { children: ReactNode }) {
  const { plan } = useEffectivePlan();
  const [hash, setHash] = useState('');
  const [consent, setConsent] = useState(readConsent);

  useEffect(() => {
    sessionHash().then(setHash).catch(() => undefined);
  }, []);

  useEffect(() => {
    const syncConsent = () => setConsent(readConsent());
    window.addEventListener('storage', syncConsent);
    window.addEventListener(SPONSOR_CONSENT_EVENT, syncConsent);
    return () => {
      window.removeEventListener('storage', syncConsent);
      window.removeEventListener(SPONSOR_CONSENT_EVENT, syncConsent);
    };
  }, []);

  const value = useMemo(
    () => ({
      plan,
      sessionHash: hash,
      canShow: canRenderSponsor({
        plan,
        enabled: import.meta.env.VITE_CORAM_ENABLE_SPONSORS === 'true',
        consent,
      }),
    }),
    [hash, plan, consent],
  );
  return <SponsorContext.Provider value={value}>{children}</SponsorContext.Provider>;
}
export const useSponsorContext=()=>useContext(SponsorContext);
