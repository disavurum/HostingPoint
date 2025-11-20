import axios from 'axios';

/**
 * Get API URL based on environment
 * - If VITE_API_URL is set, use it
 * - If not localhost, use api.{hostname}
 * - Otherwise use localhost:3000
 */
export const getApiUrl = () => {
  // Always check at runtime, not at build time
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//api.${window.location.hostname}`;
  }
  
  return 'http://localhost:3000';
};

// Configure axios defaults - set dynamically at runtime
if (typeof window !== 'undefined') {
  axios.defaults.baseURL = getApiUrl();
} else {
  axios.defaults.baseURL = 'http://localhost:3000';
}

// Request interceptor: Add token to all requests automatically
axios.interceptors.request.use(
  (config) => {
    // Don't override if Authorization header is already set
    if (!config.headers.Authorization) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors globally
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid - clear storage
      localStorage.clear();
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

