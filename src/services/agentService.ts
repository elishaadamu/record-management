import axios, { apiUrl, API_CONFIG } from './api';

export interface AgentWithdrawalPayload {
  amount: number | string;
}

export interface UpdatePropertyStatusPayload {
  status: string;
  [key: string]: any;
}

export const agentService = {
  // Agent ER Statistics
  getErTotal: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.AGENT.ER_TOTAL));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getErWeekly: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.AGENT.ER_WEEKLY));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getErMonthly: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.AGENT.ER_MONTHLY));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Wallet and Withdrawals
  getWalletInfo: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.AGENT.WALLET));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  placeWithdrawal: async (payload: AgentWithdrawalPayload) => {
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AGENT.WITHDRAW), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Properties Management
  getProperties: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.AGENT.PROPERTIES));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  updatePropertyStatus: async (id: string, payload: UpdatePropertyStatusPayload) => {
    try {
      const response = await axios.put(apiUrl(API_CONFIG.ENDPOINTS.AGENT.UPDATE_PROPERTY_STATUS(id)), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};

export default agentService;
