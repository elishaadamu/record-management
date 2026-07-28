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

export interface ManagerPayload {
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

export interface WalletOperationPayload {
  userId: string;
  amount: number | string;
  description: string;
}

export interface AssignPropertyPayload {
  agentId: string;
  propertyName: string;
  propertyNumber: string;
}

export const adminService = {
  // ER Dashboard Statistics
  getErTotal: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.ER_TOTAL));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getErWeekly: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.ER_WEEKLY));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getErMonthly: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.ER_MONTHLY));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Manager Management
  createManager: async (payload: ManagerPayload) => {
    try {
      const sanitizedPayload = { ...payload };
      if (typeof sanitizedPayload.managerId === 'string' && !sanitizedPayload.managerId.trim()) {
        delete sanitizedPayload.managerId;
      }
      console.log('=== [adminService.createManager] Sending Request Payload ===', sanitizedPayload);
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.MANAGERS), sanitizedPayload);
      console.log('=== [adminService.createManager] Response Data ===', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== [adminService.createManager] Request Error ===', error?.response?.data || error?.response || error);
      throw error;
    }
  },
  getManagers: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.MANAGERS));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  getManagerDetails: async (id: string) => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.MANAGER_DETAILS(id)));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Wallet Operations
  creditWallet: async (payload: WalletOperationPayload) => {
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.WALLET_CREDIT), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  debitWallet: async (payload: WalletOperationPayload) => {
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.WALLET_DEBIT), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Withdrawals Management
  getPendingWithdrawals: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.WITHDRAWALS_PENDING));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  approveWithdrawal: async (id: string) => {
    try {
      const response = await axios.put(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.APPROVE_WITHDRAWAL(id)));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Properties Management & Assignment
  getProperties: async () => {
    try {
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.PROPERTIES));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  assignPropertyToAgent: async (payload: AssignPropertyPayload) => {
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.ADMIN.ASSIGN_PROPERTY), payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
