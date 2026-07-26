import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@types';
import { INITIAL_USERS, SYSTEM_PERMISSIONS } from '@data/mockData';
import axios from 'axios';
import { apiUrl, API_CONFIG } from '@/services/api';
import { encryptData, decryptData } from '@/lib/encryption';

export interface RegisterPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
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
  guarantors?: { name?: string; phone?: string; address?: string; state?: string; lga?: string; relationship?: string }[];
  nextOfKin?: { name?: string; phone?: string; address?: string; state?: string; lga?: string; relationship?: string };
  createdBy?: string;
  managerId?: string;
  [key: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string; data?: any }>;
  fetchCurrentUser: () => Promise<User | null>;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  hasPermission: (permissionName: string) => boolean;
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'ops_portal_current_user';
const STORAGE_KEY_ALL_USERS = 'ops_portal_all_users';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALL_USERS);
      const decrypted = decryptData(saved);
      return decrypted ? decrypted : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = decryptData(saved);
        if (parsed) {
          // Ensure user exists in users list
          const match = users.find(u => u.id === parsed.id);
          return match || parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ops_portal_token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await axios.get(apiUrl(API_CONFIG.ENDPOINTS.AUTH.ME), {
        headers,
        withCredentials: true
      });
      const resData = response.data;
      const dataObj = resData?.data || resData;
      const userPayload = dataObj?.user || resData?.user || dataObj;

      if (userPayload && typeof userPayload === 'object' && userPayload.email) {
        const firstName = userPayload.firstName || '';
        const lastName = userPayload.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || userPayload.name || userPayload.username || userPayload.email.split('@')[0];
        const userRole = (userPayload.role?.toLowerCase() as UserRole) || 'admin';

        const fetchedUser: User = {
          id: userPayload.id || userPayload._id || `u-${Date.now()}`,
          name: fullName,
          email: userPayload.email,
          role: userRole,
          avatar: userPayload.passportPhoto || userPayload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          department: userPayload.department || (userRole === 'admin' ? 'Executive Operations' : userRole === 'manager' ? 'Regional Operations' : 'Operations'),
          status: userPayload.status || 'active',
          title: userPayload.title || (userRole === 'admin' ? 'System Administrator' : userRole === 'manager' ? 'Senior Operations Manager' : 'Staff Member'),
          lastLogin: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
          phone: userPayload.phone,
          assignedManagerId: userPayload.assignedManagerId
        };
        setCurrentUser(fetchedUser);
        setUsers(prev => {
          const filtered = prev.filter(u => !u.id.startsWith('u-10'));
          const exists = filtered.some(u => u.id === fetchedUser.id);
          if (exists) return filtered.map(u => u.id === fetchedUser.id ? fetchedUser : u);
          return [fetchedUser, ...filtered];
        });
        return fetchedUser;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ops_portal_token');
    if (token && !currentUser) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ALL_USERS, encryptData(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, encryptData(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  const register = async (payload: RegisterPayload): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const response = await axios.post(apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), payload, { withCredentials: true });
      return { success: true, message: 'Registration successful', data: response.data };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Registration failed' };
    }
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNIN),
        { email, password },
        { withCredentials: true }
      );

      const resData = response.data;
      const dataObj = resData?.data || resData;
      const token = dataObj?.token || resData?.token || resData?.accessToken;
      const userPayload = dataObj?.user || resData?.user || dataObj;

      if (!token) {
        throw new Error(resData?.message || 'Incorrect email or password');
      }

      localStorage.setItem('ops_portal_token', token);

      let loggedInUser: User | null = null;
      if (userPayload && typeof userPayload === 'object' && userPayload.email) {
        const firstName = userPayload.firstName || '';
        const lastName = userPayload.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || userPayload.name || userPayload.username || email.split('@')[0];
        const userRole = (userPayload.role?.toLowerCase() as UserRole) || 'admin';

        loggedInUser = {
          id: userPayload.id || userPayload._id || `u-${Date.now()}`,
          name: fullName,
          email: userPayload.email,
          role: userRole,
          avatar: userPayload.passportPhoto || userPayload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          department: userPayload.department || (userRole === 'admin' ? 'Executive Operations' : userRole === 'manager' ? 'Regional Operations' : 'Operations'),
          status: userPayload.status || 'active',
          title: userPayload.title || (userRole === 'admin' ? 'System Administrator' : userRole === 'manager' ? 'Senior Operations Manager' : 'Staff Member'),
          lastLogin: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
          phone: userPayload.phone,
          assignedManagerId: userPayload.assignedManagerId
        };
      }

      if (!loggedInUser) {
        throw new Error('Failed to parse user details from response');
      }

      if (loggedInUser.status === 'suspended') {
        return { success: false, message: 'Account is suspended. Please contact the Admin.' };
      }

      setCurrentUser(loggedInUser);

      const activeUser = loggedInUser;
      setUsers(prev => {
        const filtered = prev.filter(u => !u.id.startsWith('u-10'));
        const exists = filtered.some(u => u.id === activeUser.id || u.email.toLowerCase() === activeUser.email.toLowerCase());
        if (exists) {
          return filtered.map(u => (u.id === activeUser.id || u.email.toLowerCase() === activeUser.email.toLowerCase()) ? activeUser : u);
        }
        return [activeUser, ...filtered];
      });

      return { success: true };
    } catch (error: any) {
      localStorage.removeItem('ops_portal_token');
      return { success: false, message: error?.message || 'Incorrect email or password' };
    }
  };

  const loginAsRole = async (role: UserRole) => {
    const targetUser = users.find(u => u.role === role && u.status === 'active') || users[0];
    if (targetUser) {
      await login(targetUser.email, 'password');
    }
  };

  const logout = () => {
    localStorage.removeItem('ops_portal_token');
    setCurrentUser(null);
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!currentUser) return false;
    const perm = SYSTEM_PERMISSIONS.find(p => p.name === permissionName || p.id === permissionName);
    if (!perm) return false;
    return Boolean((perm as any)[currentUser.role]);
  };

  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      lastLogin: 'Never'
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        fetchCurrentUser,
        loginAsRole,
        logout,
        hasPermission,
        addUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
