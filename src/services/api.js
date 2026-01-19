import axios from 'axios';

// Determine the API base URL based on environment
const getBaseURL = () => {
  // In development, use proxy from vite.config.js
  if (import.meta.env.DEV) {
    return '/api';
  }
  // In production, use full URL or relative path
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    // Only redirect to login if it's not already the login page
    // and it's not the verify endpoint (to avoid redirect loop)
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      const isVerifyEndpoint = error.config?.url?.includes('/auth/verify');
      
      if (!isLoginPage && !isVerifyEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
