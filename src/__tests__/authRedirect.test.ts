import { beforeEach, describe, expect, it } from 'vitest';
import { clearPostAuthRedirect, getPostAuthRedirect, setPostAuthRedirect } from '@/utils/authRedirect';

// Minimal sessionStorage for the node test environment
const store = new Map<string, string>();
(globalThis as any).sessionStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

describe('post-auth redirect', () => {
  beforeEach(() => store.clear());

  it('defaults to the dashboard', () => {
    expect(getPostAuthRedirect()).toBe('/history');
  });

  it('remembers an in-app path and can be cleared', () => {
    setPostAuthRedirect('/edit-resume/abc');
    expect(getPostAuthRedirect()).toBe('/edit-resume/abc');
    clearPostAuthRedirect();
    expect(getPostAuthRedirect()).toBe('/history');
  });

  it('refuses off-site and auth-page targets', () => {
    for (const bad of ['https://evil.com', '//evil.com', '/login', '/register/verify', 'javascript:alert(1)']) {
      setPostAuthRedirect(bad);
      expect(getPostAuthRedirect()).toBe('/history');
    }
  });
});
