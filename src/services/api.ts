// frontend/services/api.ts
//  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL  // Your backend URL
const isLocal = import.meta.env.DEV;
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (isLocal
    ? `http://${window.location.hostname}:5001/api`
    : 'https://backend-resume-delta.vercel.app/api');

// https://backend-resume-delta.vercel.app/api

interface FetchOptions extends RequestInit {
  token?: string | null;
}

const apiRequest = async (endpoint: string, options: FetchOptions = {}) => {
  const { token, ...fetchOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }), // Add token if provided
    ...(fetchOptions.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      // Try to parse error message from backend
      let errorData = { msg: `HTTP error! status: ${response.status}` }; // Default error
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore if response is not JSON
      }
      throw new Error(errorData.msg);
    }

    // Handle cases where the response might be empty (like DELETE)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType) { // 204 No Content
      return null;
    }
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    // Handle plain text response if necessary
    // return await response.text();
    return null; // Return null for unexpected content types

  } catch (error) {
    console.error(`API request failed for endpoint: ${endpoint}`, error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export default apiRequest;