import { describe, expect, it } from 'vitest';
import {
  buildOrganizationSongOwner,
  buildPersonalSongOwner,
  canCreatePersonalSong,
  canManageMembers,
  canManageRepertoire,
  canShowAds,
  resolveStrongestPlan,
} from '@coram/shared-domain';
import { assertAllowedAffiliateDestination } from '../../../api/affiliate/course/redirectPolicy';
import { canRenderSponsor } from '../../features/sponsors/sponsorPolicy';
import { normalizeRevenueCatEvent } from '../../../supabase/functions/revenuecat-webhook/eventPolicy';

describe('CorAM monetization MVP integration', () => {
  it('keeps private and organization repertoire ownership mutually exclusive', () => {
    expect(buildPersonalSongOwner('user-a')).toEqual({ owner_user_id: 'user-a', organization_id: null });
    expect(buildOrganizationSongOwner('org-a')).toEqual({ owner_user_id: null, organization_id: 'org-a' });
  });

  it('enforces Free limits while preserving unlimited Pro repertoire', () => {
    expect(canCreatePersonalSong('free', 24)).toBe(true);
    expect(canCreatePersonalSong('free', 25)).toBe(false);
    expect(canCreatePersonalSong('pro', 50_000)).toBe(true);
  });

  it('keeps organization permissions role-scoped', () => {
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('leader')).toBe(false);
    expect(canManageRepertoire('leader')).toBe(true);
    expect(canManageRepertoire('member')).toBe(false);
  });

  it('allows only HTTPS affiliate destinations from exact or subdomain allowlists', () => {
    expect(assertAllowedAffiliateDestination('https://course.partner.test/path', ['partner.test']).hostname).toBe('course.partner.test');
    expect(() => assertAllowedAffiliateDestination('https://partner.test.attacker.test', ['partner.test'])).toThrow('affiliate_domain_forbidden');
  });

  it('never renders sponsors or ads to a paid entitlement', () => {
    for (const plan of ['pro', 'ministry_starter', 'ministry_pro'] as const) {
      expect(canShowAds(plan)).toBe(false);
      expect(canRenderSponsor({ plan, enabled: true, consent: true })).toBe(false);
    }
    expect(resolveStrongestPlan(['pro', 'ministry_pro'])).toBe('ministry_pro');
  });

  it('maps expiration to access removal without destructive data operations', () => {
    const event = normalizeRevenueCatEvent({
      id: 'event-expired',
      type: 'EXPIRATION',
      app_user_id: '3317d788-d2b9-4f73-a86f-e21bdc9371a0',
      product_id: 'coram_ministry_starter_monthly',
      environment: 'SANDBOX',
    });
    expect(event).toMatchObject({ planId: 'ministry_starter', status: 'expired' });
  });
});
