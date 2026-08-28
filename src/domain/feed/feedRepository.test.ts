import { describe, expect, it } from 'vitest';
import { getFeedPostHref } from './feedRepository';

describe('getFeedPostHref', () => {
  it('accepts internal destinations and HTTPS links', () => {
    expect(getFeedPostHref('/app/corarios')).toBe('/app/corarios');
    expect(getFeedPostHref('https://example.com/resource')).toBe('https://example.com/resource');
  });

  it('rejects unsafe or malformed destinations', () => {
    expect(getFeedPostHref('//example.com')).toBeNull();
    expect(getFeedPostHref('http://example.com')).toBeNull();
    expect(getFeedPostHref('javascript:alert(1)')).toBeNull();
    expect(getFeedPostHref('not a url')).toBeNull();
  });
});
