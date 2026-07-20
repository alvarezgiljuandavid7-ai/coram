import { describe, expect, it } from 'vitest';
import { assertAllowedAffiliateDestination, isAllowedAffiliateHost } from './redirectPolicy';

describe('affiliate redirect policy', () => {
  it('accepts exact and real subdomains from the stored allowlist', () => {
    expect(isAllowedAffiliateHost('academy.partner.com',['partner.com'])).toBe(true);
    expect(isAllowedAffiliateHost('partner.com',['partner.com'])).toBe(true);
    expect(isAllowedAffiliateHost('partner.com.evil.test',['partner.com'])).toBe(false);
    expect(isAllowedAffiliateHost('evilpartner.com',['partner.com'])).toBe(false);
  });
  it('requires HTTPS and rejects credentials', () => {
    expect(()=>assertAllowedAffiliateDestination('http://partner.com/course',['partner.com'])).toThrow('affiliate_https_required');
    expect(()=>assertAllowedAffiliateDestination('https://user:pass@partner.com/course',['partner.com'])).toThrow('affiliate_credentials_forbidden');
  });
  it('returns a normalized stored destination when valid', () => {
    expect(assertAllowedAffiliateDestination('https://academy.partner.com/course?id=1',['partner.com']).href).toBe('https://academy.partner.com/course?id=1');
  });
});
