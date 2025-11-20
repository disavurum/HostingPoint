/**
 * Get API URL based on environment
 * - If VITE_API_URL is set, use it
 * - If not localhost, use api.{hostname}
 * - Otherwise use localhost:3000
 */
export const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//api.${window.location.hostname}`;
  }
  
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

