/** Unique id for list entries; falls back where crypto.randomUUID is unavailable (older browsers, http). */
export const newId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {}
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};
