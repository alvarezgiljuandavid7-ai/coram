import { describe, expect, it } from 'vitest';
import { canRenderSponsor, getSafeSponsorDestination, isSponsorPlacement } from './sponsorPolicy';
describe('sponsor policy',()=>{
  it('shows sponsorships only to Free users when enabled and consented',()=>{expect(canRenderSponsor({plan:'free',enabled:true,consent:true})).toBe(true);for(const plan of ['pro','ministry_starter','ministry_pro'] as const)expect(canRenderSponsor({plan,enabled:true,consent:true})).toBe(false);expect(canRenderSponsor({plan:'free',enabled:false,consent:true})).toBe(false);expect(canRenderSponsor({plan:'free',enabled:true,consent:false})).toBe(false);});
  it('allows only approved editorial placements',()=>{expect(isSponsorPlacement('home')).toBe(true);expect(isSponsorPlacement('academia')).toBe(true);expect(isSponsorPlacement('recursos')).toBe(true);expect(isSponsorPlacement('login')).toBe(false);expect(isSponsorPlacement('herramientas')).toBe(false);});
  it('rejects non-HTTPS sponsored destinations',()=>{expect(getSafeSponsorDestination('https://partner.test/campaign')).toBe('https://partner.test/campaign');expect(getSafeSponsorDestination('javascript:alert(1)')).toBeNull();expect(getSafeSponsorDestination('http://partner.test')).toBeNull();});
});
