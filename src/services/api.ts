// frontend/services/api.ts
//  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL  // Your backend URL
const isLocal = import.meta.env.DEV;
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  if (!isLocal) {
    throw new Error('CRITICAL: VITE_API_BASE_URL is missing in production environment. Please set it in your hosting provider settings.');
  }
}

const FINAL_API_BASE_URL = API_BASE_URL || (isLocal ? `http://${window.location.hostname}:5001/api` : 'https://backend-resume-delta.vercel.app/api');

// https://backend-resume-delta.vercel.app/api

interface FetchOptions extends RequestInit {
  token?: string | null;
}

// Clerk session tokens expire after about a minute, so a token captured at
// sign-in goes stale mid-session. Ask Clerk for a current one per request
// (it caches and refreshes internally) and fall back to the caller's token.
const getFreshToken = async (): Promise<string | null> => {
  try {
    const session = (window as any).Clerk?.session;
    if (!session) return null;
    return (await session.getToken()) || null;
  } catch {
    return null;
  }
};

const apiRequest = async (endpoint: string, options: FetchOptions = {}) => {
  const { token: callerToken, ...fetchOptions } = options;
  // Only authenticated calls pass a `token` option; public ones stay anonymous
  const token = "token" in options ? (await getFreshToken()) ?? callerToken : callerToken;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }), // Add token if provided
    ...(fetchOptions.headers || {}),
  };

  try {
    const response = await fetch(`${FINAL_API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      // Try to parse error message from backend
      let errorData: { message?: string; msg?: string; errors?: Array<{ message?: string }> } = {
        message: `HTTP error! status: ${response.status}`,
      };
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if response is not JSON
      }
      const detailMessage = errorData.errors?.[0]?.message;
      throw new Error(
        errorData.message || errorData.msg || detailMessage || `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType) {
      return null;
    }
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;

  } catch (error: any) {
    console.error(`API request failed for endpoint: ${endpoint}`, error);
    
    // Check if it's a network error (like CORS or server down)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Network Error: Unable to connect to the server at ${FINAL_API_BASE_URL}. This is likely due to CORS restrictions or the server being offline. Please check your production environment variables.`
      );
    }
    
    throw error;
  }
};

export default apiRequest;
