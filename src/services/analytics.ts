type AnalyticsPayload = Record<string, unknown>;

const isLocal = import.meta.env.DEV;
const defaultApiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (isLocal
    ? `http://${window.location.hostname}:5001/api`
    : 'https://backend-resume-delta.vercel.app/api');

const endpoint =
  (import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined) ||
  `${defaultApiBase}/analytics/events`;

export const trackEvent = (event: string, payload: AnalyticsPayload = {}) => {
  const body = {
    event,
    payload,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  if (import.meta.env.DEV) {
    console.info('[analytics]', body);
  }

  if (!endpoint) return;

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Analytics dispatch failed:', error);
    }
  }
};

export const trackEventOncePerSession = (event: string, key: string, payload: AnalyticsPayload = {}) => {
  const storageKey = `analytics_once:${key}`;
  if (sessionStorage.getItem(storageKey) === 'true') return;
  sessionStorage.setItem(storageKey, 'true');
  trackEvent(event, payload);
};
