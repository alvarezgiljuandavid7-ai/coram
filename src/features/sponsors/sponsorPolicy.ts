import type { PlanId } from '@coram/shared-domain';
export type SponsorPlacement='home'|'academia'|'recursos';
export function isSponsorPlacement(value:string):value is SponsorPlacement{return value==='home'||value==='academia'||value==='recursos';}
export function canRenderSponsor(input:{plan:PlanId;enabled:boolean;consent:boolean}){return input.enabled&&input.consent&&input.plan==='free';}
export function getSafeSponsorDestination(value:string):string|null{try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
