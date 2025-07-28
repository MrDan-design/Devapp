// Smart API configuration that adapts to environment
const getApiBaseUrl = () => {
  // Check if we're on Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '/api';
  }
  
  // Use environment variable for local development
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const OAUTH_BASE_URL = API_BASE_URL;

console.log('API Configuration:', {
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  apiBaseUrl: API_BASE_URL,
  environment: import.meta.env.MODE
});
