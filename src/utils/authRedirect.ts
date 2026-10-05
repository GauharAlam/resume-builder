// Remembers where a signed-out visitor was trying to go so sign-in / sign-up
// can send them there afterwards. Session-scoped so it survives OAuth round trips
// but never leaks into a later visit.
const KEY = "post_auth_redirect";
const DEFAULT_PATH = "/history";

// Only same-site paths are accepted, so a crafted value can't redirect off-site
const isSafePath = (path: string | null): path is string =>
  !!path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/login") && !path.startsWith("/register");

export const setPostAuthRedirect = (path: string) => {
  if (!isSafePath(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {}
};

export const getPostAuthRedirect = (): string => {
  try {
    const stored = sessionStorage.getItem(KEY);
    return isSafePath(stored) ? stored : DEFAULT_PATH;
  } catch {
    return DEFAULT_PATH;
  }
};

export const clearPostAuthRedirect = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
};
