import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS, SYSTEM_PERMISSIONS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
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
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure user exists in users list
        const match = users.find(u => u.id === parsed.id);
        return match || parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  const login = (email: string, _password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);
    
    if (!foundUser) {
      return { success: false, message: 'Invalid email address. Please check credentials or pick a demo user.' };
    }

    if (foundUser.status === 'suspended') {
      return { success: false, message: 'Account is suspended. Please contact the Admin.' };
    }

    const now = new Date().toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const updated = { ...foundUser, lastLogin: now };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    return { success: true };
  };

  const loginAsRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role && u.status === 'active') || users[0];
    if (targetUser) {
      login(targetUser.email);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!currentUser) return false;
    const perm = SYSTEM_PERMISSIONS.find(p => p.name === permissionName || p.id === permissionName);
    if (!perm) return false;
    return perm[currentUser.role];
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
