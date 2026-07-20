export function isAllowedAffiliateHost(hostname: string, allowedDomains: readonly string[]): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return allowedDomains.some((domain) => {
    const allowed = domain.toLowerCase().trim().replace(/^\.+|\.$/g, '');
    return Boolean(allowed) && (host === allowed || host.endsWith(`.${allowed}`));
  });
}

export function assertAllowedAffiliateDestination(destination: string, allowedDomains: readonly string[]): URL {
  let url: URL;
  try { url = new URL(destination); } catch { throw new Error('affiliate_destination_invalid'); }
  if (url.protocol !== 'https:') throw new Error('affiliate_https_required');
  if (url.username || url.password) throw new Error('affiliate_credentials_forbidden');
  if (!isAllowedAffiliateHost(url.hostname, allowedDomains)) throw new Error('affiliate_domain_forbidden');
  if (url.port && url.port !== '443') throw new Error('affiliate_port_forbidden');
  return url;
}
