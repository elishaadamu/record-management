import axios from 'axios';

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mk360.onrender.com/api',
  BASE_URL_DATA: process.env.NEXT_PUBLIC_API_BASE_URL_DATA || 'https://mk360.onrender.com/api',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/auth/register',
      SIGNIN: '/auth/login',
    },
  },
};

export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;
export const apiUrlData = (endpoint: string) => `${API_CONFIG.BASE_URL_DATA}${endpoint}`;

// Configure global axios default settings
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Global request interceptor to automatically attach authorization tokens if they exist in local storage
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ops_portal_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor to handle errors and extract default message
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default axios;
