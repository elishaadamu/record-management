import axios from 'axios';

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mk360.onrender.com/api',
  BASE_URL_DATA: process.env.NEXT_PUBLIC_API_BASE_URL_DATA || 'https://mk360.onrender.com/api',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/auth/register',
      SIGNIN: '/auth/login',
      ME: '/auth/me',
    },
    ADMIN: {
      ER_TOTAL: '/admin/dashboard/er/total',
      ER_WEEKLY: '/admin/dashboard/er/weekly',
      ER_MONTHLY: '/admin/dashboard/er/monthly',
      MANAGERS: '/admin/managers',
      MANAGER_DETAILS: (id: string) => `/admin/managers/${id}`,
      DELETE_MANAGER: (id: string) => `/admin/managers/${id}`,
      AGENTS: '/admin/agents',
      APPROVE_AGENT: (id: string) => `/admin/agents/${id}/approve`,
      DELETE_AGENT: (id: string) => `/admin/agents/${id}`,
      WALLET_CREDIT: '/admin/wallet/credit',
      WALLET_DEBIT: '/admin/wallet/debit',
      WITHDRAWALS_PENDING: '/admin/withdrawals/pending',
      APPROVE_WITHDRAWAL: (id: string) => `/admin/withdrawals/${id}/approve`,
      PROPERTIES: '/admin/properties',
      ASSIGN_PROPERTY: '/admin/er/assign',
    },
    MANAGER: {
      ER_TOTAL: '/manager/dashboard/er/total',
      ER_WEEKLY: '/manager/dashboard/er/weekly',
      ER_MONTHLY: '/manager/dashboard/er/monthly',
      AGENTS_PERFORMANCE: '/manager/agents/performance',
      WALLET: '/manager/wallet',
      WITHDRAW: '/manager/wallet/withdraw',
      PROPERTIES: '/manager/properties',
    },
    AGENT: {
      ER_TOTAL: '/agent/dashboard/er/total',
      ER_WEEKLY: '/agent/dashboard/er/weekly',
      ER_MONTHLY: '/agent/dashboard/er/monthly',
      WALLET: '/agent/wallet',
      WITHDRAW: '/agent/wallet/withdraw',
      PROPERTIES: '/agent/properties',
      UPDATE_PROPERTY_STATUS: (id: string) => `/agent/properties/${id}/status`,
    },
  },
};

export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;
export const apiUrlData = (endpoint: string) => `${API_CONFIG.BASE_URL_DATA}${endpoint}`;

// Configure global axios default settings
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

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
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default axios;
