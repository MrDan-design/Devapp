// Smart API Configuration that adapts to environment
const getApiBaseUrl = () => {
  // Check if we're on Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '/api';
  }
  
  // Use environment variable for local development
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
};

const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  
  // Fallback URLs in case primary fails
  fallbackURLs: [
    'http://localhost:4000/api'
  ]
};

export default API_CONFIG;
