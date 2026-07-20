import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { resolveStrongestPlan, type PlanId } from '@coram/shared-domain';
import { useCoramApp } from '../../app/CoramAppContext';
import { supabase } from '../../shared/supabase/client';
import { canRenderSponsor } from './sponsorPolicy';
type SponsorContextValue={plan:PlanId;canShow:boolean;sessionHash:string};
const SponsorContext=createContext<SponsorContextValue>({plan:'free',canShow:false,sessionHash:''});
async function sessionHash(){let id=sessionStorage.getItem('coram_sponsor_session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('coram_sponsor_session',id);}const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));return Array.from(new Uint8Array(bytes)).map((value)=>value.toString(16).padStart(2,'0')).join('');}
export function SponsorProvider({children}:{children:ReactNode}){const{auth}=useCoramApp();const[plan,setPlan]=useState<PlanId>('free');const[hash,setHash]=useState('');useEffect(()=>{void sessionHash().then(setHash);},[]);useEffect(()=>{if(!supabase||!auth.profile?.id){setPlan('free');return;}supabase.from('user_entitlements').select('plan_id,status,expires_at').eq('user_id',auth.profile.id).in('status',['active','grace_period']).then(({data})=>setPlan(resolveStrongestPlan((data??[]).filter((row)=>!row.expires_at||new Date(row.expires_at)>new Date()).map((row)=>row.plan_id as PlanId))));},[auth.profile?.id]);const value=useMemo(()=>({plan,sessionHash:hash,canShow:canRenderSponsor({plan,enabled:import.meta.env.VITE_CORAM_ENABLE_SPONSORS==='true',consent:localStorage.getItem('coram_cookie_consent')==='accepted'})}),[hash,plan]);return <SponsorContext.Provider value={value}>{children}</SponsorContext.Provider>}
export const useSponsorContext=()=>useContext(SponsorContext);
