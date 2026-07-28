import axios, { apiUrl, API_CONFIG } from './api';

export interface GuarantorInfo {
  name?: string;
  phone?: string;
  address?: string;
  state?: string;
  lga?: string;
  relationship?: string;
}

export interface NextOfKinInfo {
  name?: string;
  phone?: string;
  address?: string;
  state?: string;
  lga?: string;
  relationship?: string;
}

export interface RegisterAgentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: string;
  gender?: string;
  dob?: string;
  maritalStatus?: string;
  address?: string;
  state?: string;
  lga?: string;
  bankName?: string;
  accNumber?: string;
  accountName?: string;
  nin?: string;
  passportPhoto?: string;
  guarantors?: GuarantorInfo | GuarantorInfo[];
  nextOfKin?: NextOfKinInfo;
  createdBy?: string;
  managerId?: string;
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
      const sanitizedPayload = { ...payload };
      if (typeof sanitizedPayload.managerId === 'string' && !sanitizedPayload.managerId.trim()) {
        delete sanitizedPayload.managerId;
      }
      if (typeof sanitizedPayload.createdBy === 'string' && !sanitizedPayload.createdBy.trim()) {
        delete sanitizedPayload.createdBy;
      }
      console.log('=== [managerService.registerAgent] Request Payload ===', sanitizedPayload);
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), sanitizedPayload);
      console.log('=== [managerService.registerAgent] Response ===', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== [managerService.registerAgent] Error ===', error?.response?.data || error?.response || error);
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
