import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskItem, ApprovalRequest, AuditLog, AppNotification, SystemSettings, UserRole, TaskStatus } from '../types';
import {
  INITIAL_TASKS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS
} from '../data/mockData';

interface DataContextType {
  tasks: TaskItem[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  settings: SystemSettings;
  createTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, data: Partial<TaskItem>) => void;
  deleteTask: (taskId: string) => void;
  createApprovalRequest: (request: Omit<ApprovalRequest, 'id' | 'requestedDate' | 'status'>) => void;
  respondToApproval: (approvalId: string, status: 'approved' | 'rejected', note?: string) => void;
  addAuditLog: (actorName: string, actorRole: UserRole, action: string, details: string, type?: AuditLog['type']) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (data: Partial<SystemSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_TASKS = 'ops_portal_tasks';
const STORAGE_KEY_APPROVALS = 'ops_portal_approvals';
const STORAGE_KEY_AUDIT = 'ops_portal_audit';
const STORAGE_KEY_NOTIFS = 'ops_portal_notifs';
const STORAGE_KEY_SETTINGS = 'ops_portal_settings';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPROVALS);
      return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
    } catch {
      return INITIAL_APPROVALS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPROVALS, JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const addAuditLog = (
    actorName: string,
    actorRole: UserRole,
    action: string,
    details: string,
    type: AuditLog['type'] = 'system'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium'
      }),
      actorName,
      actorRole,
      action,
      details,
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const createTask = (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newTask: TaskItem = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      commentsCount: 0
    };
    setTasks(prev => [newTask, ...prev]);

    // Send notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Task Assigned',
      message: `Task "${newTask.title}" assigned to ${newTask.assignedAgentName}.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'agent',
      type: 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const now = new Date().toISOString().split('T')[0];
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status, updatedAt: now } : t))
    );
  };

  const updateTask = (taskId: string, data: Partial<TaskItem>) => {
    const now = new Date().toISOString().split('T')[0];
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...data, updatedAt: now } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const createApprovalRequest = (
    requestData: Omit<ApprovalRequest, 'id' | 'requestedDate' | 'status'>
  ) => {
    const now = new Date().toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    const newRequest: ApprovalRequest = {
      ...requestData,
      id: `appr-${Date.now()}`,
      status: 'pending',
      requestedDate: now
    };
    setApprovals(prev => [newRequest, ...prev]);

    // Notify managers
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Approval Request Pending',
      message: `${newRequest.agentName} submitted a ${newRequest.type.toUpperCase()} request.`,
      timestamp: 'Just now',
      read: false,
      targetRole: 'manager',
      type: 'warning'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const respondToApproval = (
    approvalId: string,
    status: 'approved' | 'rejected',
    note?: string
  ) => {
    const now = new Date().toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    setApprovals(prev =>
      prev.map(a =>
        a.id === approvalId
          ? {
              ...a,
              status,
              responseNote: note,
              reviewedAt: now
            }
          : a
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateSettings = (data: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        approvals,
        auditLogs,
        notifications,
        settings,
        createTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        createApprovalRequest,
        respondToApproval,
        addAuditLog,
        markNotificationRead,
        clearNotifications,
        updateSettings
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
