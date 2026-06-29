import { describe, expect, it } from 'vitest';
import { getPostLoginRedirect } from './postLoginRedirect';

describe('getPostLoginRedirect', () => {
  it('sends admin users to the real admin dashboard', () => {
    expect(getPostLoginRedirect('admin')).toBe('/admin/dashboard');
    expect(getPostLoginRedirect('admin', '/app/perfil')).toBe('/admin/dashboard');
    expect(getPostLoginRedirect('admin', '/admin')).toBe('/admin/dashboard');
  });

  it('keeps member and premium users inside the normal app', () => {
    expect(getPostLoginRedirect('member')).toBe('/app');
    expect(getPostLoginRedirect('premium')).toBe('/app');
    expect(getPostLoginRedirect('member', '/admin/dashboard')).toBe('/app');
    expect(getPostLoginRedirect('premium', '/app/corarios')).toBe('/app/corarios');
  });
});
