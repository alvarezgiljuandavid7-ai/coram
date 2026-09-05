import { describe, expect, it } from 'vitest';
import { assertAffiliateUrlShape, assertAllowedAffiliateDestination, isAllowedAffiliateHost } from './redirectPolicy';

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
  it('rejects non-standard ports and non-HTTPS destinations', () => {
    expect(()=>assertAllowedAffiliateDestination('https://partner.com:8443/course',['partner.com'])).toThrow('affiliate_port_forbidden');
    expect(assertAllowedAffiliateDestination('https://partner.com:443/course',['partner.com']).href).toBe('https://partner.com/course');
    expect(()=>assertAllowedAffiliateDestination('https://user@partner.com/course',['partner.com'])).toThrow('affiliate_credentials_forbidden');
  });
  it('normalizes host casing and trailing dots before matching', () => {
    expect(assertAllowedAffiliateDestination('https://ACADEMY.PARTNER.COM/course',['partner.com']).hostname).toBe('academy.partner.com');
    expect(isAllowedAffiliateHost('partner.com.',['partner.com'])).toBe(true);
    expect(isAllowedAffiliateHost('partner.com.evil.com',['partner.com'])).toBe(false);
  });
  it('validates URL shape without requiring an allowlist', () => {
    expect(assertAffiliateUrlShape('https://partner.com/course').href).toBe('https://partner.com/course');
    expect(()=>assertAffiliateUrlShape('http://partner.com/course')).toThrow('affiliate_https_required');
    expect(()=>assertAffiliateUrlShape('not a url')).toThrow('affiliate_destination_invalid');
  });
});
