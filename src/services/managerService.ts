import axios, { apiUrl, API_CONFIG } from './api';

export interface RegisterAgentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  [key: string]: any;
}

export const managerService = {
  // Manager ER statistics
  getErTotal: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.ER_TOTAL));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getErWeekly: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.ER_WEEKLY));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getErMonthly: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.ER_MONTHLY));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Register agents
  registerAgent: async (payload: RegisterAgentPayload) => {
    try {
      // Re-use signup route
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Agents performance
  getAgentsPerformance: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.AGENTS_PERFORMANCE));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Wallet and withdrawal histories
  getWalletInfo: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.WALLET));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  placeWithdrawal: async (payload: { amount: number | string }) => {
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.WITHDRAW), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Manager agent properties
  getAssignedProperties: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.MANAGER.PROPERTIES));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
export default managerService;
