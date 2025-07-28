// API Configuration
const API_CONFIG = {
  // Try deployed backend first, fallback to localhost for development
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://devapp-backend.onrender.com/api',
  timeout: 10000,
  
  // Fallback URLs in case primary fails
  fallbackURLs: [
    'https://devapp-backend.onrender.com/api',
    'http://localhost:4000/api'
  ]
};

export default API_CONFIG;
